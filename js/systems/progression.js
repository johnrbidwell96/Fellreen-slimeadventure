/* ============================================
   SYSTEMS / PROGRESSION.JS
   Player stats, spend, locks, endgame, etc.
   Phase 0 extraction.
============================================ */

function spendStatPoint(stat) {
    const g = window.game || {};
    if ((g.player && g.player.statPoints || 0) <= 0) {
        (window.log || console.log)("No stat points left!");
        return;
    }
    if (!g.player) g.player = {statPoints:0, stats:{}};
    if (!g.player.stats) g.player.stats = {};
    g.player.stats[stat] = (g.player.stats[stat] || 0) + 1;
    g.player.statPoints = (g.player.statPoints || 0) - 1;
    (window.log || console.log)(`+1 ${stat.charAt(0).toUpperCase() + stat.slice(1)}`);
    (window.updateUI || (() => {}))();
}

function updateExploreLocks() {
    const areas = window.UNLOCKABLE_AREAS || [];
    areas.forEach(area => {
        const card = document.getElementById(`card-${area.id}`);
        const lockText = document.getElementById(`lock-${area.id}`);
        if (!card || !lockText) return;
        const btn = card.querySelector('button');
        const g = window.game || {};
        if ((g.playerLevel || 1) >= area.level) {
            card.classList.remove('locked');
            if (btn) btn.disabled = false;
            lockText.style.display = 'none';
        } else {
            card.classList.add('locked');
            if (btn) btn.disabled = true;
            lockText.style.display = 'block';
            lockText.innerText = `🔒 Locked — Requires Player Level ${area.level}`;
        }
    });
}

function updateDungeonLocks() {
    const reqs = window.DUNGEON_REQUIREMENTS || {};
    Object.keys(reqs).forEach(id => {
        const card = document.getElementById(`card-${id}`);
        const lockText = document.getElementById(`lock-${id}`);
        if (!card || !lockText) return;
        const btn = card.querySelector('button');
        const req = reqs[id];
        const g = window.game || {};
        if ((g.playerLevel || 1) >= req) {
            card.classList.remove('locked');
            if (btn) btn.disabled = false;
            lockText.style.display = 'none';
        } else {
            card.classList.add('locked');
            if (btn) btn.disabled = true;
            lockText.style.display = 'block';
            lockText.innerText = `🔒 Locked — Requires Player Level ${req}`;
        }
    });
}

function updateBossLocks() {
    const reqs = window.BOSS_REQUIREMENTS || {};
    Object.keys(reqs).forEach(id => {
        const card = document.getElementById(`card-${id}`);
        const lockText = document.getElementById(`lock-${id}`);
        if (!card || !lockText) return;
        const btn = card.querySelector('button');
        const req = reqs[id];
        const g = window.game || {};
        if ((g.playerLevel || 1) >= req) {
            card.classList.remove('locked');
            if (btn) btn.disabled = false;
            lockText.style.display = 'none';
        } else {
            card.classList.add('locked');
            if (btn) btn.disabled = true;
            lockText.style.display = 'block';
            lockText.innerText = `🔒 Locked — Requires Player Level ${req}`;
        }
    });
}

// Expose
window.spendStatPoint = spendStatPoint;
window.updateExploreLocks = updateExploreLocks;
window.updateDungeonLocks = updateDungeonLocks;
window.updateBossLocks = updateBossLocks;

