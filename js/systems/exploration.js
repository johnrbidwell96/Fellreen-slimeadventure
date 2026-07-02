/* ============================================
   SYSTEMS / EXPLORATION.JS
   Map, node progression, exploration, and farming logic.
   Phase 0 extraction.
============================================ */

// These functions were previously in index.html

// Centralized map progress (source of truth, synced to window.game)
function getMapProgress(region) {
    const g = window.game || (window.game = {});
    if (!g.mapProgress) g.mapProgress = {};
    if (!g.mapProgress[region]) {
        // Seed correct first node per region (fixes shadowfen etc showing no nodes unlocked)
        const first = (region === 'greenwild') ? 'gw1' :
                      (region === 'crystal') ? 'cm1' :
                      (region === 'shadowfen') ? 'sf1' :
                      (region === 'volcanic') ? 'vw1' :
                      (region === 'celestial') ? 'cp1' : 'gw1';
        g.mapProgress[region] = {
            cleared: [],
            unlocked: [first]
        };
    }
    return g.mapProgress[region];
}

function isNodeUnlocked(region, nodeId) {
    const progress = getMapProgress(region);
    return progress.unlocked.includes(nodeId);
}

function isNodeCleared(region, nodeId) {
    const progress = getMapProgress(region);
    return progress.cleared.includes(nodeId);
}

function clearNode(region, nodeId) {
    console.log('[DEBUG clearNode]', region, nodeId);
    const progress = getMapProgress(region);
    if (!progress.cleared.includes(nodeId)) {
        progress.cleared.push(nodeId);
    }
    const regionData = (window.MAP_DATA && window.MAP_DATA[region]);
    if (regionData) {
        const currentIndex = regionData.nodes.findIndex(n => n.id === nodeId);
        if (currentIndex !== -1 && currentIndex < regionData.nodes.length - 1) {
            const next = regionData.nodes[currentIndex + 1].id;
            if (!progress.unlocked.includes(next)) {
                progress.unlocked.push(next);
            }
        }
    }
    console.log('[DEBUG after clear]', progress);
}

// Expose
window.getMapProgress = getMapProgress;
window.isNodeUnlocked = isNodeUnlocked;
window.isNodeCleared = isNodeCleared;
window.clearNode = clearNode;

