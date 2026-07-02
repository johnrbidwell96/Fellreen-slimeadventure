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

// Note: recalculateSlimePower should be defined in systems or called after full load
console.log('✅ state.js initialized');