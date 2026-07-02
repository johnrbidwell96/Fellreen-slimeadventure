/* ============================================
   SYSTEMS / COMBAT.JS
   Boss fights, dungeons, advantage calculations.
   Phase 0 extraction.
============================================ */

// Note: uses window. for cross-module state (game, log, etc.)
// Globals like currentBossId, selectedSlimeIds, bossData, ELEMENT_CHART assumed on window or in scope via index shims during transition.

function runDungeon(dungeonId) {
    const req = (window.DUNGEON_REQUIREMENTS || {})[dungeonId];
    const g = window.game || {};
    if ((g.playerLevel || 1) < req) { 
        (window.log || console.log)(`Requires Player Level ${req}`); 
        return; 
    }

    // Dungeons now use your Party power (not entire collection)
    const partyPwr = (typeof getPartyPower === 'function') ? getPartyPower() : 400;
    const partyFactor = Math.min(0.35, partyPwr / 2200);

    let successChance = 0.55 + partyFactor + (((g.player && g.player.stats && g.player.stats.combat) || 0) * 0.025) + ((g.playerLevel || 1) * 0.003);
    if (g.battleElixirActive) successChance += 0.25;

    const success = Math.random() < Math.min(0.95, successChance);

    let gains = [];
    let tamedSlime = null;

    if (success) {
        const partyPwr = (typeof getPartyPower === 'function') ? getPartyPower() : 400;
        const pScale = 1 + Math.min(0.8, partyPwr / 3000);
        const goldGain = Math.floor((35 + Math.floor((g.playerLevel || 1) * 2.8)) * pScale);
        const essenceGain = Math.floor((4 + Math.floor((g.playerLevel || 1) / 6)) * pScale);
        if (!g.resources) g.resources = {};
        g.resources.gold = (g.resources.gold || 0) + goldGain;
        g.resources.slimeEssence = (g.resources.slimeEssence || 0) + essenceGain;

        gains.push(`${goldGain} Gold`);
        gains.push(`${essenceGain} Essence`);

        if (dungeonId === 'abyssal_throne' || dungeonId === 'origin_core') {
            const divine = 1;
            g.resources.divineShards = (g.resources.divineShards || 0) + divine;
            g.lifetimeDivineShards = (g.lifetimeDivineShards || 0) + divine;
            gains.push(`${divine} Divine Shard`);
        }

        if (Math.random() < 0.45) {
            const gen = window.generateRandomSlime || (() => null);
            const newSlime = gen("Hard");
            if (newSlime) {
                g.slimes = g.slimes || [];
                g.slimes.push(newSlime);
                g.lifetimeSlimesTamed = (g.lifetimeSlimesTamed || 0) + 1;
                tamedSlime = newSlime;
            }
        }
        const dungeonDamage = 120 + ((g.playerLevel || 1) * 8);
        g.totalDamageDealt = (g.totalDamageDealt || 0) + dungeonDamage;
        g.totalDungeonsCleared = (g.totalDungeonsCleared || 0) + 1;
        (window.gainPlayerExp || (() => {}))(12 + Math.floor((g.playerLevel || 1) / 3));
    } else {
        if ((g.resources && g.resources.healingSalve || 0) > 0 && Math.random() < 0.35) {
            g.resources.healingSalve--;
            console.log("Your Healing Salve activated automatically and softened the blow!");  // console only; popup is main feedback
        }
    }
    g.battleElixirActive = false;
    (window.updateUI || (() => {}))();

    // Show nice popup for dungeon results (like exploration) - always, even on fail or no gains
    const dungeonNames = {
        forest_depths: "Forest Depths",
        crystal_caverns: "Crystal Caverns",
        shadow_abyss: "Shadow Abyss",
        ancient_temple: "Ancient Temple",
        molten_core: "Molten Core",
        glacial_spire: "Glacial Spire",
        thunder_sanctum: "Thunder Sanctum",
        abyssal_throne: "Abyssal Throne",
        origin_core: "Origin Core",
    };
    const dName = dungeonNames[dungeonId] || dungeonId.replace(/_/g, ' ');
    const title = success ? `✅ ${dName} SUCCESS!` : `❌ ${dName} FAILED...`;
    const sub = success ? "You cleared the dungeon!" : "The dungeon was too tough...";
    setTimeout(() => {
        const resFn = window.showGainModal || window.showResourceGain || (() => {});
        if (tamedSlime) {
            resFn(title, sub, gains, () => {
                const reveal = window.showNewSlimeReveal || (() => {});
                reveal(tamedSlime);
            });
        } else {
            resFn(title, sub, gains);
        }
    }, 220);
}