function renderMap(region = "greenwild") {
    const container = document.getElementById('map-greenwild');
    let mapData = window.MAP_DATA || {};
    if (!mapData[region] && window.MAP_DATA && window.MAP_DATA[region]) {
        mapData = window.MAP_DATA;
    }
    if (!container || !mapData[region]) {
        console.warn('[DEBUG renderMap] No mapData for region', region);
        return;
    }
    container.innerHTML = '';

    const regionData = mapData[region];
    const progress = getMapProgress(region);

    // Region switcher
    const switcher = document.createElement('div');
    switcher.style.cssText = 'width:100%; margin-bottom:12px; display:flex; gap:8px;';
    const gp = getMapProgress;
    switcher.innerHTML = `
        <button onclick="renderMap('greenwild')" style="flex:1; padding:6px; font-size:11px; ${region === 'greenwild' ? 'background:#1a4422; border-color:#aaff99;' : ''}">🌲 Greenwild</button>
        <button onclick="renderMap('crystal')" style="flex:1; padding:6px; font-size:11px; ${region === 'crystal' ? 'background:#1a4422; border-color:#aaff99;' : ''}" ${(gp('greenwild').cleared || []).includes('gw4') ? '' : 'disabled style="opacity:0.5;"'}>⛰️ Crystal</button>
        <button onclick="renderMap('shadowfen')" style="flex:1; padding:6px; font-size:11px; ${region === 'shadowfen' ? 'background:#1a4422; border-color:#aaff99;' : ''}" ${(gp('crystal').cleared || []).includes('cm3') ? '' : 'disabled style="opacity:0.5;"'}>🌿 Shadowfen</button>
        <button onclick="renderMap('volcanic')" style="flex:1; padding:6px; font-size:11px; ${region === 'volcanic' ? 'background:#1a4422; border-color:#aaff99;' : ''}" ${(gp('shadowfen').cleared || []).includes('sf6') ? '' : 'disabled style="opacity:0.5;"'}>🌋 Volcanic</button>
        <button onclick="renderMap('celestial')" style="flex:1; padding:6px; font-size:11px; ${region === 'celestial' ? 'background:#1a4422; border-color:#aaff99;' : ''}" ${(gp('volcanic').cleared || []).includes('vw5') ? '' : 'disabled style="opacity:0.5;"'}>✨ Celestial</button>
    `;
    container.appendChild(switcher);

    regionData.nodes.forEach((node, index) => {
        const isUnlocked = progress.unlocked.includes(node.id);
        const isCleared = progress.cleared.includes(node.id);

        const div = document.createElement('div');
        div.style.cssText = `
            width: 155px; min-height: 105px;
            background: ${isCleared ? '#1a3a22' : isUnlocked ? '#113322' : '#0a1f18'};
            border: 3px solid ${isCleared ? '#4ade80' : isUnlocked ? '#77ffaa' : '#555'};
            border-radius: 12px; padding: 11px 10px;
            cursor: ${isUnlocked ? 'pointer' : 'not-allowed'};
            opacity: ${isUnlocked ? '1' : '0.5'};
            transition: all 0.2s ease; position: relative;
        `;

        let statusHTML = '';
        if (isCleared) {
            statusHTML = `<div style="position:absolute; top:5px; right:7px; color:#4ade80; font-size:16px;">✅</div>`;
        } else if (!isUnlocked) {
            statusHTML = `<div style="position:absolute; top:5px; right:7px; color:#888; font-size:14px;">🔒</div>`;
        }

        div.innerHTML = `
            ${statusHTML}
            <div style="font-weight:bold; font-size:12px; margin-bottom:3px;">${node.name}</div>
            <div style="font-size:10px; color:#ffdd88;">${node.baseDifficulty}</div>
            <div style="font-size:9px; margin-top:5px; opacity:0.85; line-height:1.3;">${node.reward}</div>
        `;

        if (isUnlocked) {
            if (isCleared) {
                div.onclick = () => {
                    console.log('[DEBUG] Cleared node clicked for farm:', region, node.id);
                    farmClearedNode(region, node);
                };
            } else {
                div.onclick = () => {
                    const diff = (window.currentMapDifficulty || "Easy");
                    console.log('[DEBUG] Explore node clicked:', region, node.id, 'diff:', diff);
                    exploreNode(region, node.id, diff);
                };
            }
        }

        container.appendChild(div);

        if (index < regionData.nodes.length - 1) {
            const line = document.createElement('div');
            line.style.cssText = `width:22px; height:3px; background:#77ffaa; align-self:center; margin-top:45px; opacity:0.4;`;
            container.appendChild(line);
        }
    });

    if (typeof window.updateMapQuickStats === 'function') window.updateMapQuickStats();

    // remember current for auto button etc.
    window.currentMapRegion = region;
}

function updateMapQuickStats() {
    const el = document.getElementById('mapQuickStats');
    const mapData = window.MAP_DATA || {};
    if (!el || Object.keys(mapData).length === 0) return;

    let totalCleared = 0;
    let totalNodes = 0;

    Object.keys(mapData).forEach(regionKey => {
        const progress = getMapProgress(regionKey);
        const regionData = mapData[regionKey];
        totalCleared += (progress.cleared || []).length;
        totalNodes += (regionData.nodes || []).length;
    });

    const partyPwr = (typeof getPartyPower === 'function') ? getPartyPower() : 0;
    el.innerHTML = `${totalCleared} / ${totalNodes} nodes cleared<br><small>Party Power: ${partyPwr}</small>`;
}

