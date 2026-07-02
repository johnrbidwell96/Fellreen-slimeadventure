/* ============================================
   STATE.JS
   Core game state, persistence, recalculations, and helpers.
   Single source of truth for all game data.
============================================ */

// Default / initial game state
const DEFAULT_GAME_STATE = {
    playerLevel: 1,
    playerExp: 0,
    playerExpToNext: 130,
    resources: {
        wood: 0, stone: 0, herbs: 0, berries: 0, jelly: 0, gold: 0,
        slimeEssence: 0, manaShards: 0, shadowEssence: 0, crystal: 0,
        refinedEssence: 0, divineShards: 0, arcaneDust: 0,
        trainingScrolls: 0, battleElixir: 0, healingSalve: 0,
        fertilityPotion: 0, focusElixir: 0, powerSerum: 0, alchemicalCatalyst: 0,
        explorerTonic: 0
    },
    slimes: [],
    player: {
        statPoints: 0,
        stats: { taming: 0, alchemy: 0, combat: 0, leadership: 0, endurance: 0 }
    },
    workshop: { incubator: 0, trainingHall: 0, refinery: 0 },
    globalPowerBonus: 1.0,
    battleElixirActive: false,
    voidTowerFloor: 1,
    lifetimeDivineShards: 0,
    lifetimeSlimesTamed: 0,
    highestLevel: 1,
    explorerTonicCharges: 0,
    lastSlimePartyTime: 0,
    partyPowerBonusUntil: 0,
    divineConvergenceCount: 0,
    party: [], // ids of slimes currently in the active party (used for exploration, dungeons, top bar)
    // Lifetime Records
    totalDamageDealt: 0,
    totalBossesDefeated: 0,
    totalDungeonsCleared: 0,
    totalFusions: 0,
    totalEvolutions: 0,
    mapProgress: {} // Will be populated on first use
};

// Main game state object (exported to window)
let game = { ...DEFAULT_GAME_STATE };

let currentBossId = null;
let selectedSlimeIds = [];
let selectedMissionId = null;
let missionTimerInterval = null;
let lastActionTime = 0;
const ACTION_COOLDOWN = 450; // ms

// Utility to check action cooldown (anti-spam)
function canPerformAction() {
    const now = Date.now();
    if (now - lastActionTime < ACTION_COOLDOWN) {
        return false;
    }
    lastActionTime = now;
    return true;
}

// Save / Load System
function saveGame() {
    try {
        localStorage.setItem('slimeAdventureSave', JSON.stringify(game));
        // Optional visual feedback handled in UI layer
        console.log('✅ Game saved!');
        return true;
    } catch (e) {
        console.error('Save failed:', e);
        return false;
    }
}

function loadGame() {
    try {
        const saved = localStorage.getItem('slimeAdventureSave');
        if (saved) {
            const loaded = JSON.parse(saved);
            
            // Deep merge with defaults for forward compatibility
            game = { ...DEFAULT_GAME_STATE, ...loaded };
            
            // Ensure nested objects
            if (!game.resources) game.resources = { ...DEFAULT_GAME_STATE.resources };
            if (!game.player) game.player = { ...DEFAULT_GAME_STATE.player };
            if (!game.workshop) game.workshop = { ...DEFAULT_GAME_STATE.workshop };
            if (!game.mapProgress) game.mapProgress = {};
            if (!game.party) game.party = [];

            // IMPORTANT: sync back to window after reassign, otherwise window.game points to stale object
            window.game = game;

            (window.sanitizeParty || (() => {}))();

            // Recalculate slime powers after load (important for balance changes)
            if (game.slimes && game.slimes.length > 0) {
                game.slimes.forEach(s => {
                    if (typeof recalculateSlimePower === 'function') {
                        recalculateSlimePower(s);
                    }
                });
            }

            console.log('✅ Game loaded successfully');
            return true;
        }
    } catch (e) {
        console.error('Load failed:', e);
    }
    return false;
}

function exportSave() {
    try {
        const dataStr = JSON.stringify(game);
        const encoded = btoa(unescape(encodeURIComponent(dataStr)));
        navigator.clipboard.writeText(encoded).then(() => {
            console.log('📤 Save exported to clipboard!');
        }).catch(() => {
            prompt('Copy this save string:', encoded);
        });
        return encoded;
    } catch (e) {
        console.error('Export failed:', e);
        return null;
    }
}