function prepareForBossFight(bossId) {
    const g = window.game || {};
    const reqs = window.BOSS_REQUIREMENTS || {};
    if ((g.playerLevel || 1) < reqs[bossId]) {
        (window.log || console.log)(`Requires Player Level ${reqs[bossId]}`); return;
    }
    window.currentBossId = bossId;
    window.selectedSlimeIds = [];
    const modal = document.getElementById('bossTeamModal');
    const title = document.getElementById('modalBossTitle');
    const info = document.getElementById('modalBossInfo');
    const list = document.getElementById('slimeSelectionList');

    const bossData = window.bossData || window.BOSS_DATA || {};
    const boss = bossData[bossId];
    if (title) title.innerText = `Prepare for ${boss.name}`;
    if (info) info.innerHTML = `<strong>Element:</strong> ${boss.element} • Base Power: ${boss.basePower}`;

    // Update the max selection text based on current party size
    const maxSel = (typeof getMaxPartySize === 'function') ? getMaxPartySize() : 30;
    const selInfo = document.getElementById('bossSelectInfo');
    if (selInfo) selInfo.innerHTML = `Select up to <strong>${maxSel}</strong> slimes.`;

    if (list) list.innerHTML = '';
    if (!g.slimes || g.slimes.length === 0) {
        if (list) list.innerHTML = '<p style="color:#ffaa66;">You have no slimes! Explore first.</p>';
        return;
    }

    // Pre-select current party for boss (up to current max party size). User can adjust in the UI.
    const currentParty = (typeof getParty === 'function') ? getParty() : [];
    const maxSel = (typeof getMaxPartySize === 'function') ? getMaxPartySize() : 30;
    window.selectedSlimeIds = currentParty.slice(0, maxSel).map(s => s.id);

    g.slimes.forEach((slime, index) => {
        const div = document.createElement('div');
        div.className = 'slime-select-item';
        div.style.cssText = 'display:flex; align-items:center; gap:10px; padding:4px; border:1px solid #334433; border-radius:8px; margin:3px 0; cursor:pointer;';

        const advFn = window.getAdvantageMultiplier || (() => 1);
        const adv = advFn(slime.element, boss.element);
        let badge = '';
        if (adv > 1) badge = `<span style="color:#4ade80; font-size:10px;">+${Math.round((adv-1)*100)}%</span>`;
        else if (adv < 1) badge = `<span style="color:#f87171; font-size:10px;">-${Math.round((1-adv)*100)}%</span>`;
        else badge = `<span style="opacity:0.7; font-size:10px;">Neutral</span>`;

        const miniVis = (window.createSlimeVisual || (() => document.createElement('div')))(slime, { size: 'sm', showElementBadge: false });

        const text = document.createElement('div');
        text.style.flex = '1';
        text.innerHTML = `
            <strong>${slime.name}</strong> <small style="opacity:0.8;">(Lv ${slime.level} ${slime.rarity})</small><br>
            <small>${slime.power} PWR</small> ${badge}
        `;

        div.appendChild(miniVis);
        div.appendChild(text);

        // Mark pre-selected party members
        if (window.selectedSlimeIds && window.selectedSlimeIds.includes(slime.id)) {
            div.classList.add('selected');
        }

        div.onclick = () => {
            const toggleFn = window.toggleSlimeSelection || (() => {});
            toggleFn(index, div);
        };
        if (list) list.appendChild(div);
    });

    if (modal) modal.style.display = 'flex';
    const updateFn = window.updateTeamSummary || (() => {});
    updateFn();
}