function exploreNode(region, nodeId, difficulty) {
    console.log('[DEBUG] exploreNode entered:', region, nodeId, difficulty);
    let mapData = window.MAP_DATA || (window.MAP_DATA = {});
    let node = (mapData[region] && mapData[region].nodes) ? mapData[region].nodes.find(n => n.id === nodeId) : null;

    // Robust fallback for node
    if (!node) {
        if (mapData[region] && mapData[region].nodes && mapData[region].nodes.length > 0) {
            // use first or construct
            node = mapData[region].nodes.find(n => n.id === nodeId) || { id: nodeId, name: nodeId };
        } else {
            node = { id: nodeId, name: nodeId };
        }
        // try to refresh mapData from constants if available
        if ((!mapData[region] || !mapData[region].nodes) && window.MAP_DATA && window.MAP_DATA[region]) {
            mapData = window.MAP_DATA;
            node = mapData[region].nodes.find(n => n.id === nodeId) || node;
        }
    }

    // Use local doExplore (moved to this file).
    let targetDoExplore = (typeof doExplore === 'function') ? doExplore : window.doExplore;
    if (typeof targetDoExplore !== 'function') {
        console.error('[DEBUG] doExplore not found locally, searching window...');
        for (let key in window) {
            if (key.toLowerCase().includes('doexplore') && typeof window[key] === 'function') {
                targetDoExplore = window[key];
                window.doExplore = targetDoExplore;
                break;
            }
        }
    }

    console.log('[DEBUG] node lookup result:', !!node, 'doExplore available:', typeof targetDoExplore);

    if (!node || typeof targetDoExplore !== 'function') {
        console.warn('[DEBUG] exploreNode early return - node or doExplore missing.', {node: !!node, hasDo: typeof targetDoExplore});
        if (typeof window.log === 'function') {
            window.log('Explore failed to trigger (debug: missing doExplore or node) - see console');
        }
        // Last resort: if we have node data, still try to proceed with a safe doExplore
        if (node && typeof window.doExplore === 'function') {
            targetDoExplore = window.doExplore;
        } else {
            return;
        }
    }

    // ensure on window
    window.doExplore = targetDoExplore;


    let expMin = 8, expMax = 14;
    if (difficulty === "Normal") { expMin = 13; expMax = 19; }
    if (difficulty === "Hard")   { expMin = 20; expMax = 29; }

    const mappedDiff = (difficulty === "Easy") ? "Easy" : (difficulty === "Normal") ? "Medium" : "Hard";
    console.log('[DEBUG] calling doExplore with', mappedDiff, node.name);
    targetDoExplore(mappedDiff, node.name, expMin, expMax);
    console.log('[DEBUG] doExplore returned');

    setTimeout(() => {
        console.log('[DEBUG exploreNode timeout] clearing', region, nodeId);
        clearNode(region, nodeId);

        const after = getMapProgress(region);
        console.log('[DEBUG after clear re-render]', {cleared: after.cleared, unlocked: after.unlocked});

        // Cross-region unlocks (fix for crystal -> shadowfen etc.)
        if (nodeId === "gw4") {
            const cp = getMapProgress("crystal");
            if (cp && !cp.unlocked.includes("cm1")) {
                cp.unlocked.push("cm1");
                (window.log || console.log)("New region unlocked: Crystal Mountains!");
            }
        }
        if (nodeId === "cm3") {
            const p = getMapProgress("shadowfen");
            if (p && !p.unlocked.includes("sf1")) {
                p.unlocked.push("sf1");
                if (typeof window.log === 'function') {
                    window.log("🌿 Shadowfen Swamp unlocked! Switch to Map tab / refresh to see new region button.");
                } else {
                    console.log("New region unlocked: Shadowfen Swamp!");
                }
            }
        }
        if (nodeId === "sf6") {
            const p = getMapProgress("volcanic");
            if (p && !p.unlocked.includes("vw1")) {
                p.unlocked.push("vw1");
                (window.log || console.log)("New region unlocked: Volcanic Wastes!");
            }
        }
        if (nodeId === "vw5") {
            const p = getMapProgress("celestial");
            if (p && !p.unlocked.includes("cp1")) {
                p.unlocked.push("cp1");
                (window.log || console.log)("New region unlocked: Celestial Peaks!");
            }
        }

        // Re-render the map (current view) so the region switcher buttons update their enabled/grey state immediately.
        // This ensures the Shadowfen (and later) buttons un-grey after clearing the prereq node.
        const viewToShow = window.currentMapRegion || region || 'greenwild';
        if (typeof renderMap === 'function') renderMap(viewToShow);
        if (typeof window.updateMapQuickStats === 'function') window.updateMapQuickStats();
    }, 900);
}