function slimeResearch() {
    const g = window.game || {};
    if (!g.resources) g.resources = {};
    if (!g.player) g.player = {stats: {}, statPoints: 0};
    if ((g.resources.jelly || 0) < 20 || (g.resources.herbs || 0) < 15 || (g.resources.slimeEssence || 0) < 5) {
        (window.log || console.log)("Need 20 Jelly + 15 Herbs + 5 Slime Essence for research.");
        return;
    }
    
    g.resources.jelly -= 20;
    g.resources.herbs -= 15;
    g.resources.slimeEssence -= 5;

    const stats = ['taming', 'alchemy', 'combat', 'leadership', 'endurance'];
    const randomStat = stats[Math.floor(Math.random() * stats.length)];
    g.player.stats[randomStat] = (g.player.stats[randomStat] || 0) + 1;
    g.player.statPoints = (g.player.statPoints || 0) + 1;

    (window.log || console.log)(`Research complete! +1 ${randomStat} and +1 Stat Point. Your slimes feel smarter already.`);
    (window.updateUI || (() => {}))();
}

function breakthroughResearch() {
    const g = window.game || {};
    if (!g.resources) g.resources = {};
    if (!g.player) g.player = {stats: {}, statPoints: 0};
    const hasCatalyst = (g.resources.alchemicalCatalyst || 0) > 0;
    const costJelly = hasCatalyst ? 40 : 60;
    const costEssence = hasCatalyst ? 15 : 25;
    const costDivine = hasCatalyst ? 2 : 4;

    if ((g.resources.jelly || 0) < costJelly || 
        (g.resources.slimeEssence || 0) < costEssence || 
        (g.resources.divineShards || 0) < costDivine) {
        (window.log || console.log)(`Need ${costJelly} Jelly + ${costEssence} Slime Essence + ${costDivine} Divine Shards.`);
        return;
    }

    g.resources.jelly -= costJelly;
    g.resources.slimeEssence -= costEssence;
    g.resources.divineShards -= costDivine;

    if (hasCatalyst) {
        g.resources.alchemicalCatalyst--;
    }

    const roll = Math.random();
    if (roll < 0.4) {
        g.globalPowerBonus = (g.globalPowerBonus || 1) * 1.06;
        (window.log || console.log)("Breakthrough! Permanent +6% Global Power Bonus!");
    } else if (roll < 0.7) {
        g.player.statPoints = (g.player.statPoints || 0) + 5;
        (window.log || console.log)("Breakthrough! +5 Stat Points!");
    } else {
        const stats = ['taming', 'alchemy', 'combat', 'leadership', 'endurance'];
        for (let i = 0; i < 2; i++) {
            const stat = stats[Math.floor(Math.random() * stats.length)];
            g.player.stats[stat] = (g.player.stats[stat] || 0) + 2;
        }
        (window.log || console.log)("Breakthrough! +2 to two random stats!");
    }
    
    (window.updateUI || (() => {}))();
    (window.updateEndgameUI || (() => {}))();
}

function updateEndgameUI() {
    const g = window.game || {};
    const milestoneList = document.getElementById('milestoneList');
    if (milestoneList) {
        let html = '';
        const milestones = window.MILESTONES || [];
        milestones.forEach(m => {
            const unlocked = (g.playerLevel || 1) >= m.level;
            html += `<div style="margin:4px 0; color:${unlocked ? '#aaff99' : '#888'};">${unlocked ? '✅' : '🔒'} Level ${m.level}: ${m.name}</div>`;
        });
        milestoneList.innerHTML = html;
    }

    const lifetimeStats = document.getElementById('lifetimeStats');
    if (lifetimeStats) {
        lifetimeStats.innerHTML = `
            Highest Player Level: <strong>${g.highestLevel || 1}</strong><br>
            Total Divine Shards Earned: <strong>${g.lifetimeDivineShards || 0}</strong><br>
            Total Slimes Tamed: <strong>${g.lifetimeSlimesTamed || 0}</strong><br>
            Current Global Power Bonus: <strong>${((g.globalPowerBonus || 1) * 100).toFixed(0)}%</strong>
        `;
    }

    const voidFloor = document.getElementById('voidFloor');
    if (voidFloor) voidFloor.innerText = g.voidTowerFloor || 1;

    const voidBtn = document.getElementById('voidTowerBtn');
    if (voidBtn) {
        if ((g.playerLevel || 1) >= (window.VOID_TOWER_MIN_LEVEL || 90)) {
            voidBtn.disabled = false;
            voidBtn.style.opacity = "1";
        } else {
            voidBtn.disabled = true;
            voidBtn.style.opacity = "0.5";
        }
    }
}