function getAdvantageMultiplier(slimeElement, bossElement) {
    const chart = (window.ELEMENT_CHART || {})[slimeElement];
    if (!chart) return 1.0;
    if (chart.strong.includes(bossElement)) return 1.55;
    if (chart.weak.includes(bossElement)) return 0.55;
    return 1.0;
}

function toggleSlimeSelection(index, element) {
    const g = window.game || {};
    const id = (g.slimes && g.slimes[index]) ? g.slimes[index].id : null;
    if (!id) return;
    window.selectedSlimeIds = window.selectedSlimeIds || [];
    const pos = window.selectedSlimeIds.indexOf(id);
    if (pos > -1) {
        window.selectedSlimeIds.splice(pos, 1);
        element.classList.remove('selected');
    } else {
        const maxSel = (typeof getMaxPartySize === 'function') ? getMaxPartySize() : 30;
        if (window.selectedSlimeIds.length >= maxSel) { (window.log || console.log)(`Max ${maxSel} slimes allowed`); return; }
        window.selectedSlimeIds.push(id);
        element.classList.add('selected');
    }
    const updateFn = window.updateTeamSummary || (() => {});
    updateFn();
}

function updateTeamSummary() {
    const summary = document.getElementById('summaryText');
    const count = document.getElementById('selectionCount');
    const g = window.game || {};
    if (!summary || !count || !window.currentBossId) return;

    if (!window.selectedSlimeIds || window.selectedSlimeIds.length === 0) {
        const maxSel = (typeof getMaxPartySize === 'function') ? getMaxPartySize() : 30;
        summary.innerHTML = `Select up to ${maxSel} slimes to fight.`;
        count.innerText = `0 / ${maxSel} selected`;
        return;
    }

    const bossData = window.bossData || window.BOSS_DATA || {};
    const boss = bossData[window.currentBossId];
    let totalPower = 0;
    let avgMultiplier = 0;

    window.selectedSlimeIds.forEach(id => {
        const slime = (g.slimes || []).find(s => s.id === id);
        if (slime) {
            const advFn = window.getAdvantageMultiplier || (() => 1);
            const mult = advFn(slime.element, boss.element);
            totalPower += slime.power * mult;
            avgMultiplier += mult;
        }
    });

    avgMultiplier = avgMultiplier / window.selectedSlimeIds.length;
    const combatBonus = 1 + (((g.player && g.player.stats && g.player.stats.combat) || 0) * 0.04);
    const elixirBonus = g.battleElixirActive ? 1.25 : 1.0;
    const partyFn = window.getPartyPowerMultiplier || (() => 1);
    const finalPower = Math.floor(totalPower * combatBonus * elixirBonus * (g.globalPowerBonus || 1) * partyFn());

    let extraInfo = '';
    if (g.partyPowerBonusUntil && Date.now() < g.partyPowerBonusUntil) {
        extraInfo += `<br><span style="color:#aaff99;">✨ Slime Party buff active!</span>`;
    }
    if (g.battleElixirActive) {
        extraInfo += `<br><span style="color:#ffdd77;">🧪 Battle Elixir active (+25%)</span>`;
    }

    summary.innerHTML = `
        Team Power: <strong>${finalPower}</strong> vs Boss ${boss.basePower}<br>
        Avg Element Multiplier: <strong>${avgMultiplier.toFixed(2)}x</strong><br>
        Combat Bonus: +${((g.player && g.player.stats && g.player.stats.combat) || 0) * 4}%
        ${extraInfo}
        <br><small style="opacity:0.7;">Small variance will apply in actual fight.</small>
    `;
    const maxSel = (typeof getMaxPartySize === 'function') ? getMaxPartySize() : 30;
    count.innerText = `${window.selectedSlimeIds.length} / ${maxSel} selected`;
}