function farmClearedNode(region, node) {
    // uses local doExplore (defined in this file)
    const diff = window.currentMapDifficulty || "Easy";
    const reduction = (diff === "Hard") ? 0.55 : 0.70;

    let expMin = 8, expMax = 14;
    if (diff === "Normal") { expMin = 13; expMax = 19; }
    if (diff === "Hard")   { expMin = 20; expMax = 29; }

    const finalMin = Math.floor(expMin * reduction);
    const finalMax = Math.floor(expMax * reduction);

    doExplore((diff === "Hard") ? "Hard" : "Medium", node.name, finalMin, finalMax);

    // loot table bonus
    const lootTables = window.REGION_LOOT_TABLES || {};
    const lootTable = lootTables[region];
    if (lootTable && Math.random() < lootTable.bonusChance && window.game) {
        const resList = lootTable.resources || [];
        const resource = resList[Math.floor(Math.random() * resList.length)];
        if (window.game.resources && window.game.resources[resource] !== undefined) {
            window.game.resources[resource] = (window.game.resources[resource] || 0) + (2 + Math.floor(Math.random() * 3));
        }
    }

    console.log(`Farmed ${node.name}`); // no bottom toast, use popups for resource feedback
    setTimeout(() => {
        if (typeof window.renderMap === 'function') window.renderMap(region);
    }, 400);
}

function autoExploreClearedNodes() {
    const region = window.currentMapRegion || "greenwild";
    const mapData = window.MAP_DATA || {};
    if (!mapData[region]) return;
    const progress = getMapProgress(region);
    const regionData = mapData[region];

    let explored = 0;
    (regionData.nodes || []).forEach(node => {
        if ((progress.cleared || []).includes(node.id)) {
            doExplore("Medium", node.name, 10, 16);
            explored++;
        }
    });

    const l = window.log;
    if (explored > 0 && typeof l === 'function') {
        l(`Auto-explored ${explored} cleared node(s) in ${region}.`);
        setTimeout(() => { if (typeof window.renderMap === 'function') window.renderMap(region); }, 1200);
    } else if (typeof l === 'function') {
        l(`No cleared nodes to auto-explore yet in ${region}.`);
    }
}

function cycleMapDifficulty() {
    if (!window.currentMapDifficulty) window.currentMapDifficulty = "Easy";

    let cd = window.currentMapDifficulty;
    if (cd === "Easy") cd = "Normal";
    else if (cd === "Normal") cd = "Hard";
    else cd = "Easy";
    window.currentMapDifficulty = cd;

    const display = document.getElementById('mapDifficultyDisplay');
    if (display) display.innerText = cd;
}

let autoFarmInterval = null;

function toggleAutoFarm() {
    const l = window.log || function(m){console.log(m);};
    if (autoFarmInterval) {
        clearInterval(autoFarmInterval);
        autoFarmInterval = null;
        l("Auto Farm stopped.");
        return;
    }
    // basic implementation - full version stays in index for now or can be expanded
    l("Auto Farm (basic) started from systems module.");
    // For full fidelity, the original implementation in index.html can call into these helpers.
}

function getRegionRewardMultiplier(region) {
    const multipliers = { greenwild: 1.0, crystal: 1.08, shadowfen: 1.16, volcanic: 1.24, celestial: 1.35 };
    return multipliers[region] || 1.0;
}

function getRegionEnemyPower(region) {
    const powers = { greenwild: 320, crystal: 520, shadowfen: 780, volcanic: 1050, celestial: 1450 };
    return powers[region] || 350;
}

// ============================================
// MOVED FROM index.html: core exploration logic
// Now defined here so everything is connected in one module.
// Use window. for cross-module globals during transition.
// ============================================

function canExploreArea(areaId) {
    const area = (window.UNLOCKABLE_AREAS || []).find(a => a.id === areaId);
    if (!area) return false;
    const g = window.game || {};
    if ((g.playerLevel || 1) < area.level) {
        (window.log || console.log)(`Requires Player Level ${area.level}`);
        return false;
    }
    return true;
}