function runVoidTower() {
    const g = window.game || {};
    const minLevel = window.VOID_TOWER_MIN_LEVEL || 90;
    if ((g.playerLevel || 1) < minLevel) {
        (window.log || console.log)(`The Endless Void Tower requires Player Level ${minLevel} to enter.`);
        return;
    }

    const floor = g.voidTowerFloor || 1;
    const requiredPower = 420 + (floor * 235);

    let teamPower = 0;
    (g.slimes || []).forEach(s => { teamPower += s.power; });

    const combatBonus = 1 + (((g.player && g.player.stats && g.player.stats.combat) || 0) * 0.04);
    const elixirBonus = g.battleElixirActive ? 1.25 : 1.0;
    const partyBonus = (window.getPartyPowerMultiplier || (() => 1))();
    const finalPower = Math.floor(teamPower * combatBonus * elixirBonus * (g.globalPowerBonus || 1) * partyBonus);

    const percentOfRequired = ((finalPower / requiredPower) * 100).toFixed(0);
    (window.log || console.log)(`Floor ${floor} requires ~${requiredPower} power. Your team has ${finalPower} power (${percentOfRequired}% of required).`);

    if (finalPower < requiredPower * 0.95) {
        (window.log || console.log)(`Your team is too weak for floor ${floor}. You need at least 95% of the required power.`);
        return;
    }

    const success = finalPower > requiredPower * 1.08;

    if (success) {
        const divineGain = 2 + Math.floor(floor / 5);
        if (!g.resources) g.resources = {};
        g.resources.divineShards = (g.resources.divineShards || 0) + divineGain;
        g.lifetimeDivineShards = (g.lifetimeDivineShards || 0) + divineGain;
        g.voidTowerFloor = floor + 1;
        (window.log || console.log)(`Cleared Void Tower Floor ${floor}! +${divineGain} Divine Shards.`);
        (window.gainPlayerExp || (() => {}))(48 + floor * 7);
    } else {
        (window.log || console.log)(`Failed on Void Tower Floor ${floor}. You need stronger slimes, better element matchups, or higher Combat stat.`);
    }

    g.battleElixirActive = false;
    (window.updateUI || (() => {}))();
    (window.updateEndgameUI || (() => {}))();
}

function divineConvergence() {
    const g = window.game || {};
    const count = g.divineConvergenceCount || 0;
    const baseCost = 30;
    const cost = baseCost + (count * 18);

    if (!g.resources) g.resources = {};
    if ((g.resources.divineShards || 0) < cost) {
        (window.log || console.log)(`Need ${cost} Divine Shards for Divine Convergence (you have ${g.resources.divineShards || 0}).`);
        return;
    }

    g.resources.divineShards -= cost;
    g.globalPowerBonus = (g.globalPowerBonus || 1) * 1.065;
    g.divineConvergenceCount = count + 1;

    const bonusPercent = Math.round((g.globalPowerBonus - 1) * 100);
    (window.log || console.log)(`Divine Convergence complete! Permanent +6.5% global power (Total: +${bonusPercent}%). Cost was ${cost} shards.`);
    (window.updateUI || (() => {}))();
    (window.updateEndgameUI || (() => {}))();
}

// Expose
window.slimeResearch = slimeResearch;
window.breakthroughResearch = breakthroughResearch;
window.updateEndgameUI = updateEndgameUI;
window.runVoidTower = runVoidTower;
window.divineConvergence = divineConvergence;
window.updateExploreLocks = updateExploreLocks;
window.updateDungeonLocks = updateDungeonLocks;
window.updateBossLocks = updateBossLocks;

console.log('✅ systems/progression.js loaded (Phase 0)');