function startBossFight() {
    const g = window.game || {};
    if (!window.currentBossId || !window.selectedSlimeIds || window.selectedSlimeIds.length === 0) { (window.log || console.log)("Select at least 1 slime"); return; }

    const bossData = window.bossData || window.BOSS_DATA || {};
    const boss = bossData[window.currentBossId];
    let totalPower = 0;
    window.selectedSlimeIds.forEach(id => {
        const slime = (g.slimes || []).find(s => s.id === id);
        if (slime) {
            const advFn = window.getAdvantageMultiplier || (() => 1);
            const mult = advFn(slime.element, boss.element);
            totalPower += slime.power * mult;
        }
    });

    const combatBonus = 1 + (((g.player && g.player.stats && g.player.stats.combat) || 0) * 0.04);
    const elixirBonus = g.battleElixirActive ? 1.25 : 1.0;
    const partyFn = window.getPartyPowerMultiplier || (() => 1);

    const variance = 0.92 + Math.random() * 0.16;
    const finalPower = Math.floor(totalPower * combatBonus * elixirBonus * (g.globalPowerBonus || 1) * partyFn() * variance);

    const success = finalPower > boss.basePower * 0.85;

    const gold = Math.floor(80 + boss.basePower / 3);
    const essence = Math.floor(8 + boss.basePower / 60);
    let divineGain = 0;
    if (success) {
        if (!g.resources) g.resources = {};
        g.resources.gold = (g.resources.gold || 0) + gold;
        g.resources.shadowEssence = (g.resources.shadowEssence || 0) + essence;

        if (window.currentBossId === 'storm_sovereign' || window.currentBossId === 'divine_colossus') {
            divineGain = 2;
        }
        if (divineGain > 0) {
            g.resources.divineShards = (g.resources.divineShards || 0) + divineGain;
            g.lifetimeDivineShards = (g.lifetimeDivineShards || 0) + divineGain;
        }

        (window.gainPlayerExp || (() => {}))(30 + Math.floor(boss.basePower / 15));
        g.totalDamageDealt = (g.totalDamageDealt || 0) + finalPower;
        g.totalBossesDefeated = (g.totalBossesDefeated || 0) + 1;
    } else {
        if ((g.resources && g.resources.healingSalve || 0) > 0 && Math.random() < 0.4) {
            g.resources.healingSalve--;
        }
    }

    const playerTeam = (window.selectedSlimeIds || []).map(id => (g.slimes || []).find(s => s.id === id)).filter(Boolean);

    g.battleElixirActive = false;
    const closeFn = window.closeBossModal || (() => {});
    closeFn();

    const showBattle = window.showBattleSequence || (() => {});
    showBattle(playerTeam, boss, {
        success,
        finalPower,
        bossPower: boss.basePower,
        gold: success ? gold : 0,
        essence: success ? essence : 0,
        divineGain
    });

    if (!success) {
        setTimeout(() => (window.log || console.log)(`Defeated by ${boss.name}.`), 900);
    }

    (window.updateUI || (() => {}))();
}

function closeBossModal() {
    const modal = document.getElementById('bossTeamModal');
    if (modal) modal.style.display = 'none';
    window.currentBossId = null;
    window.selectedSlimeIds = [];
}

// Expose
window.runDungeon = runDungeon;
window.prepareForBossFight = prepareForBossFight;
window.getAdvantageMultiplier = getAdvantageMultiplier;
window.toggleSlimeSelection = toggleSlimeSelection;
window.updateTeamSummary = updateTeamSummary;
window.startBossFight = startBossFight;
window.closeBossModal = closeBossModal;

console.log('✅ systems/combat.js loaded (Phase 0)');