// Old direct explore helpers (kept for compatibility, main map uses nodes + exploreNode)
function exploreForest() { doExplore("Easy", "Forest", 5, 9); }
function exploreTown() { doExplore("Easy", "Town", 5, 8); }
function explorePlains() { doExplore("Easy", "Plains", 6, 10); }
function exploreMountain() { if (!canExploreArea("mountain")) return; doExplore("Medium", "Mountain", 10, 14); }
function exploreLake() { if (!canExploreArea("lake")) return; doExplore("Medium", "Crystal Lake", 9, 13); }
function exploreCave() { if (!canExploreArea("cave")) return; doExplore("Medium", "Cave", 10, 15); }
function exploreSwamp() { if (!canExploreArea("swamp")) return; doExplore("Hard", "Swamp", 16, 22); }
function exploreRuins() { if (!canExploreArea("ruins")) return; doExplore("Hard", "Ancient Ruins", 15, 21); }
function exploreGrove() { if (!canExploreArea("grove")) return; doExplore("Hard", "Mystic Grove", 17, 23); }
function exploreVolcano() { if (!canExploreArea("volcano")) return; doExplore("Extreme", "Volcano", 24, 32); }
function exploreTundra() { if (!canExploreArea("tundra")) return; doExplore("Extreme", "Frozen Tundra", 23, 31); }
function exploreAbyss() { if (!canExploreArea("abyss")) return; doExplore("Extreme", "Abyssal Depths", 28, 38); }
function exploreSpire() { if (!canExploreArea("spire")) return; doExplore("Extreme", "Celestial Spire", 30, 42); }
function exploreVoid() { if (!canExploreArea("void")) return; doExplore("Extreme", "Void Realm", 32, 45); }
function exploreGarden() { if (!canExploreArea("garden")) return; doExplore("Extreme", "Eternal Garden", 34, 48); }
function exploreNexus() { if (!canExploreArea("nexus")) return; doExplore("Extreme", "Origin Nexus", 36, 52); }

function generateRandomSlime(difficulty = "Easy", useFertility = false) {
    let rarityRoll = Math.random();
    const g = window.game || {};
    const tamingBonus = ((g.player && g.player.stats && g.player.stats.taming) || 0) * 0.03;
    rarityRoll = Math.max(0, rarityRoll - tamingBonus);

    if (useFertility) {
        rarityRoll = Math.max(0, rarityRoll - 0.25);
    }

    let rarity;
    if (difficulty === "Easy") {
        rarity = (rarityRoll < 0.68) ? "Common" : (rarityRoll < 0.90) ? "Uncommon" : "Rare";
    } else if (difficulty === "Medium") {
        rarity = (rarityRoll < 0.42) ? "Common" : (rarityRoll < 0.78) ? "Uncommon" : (rarityRoll < 0.95) ? "Rare" : "Epic";
    } else if (difficulty === "Hard") {
        rarity = (rarityRoll < 0.22) ? "Common" : (rarityRoll < 0.58) ? "Uncommon" : (rarityRoll < 0.86) ? "Rare" : (rarityRoll < 0.96) ? "Epic" : "Legendary";
    } else {
        rarity = (rarityRoll < 0.12) ? "Common" : (rarityRoll < 0.42) ? "Uncommon" : (rarityRoll < 0.72) ? "Rare" : (rarityRoll < 0.91) ? "Epic" : "Legendary";
    }

    const elems = window.elements || window.ELEMENTS || [];
    const nameMap = window.names || window.ELEMENT_NAMES || {};
    const element = elems[Math.floor(Math.random() * elems.length)] || "Water";
    const name = (nameMap[element] && nameMap[element][0]) || "Slime";

    const slime = {
        id: Date.now() + Math.floor(Math.random() * 10000),
        name: name,
        element: element,
        level: 1,
        exp: 0,
        power: 0,
        rarity: rarity,
        evolutionLevel: 0,
        onMission: false
    };

    (window.recalculateSlimePower || recalculateSlimePower || (() => {}))(slime);
    (window.generateTraitsForSlime || generateTraitsForSlime || (() => {}))(slime);

    if (difficulty === "Extreme") {
        slime.power = Math.floor(slime.power * 1.12);
    }

    return slime;
}

function gainPlayerExp(amount) {
    const g = window.game || {};
    const oldLevel = g.playerLevel || 1;
    g.playerExp = (g.playerExp || 0) + amount;
    let leveledUp = false;

    const toNext = g.playerExpToNext || 130;
    while (g.playerExp >= toNext) {
        g.playerExp -= toNext;
        g.playerLevel = (g.playerLevel || 1) + 1;
        g.playerExpToNext = Math.floor(100 + (g.playerLevel * 105) + Math.pow(g.playerLevel, 1.78) * 16);
        if (g.player) g.player.statPoints = (g.player.statPoints || 0) + 1;

        const milestones = window.MILESTONES || [];
        milestones.forEach(m => {
            if (oldLevel < m.level && (g.playerLevel || 1) >= m.level) {
                if (m.effect) m.effect();
                (window.log || console.log)(`🌟 Milestone Unlocked: Level ${m.level} — ${m.name}`);
            }
        });

        if ((g.playerLevel || 1) > (g.highestLevel || 1)) g.highestLevel = g.playerLevel;
        leveledUp = true;
        (window.log || console.log)(`✨ Player Level Up! You are now Level ${g.playerLevel}!`);
    }

    (window.updateSummary || (() => {}))();

    if (leveledUp) {
        (window.updateExploreLocks || (() => {}))();
        (window.updateDungeonLocks || (() => {}))();
        (window.updateBossLocks || (() => {}))();
        (window.updateUI || (() => {}))();
        (window.updateEndgameUI || (() => {}))();
    }
}