function importSave(encodedString) {
    if (!encodedString || encodedString.trim().length < 10) return false;
    
    try {
        let decoded;
        try {
            decoded = decodeURIComponent(escape(atob(encodedString.trim())));
        } catch {
            decoded = encodedString.trim(); // Fallback for raw JSON
        }

        const imported = JSON.parse(decoded);
        if (!imported || typeof imported !== 'object' || !imported.playerLevel) {
            console.error('Invalid save data');
            return false;
        }

        // Merge
        game = { ...DEFAULT_GAME_STATE, ...imported };

        window.game = game;  // sync after reassign

        // Re-hydrate
        if (game.slimes && game.slimes.length > 0) {
            game.slimes.forEach(s => {
                if (typeof recalculateSlimePower === 'function') recalculateSlimePower(s);
            });
        }

        // Ensure structures
        if (!game.resources) game.resources = { ...DEFAULT_GAME_STATE.resources };
        if (!game.player) game.player = { ...DEFAULT_GAME_STATE.player };
        if (!game.workshop) game.workshop = { ...DEFAULT_GAME_STATE.workshop };
        if (!game.mapProgress) game.mapProgress = {};
        if (!game.party) game.party = [];

        (window.sanitizeParty || (() => {}))();

        console.log('📥 Save imported successfully!');
        saveGame();
        return true;
    } catch (e) {
        console.error('Import failed:', e);
        return false;
    }
}

function resetGame() {
    if (!confirm('This will completely wipe your save. Are you sure?')) return;
    if (!confirm('Last warning: ALL progress will be lost. Proceed?')) return;

    try {
        localStorage.removeItem('slimeAdventureSave');
        localStorage.removeItem('slimeDarkMode');
    } catch (e) {}

    game = { ...DEFAULT_GAME_STATE };
    window.game = game;
    console.log('Game reset. Reloading...');
    setTimeout(() => location.reload(), 600);
}

// Auto-save
function startAutoSave() {
    setInterval(() => {
        saveGame();
    }, 30000);
}

// Make key functions globally available
window.game = game;
window.saveGame = saveGame;
window.loadGame = loadGame;
window.exportSave = exportSave;
window.importSave = importSave;
window.resetGame = resetGame;
window.canPerformAction = canPerformAction;
window.startAutoSave = startAutoSave;

// ============================================
// POWER & TRAIT HELPERS (moved here in Phase 0)
// ============================================

function getPartyPowerMultiplier() {
    if (game && game.partyPowerBonusUntil && Date.now() < game.partyPowerBonusUntil) {
        return 1.10;
    }
    return 1.0;
}

/** Persistent Party System */
function getParty() {
    const g = window.game || {};
    (window.sanitizeParty || (() => {}))();
    if (!g.party) g.party = [];
    const all = g.slimes || [];
    return all.filter(s => g.party.includes(s.id));
}

function getPartyPower() {
    return getParty().reduce((sum, s) => sum + (s.power || 0), 0);
}

function getMaxPartySize() {
    const g = window.game || {};
    const leadership = (g.player && g.player.stats && g.player.stats.leadership) || 0;
    // Slime army feel: base 10 + 1 per leadership point, up to 30 total
    const base = 10;
    const bonus = leadership;  // +1 party slot per leadership point
    return Math.min(30, base + bonus);
}

function isInParty(slimeId) {
    const g = window.game || {};
    (window.sanitizeParty || (() => {}))();
    return !!(g.party || []).includes(slimeId);
}

function togglePartyMember(slimeId) {
    const g = window.game || {};
    if (!g.party) g.party = [];
    (window.sanitizeParty || (() => {}))();
    const idx = g.party.indexOf(slimeId);
    if (idx >= 0) {
        g.party.splice(idx, 1);
        return true;
    } else {
        const max = getMaxPartySize();
        if (g.party.length >= max) {
            (window.log || console.log)(`Party is full (max ${max}). Remove a member first.`);
            return false;
        }
        g.party.push(slimeId);
        return true;
    }
}

function addToParty(slimeId) {
    const g = window.game || {};
    if (!g.party) g.party = [];
    (window.sanitizeParty || (() => {}))();
    if (g.party.includes(slimeId)) return true;
    const max = getMaxPartySize();
    if (g.party.length >= max) {
        (window.log || console.log)(`Party full (max ${max}).`);
        return false;
    }
    g.party.push(slimeId);
    return true;
}