function doExplore(difficulty, location, minExp, maxExp) {
    console.log('[DEBUG] doExplore called', difficulty, location);
    const canAct = window.canPerformAction || (() => true);
    if (!canAct()) {
        console.log('[DEBUG] doExplore blocked by cooldown');
        return;
    }
    const g = window.game || {};
    let gotSlime = false;

    // Party-based power now influences exploration
    const partyPower = (typeof getPartyPower === 'function') ? getPartyPower() : 0;
    const partyBonus = Math.min(0.22, partyPower / 4200); // up to ~+22% from strong party

    // Inverse to difficulty: Easy = high catch (good for taming), Hard/Extreme = lower catch but better other rewards
    let slimeChance = 0.85;  

    if (difficulty === "Medium") slimeChance = 0.65;
    else if (difficulty === "Hard") slimeChance = 0.45;
    else if (difficulty === "Extreme") slimeChance = 0.30;

    slimeChance = Math.min(0.96, slimeChance + partyBonus);

    const g2 = g;
    let tonicBonus = 0;
    if (g2.explorerTonicCharges > 0) {
        tonicBonus = 0.15;
        slimeChance = Math.min(0.95, slimeChance + tonicBonus);
        g2.explorerTonicCharges--;
        console.log("Explorer's Tonic active! Better results this exploration."); // console to keep bottom clean; popups for main gains
    }

    const roll = Math.random();
    console.log('[DEBUG] slime roll (inverse difficulty):', roll.toFixed(2), '<', slimeChance, '?', roll < slimeChance);
    let newlyTamed = null;
    if (roll < slimeChance) {
        const gen = window.generateRandomSlime || generateRandomSlime;
        const slime = gen(difficulty);
        if (slime) {
            g.slimes = g.slimes || [];
            g.slimes.push(slime);
            g.lifetimeSlimesTamed = (g.lifetimeSlimesTamed || 0) + 1;
            gotSlime = true;
            newlyTamed = slime;
        }
    }

    const expGain = Math.floor(minExp + Math.random() * (maxExp - minExp));
    (window.gainPlayerExp || gainPlayerExp)(expGain);

    let resourcesGained = [];
    const baseResChance = difficulty === "Easy" ? 0.68 : 
                          difficulty === "Medium" ? 0.78 : 
                          difficulty === "Hard" ? 0.85 : 0.92;

    // Stronger parties find more resources
    const resMult = 1 + Math.min(0.6, partyPower / 2800);

    const gg = g;
    if (!gg.resources) gg.resources = {};

    if (Math.random() < baseResChance) {
        const amt = Math.floor((2 + Math.random() * 3) * resMult);
        gg.resources.wood = (gg.resources.wood || 0) + amt;
        resourcesGained.push(`${amt} Wood`);
    }
    if (Math.random() < baseResChance * 0.85) {
        const amt = Math.floor((1 + Math.random() * 2) * resMult);
        gg.resources.jelly = (gg.resources.jelly || 0) + amt;
        resourcesGained.push(`${amt} Jelly`);
    }
    if (Math.random() < baseResChance * 0.7) {
        const amt = Math.floor((1 + Math.random() * 2) * resMult);
        gg.resources.herbs = (gg.resources.herbs || 0) + amt;
        resourcesGained.push(`${amt} Herbs`);
    }
    if (Math.random() < baseResChance * 0.6) {
        const amt = Math.floor((1 + Math.random() * 2) * resMult);
        gg.resources.stone = (gg.resources.stone || 0) + amt;
        resourcesGained.push(`${amt} Stone`);
    }

    if (difficulty === "Hard" || difficulty === "Extreme") {
        if (Math.random() < 0.55) {
            const cAmt = Math.floor(2 * resMult);
            gg.resources.crystal = (gg.resources.crystal || 0) + cAmt;
            resourcesGained.push(`${cAmt} Crystal`);
        }
        if (Math.random() < 0.38) {
            const aAmt = Math.floor(1 * resMult);
            gg.resources.arcaneDust = (gg.resources.arcaneDust || 0) + aAmt;
            resourcesGained.push(`${aAmt} Arcane Dust`);
        }
    }

    let msg = `Explored ${location}.`;
    if (gotSlime) msg += " Tamed a new slime!";
    if (!gotSlime && resourcesGained.length === 0) {
        msg += " Nothing special this time.";
    }

    console.log(msg); // no bottom toast for exploration results — front-and-center popups (showResourceGain / reveal) are the only UI feedback for resources and slimes
    (window.updateUI || (() => {}))();
    console.log('[DEBUG] doExplore finished, newlyTamed:', !!newlyTamed);

    if (resourcesGained.length > 0) {
        setTimeout(() => {
            const resFn = window.showResourceGain || (() => {});
            if (gotSlime && newlyTamed) {
                resFn(location, resourcesGained, () => {
                    const reveal = window.showNewSlimeReveal || (() => {});
                    reveal(newlyTamed);
                });
            } else {
                resFn(location, resourcesGained);
                if (newlyTamed) {
                    const reveal = window.showNewSlimeReveal || (() => {});
                    reveal(newlyTamed);
                }
            }
        }, 220);
    } else if (newlyTamed) {
        setTimeout(() => {
            const reveal = window.showNewSlimeReveal || (() => {});
            reveal(newlyTamed);
        }, 220);
    }
}

// Export / expose
window.renderMap = renderMap;
window.exploreNode = exploreNode;
window.farmClearedNode = farmClearedNode;
window.autoExploreClearedNodes = autoExploreClearedNodes;
window.cycleMapDifficulty = cycleMapDifficulty;
window.toggleAutoFarm = toggleAutoFarm;
window.getRegionRewardMultiplier = getRegionRewardMultiplier;
window.getRegionEnemyPower = getRegionEnemyPower;
window.updateMapQuickStats = updateMapQuickStats;
window.doExplore = doExplore;
window.generateRandomSlime = generateRandomSlime;
window.gainPlayerExp = gainPlayerExp;
window.canExploreArea = canExploreArea;

function generateTraitsForSlime(slime) {
    if (!slime || slime.traits) return; // Already has traits or invalid

    const defs = window.TRAIT_DEFINITIONS || {};
    const getChance = window.getTraitChanceByRarity || (() => ({chance: 0.3, rarePlus: 0.15}));
    const rarityInfo = getChance(slime.rarity);
    slime.traits = [];

    // Roll for first trait
    if (Math.random() < rarityInfo.chance) {
        const tierRoll = Math.random();
        let possibleTiers = ["Common"];

        if (tierRoll < rarityInfo.rarePlus) {
            possibleTiers = ["Rare", "Epic"];
        } else if (tierRoll < rarityInfo.rarePlus * 1.8) {
            possibleTiers = ["Uncommon", "Rare"];
        } else {
            possibleTiers = ["Common", "Uncommon"];
        }

        const availableTraits = Object.keys(defs).filter(key => 
            possibleTiers.includes(defs[key].tier)
        );

        if (availableTraits.length > 0) {
            const traitKey = availableTraits[Math.floor(Math.random() * availableTraits.length)];
            slime.traits.push(traitKey);
        }
    }

    // Small chance for a second trait on higher rarities
    if (slime.rarity === "Epic" || slime.rarity === "Legendary") {
        if (Math.random() < 0.35) {
            const secondTierRoll = Math.random();
            let secondTiers = secondTierRoll < 0.4 ? ["Rare", "Epic"] : ["Uncommon", "Rare"];

            const available = Object.keys(defs).filter(key => 
                secondTiers.includes(defs[key].tier) && !slime.traits.includes(key)
            );

            if (available.length > 0) {
                const traitKey = available[Math.floor(Math.random() * available.length)];
                slime.traits.push(traitKey);
            }
        }
    }
}
window.generateTraitsForSlime = generateTraitsForSlime;

console.log('✅ systems/exploration.js loaded (Phase 0 - explore logic cleaned out)');