function removeFromParty(slimeId) {
    const g = window.game || {};
    if (!g.party) return;
    g.party = g.party.filter(id => id !== slimeId);
}

/** Remove any stale party IDs that no longer exist in the collection (e.g. after fusing or releasing) */
function sanitizeParty() {
    const g = window.game || {};
    if (!g.party || g.party.length === 0) return;
    const validIds = new Set((g.slimes || []).map(s => s.id));
    const before = g.party.length;
    g.party = g.party.filter(id => validIds.has(id));
    if (g.party.length < before) {
        console.log(`[sanitizeParty] Cleaned ${before - g.party.length} stale party entries.`);
    }
}

function applyTraitEffects(slime) {
    if (!slime || !slime.traits || slime.traits.length === 0) return 1.0;
    let powerMultiplier = 1.0;
    slime.traits.forEach(traitKey => {
        if (traitKey === "combat_instinct") powerMultiplier *= 1.06;
        if (traitKey === "elemental_adept") powerMultiplier *= 1.12;
        if (traitKey === "combat_veteran") powerMultiplier *= 1.18;
        if (traitKey === "battle_hardened") powerMultiplier *= 1.25;
    });
    return powerMultiplier;
}

function getTrainingExpMultiplier(slime) {
    if (!slime || !slime.traits || slime.traits.length === 0) return 1.0;
    let multiplier = 1.0;
    slime.traits.forEach(traitKey => {
        if (traitKey === "quick_learner") multiplier *= 1.08;
        if (traitKey === "training_focused") multiplier *= 1.14;
        if (traitKey === "endurance_specialist") multiplier *= 1.22;
        if (traitKey === "training_prodigy") multiplier *= 1.30;
    });
    return multiplier;
}

function getJellyProductionBonus(slime) {
    if (!slime || !slime.traits || slime.traits.length === 0) return 0;
    let bonus = 0;
    slime.traits.forEach(traitKey => {
        if (traitKey === "jelly_producer") bonus += 1;
    });
    return bonus;
}

function getBreedingRarityBonus(slime) {
    if (!slime || !slime.traits || slime.traits.length === 0) return 0;
    let bonus = 0;
    slime.traits.forEach(traitKey => {
        if (traitKey === "stable_bloodline") bonus += 0.05;
        if (traitKey === "rare_lineage") bonus += 0.15;
    });
    return bonus;
}

/** Fair slime power calculation - core game balance */
function recalculateSlimePower(slime) {
    if (!slime || !slime.rarity) return;

    const rarityMulti = {
        "Common": 1.00,
        "Uncommon": 1.32,
        "Rare": 1.68,
        "Epic": 2.15,
        "Legendary": 2.85
    }[slime.rarity] || 1.0;

    let levelPower;
    if (slime.level <= 70) {
        levelPower = 22 + (slime.level * 1.85);
    } else {
        const excess = slime.level - 70;
        levelPower = 22 + (70 * 1.85) + (excess * 0.55) + (Math.sqrt(excess) * 4.2);
    }

    let power = Math.floor(levelPower * rarityMulti);

    if (slime.evolved) {
        power = Math.floor(power * 1.28);
    }

    if (power > 1350) {
        const excess = power - 1350;
        power = 1350 + Math.floor(Math.pow(excess, 0.58) * 7.5);
    }
    if (power > 8500) power = 8500 + Math.floor((power - 8500) * 0.15);

    const traitMultiplier = applyTraitEffects(slime);
    power = Math.floor(power * traitMultiplier);

    slime.power = Math.max(12, power);
}

// Expose
window.recalculateSlimePower = recalculateSlimePower;
window.applyTraitEffects = applyTraitEffects;
window.getPartyPowerMultiplier = getPartyPowerMultiplier;
window.getTrainingExpMultiplier = getTrainingExpMultiplier;
window.getJellyProductionBonus = getJellyProductionBonus;
window.getBreedingRarityBonus = getBreedingRarityBonus;

window.getParty = getParty;
window.getPartyPower = getPartyPower;
window.getMaxPartySize = getMaxPartySize;
window.isInParty = isInParty;
window.togglePartyMember = togglePartyMember;
window.addToParty = addToParty;
window.removeFromParty = removeFromParty;
window.sanitizeParty = sanitizeParty;

console.log('✅ state.js initialized (Phase 0)');