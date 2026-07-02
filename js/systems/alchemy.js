/* ============================================
   SYSTEMS / ALCHEMY.JS
   Recipes, transmutation, consumables, workshop.
   Phase 0 extraction.
============================================ */

// Uses window. for game, log, updateUI, etc.

function processMaterial(type) {
    const g = window.game || {};
    if (! (window.canPerformAction || (() => true))() ) {
        return;
    }
    const alchemyBonus = 1 + (((g.player && g.player.stats && g.player.stats.alchemy) || 0) * 0.08);
    const refineryBonus = 1 + (((g.workshop && g.workshop.refinery) || 0) * 0.15);
    if (!g.resources) g.resources = {};

    if (type === 'wood_to_scrolls') {
        if ((g.resources.wood || 0) < 45) { (window.log || console.log)("Need 45 Wood"); return; }
        g.resources.wood -= 45;
        g.resources.trainingScrolls = (g.resources.trainingScrolls || 0) + Math.floor(10 * alchemyBonus);
        (window.log || console.log)("Created Training Scrolls! Use them in training missions for bonus EXP.");
    } 
    else if (type === 'stone_to_elixir') {
        if ((g.resources.stone || 0) < 30 || (g.resources.jelly || 0) < 15) { (window.log || console.log)("Need 30 Stone + 15 Jelly"); return; }
        g.resources.stone -= 30; g.resources.jelly -= 15;
        g.resources.battleElixir = (g.resources.battleElixir || 0) + Math.floor(8 * alchemyBonus);
        (window.log || console.log)("Created Battle Elixir! Activate before tough fights.");
    } 
    else if (type === 'herbs_to_salve') {
        if ((g.resources.herbs || 0) < 25 || (g.resources.jelly || 0) < 10) { (window.log || console.log)("Need 25 Herbs + 10 Jelly"); return; }
        g.resources.herbs -= 25; g.resources.jelly -= 10;
        g.resources.healingSalve = (g.resources.healingSalve || 0) + Math.floor(9 * alchemyBonus);
        (window.log || console.log)("Created Healing Salve! Use it to boost your slimes' EXP.");
    } 
    else if (type === 'berries_to_fertility') {
        if ((g.resources.jelly || 0) < 35 || (g.resources.berries || 0) < 20) { (window.log || console.log)("Need 35 Jelly + 20 Berries"); return; }
        g.resources.jelly -= 35; g.resources.berries -= 20;
        g.resources.fertilityPotion = (g.resources.fertilityPotion || 0) + Math.floor(6 * alchemyBonus);
        (window.log || console.log)("Created Fertility Potion! Use when breeding for better rarity odds.");
    } 
    else if (type === 'essence_to_mana') {
        if ((g.resources.slimeEssence || 0) < 15 || (g.resources.manaShards || 0) < 12) { (window.log || console.log)("Need 15 Slime Essence + 12 Mana Shards"); return; }
        g.resources.slimeEssence -= 15; g.resources.manaShards -= 12;
        g.resources.focusElixir = (g.resources.focusElixir || 0) + Math.floor(7 * alchemyBonus);
        (window.log || console.log)("Created Mana Infused Gel!");
    } 
    else if (type === 'shadow_to_silk') {
        if ((g.resources.shadowEssence || 0) < 20 || (g.resources.crystal || 0) < 10) { (window.log || console.log)("Need 20 Shadow Essence + 10 Crystal"); return; }
        g.resources.shadowEssence -= 20; g.resources.crystal -= 10;
        g.resources.shadowSilk = (g.resources.shadowSilk || 0) + Math.floor(5 * alchemyBonus);
        (window.log || console.log)("Created Shadow Silk!");
    } 
    else if (type === 'make_power_serum') {
        if ((g.resources.slimeEssence || 0) < 25 || (g.resources.manaShards || 0) < 15 || (g.resources.shadowEssence || 0) < 10) { (window.log || console.log)("Need 25 Slime Essence + 15 Mana Shards + 10 Shadow Essence"); return; }
        g.resources.slimeEssence -= 25; g.resources.manaShards -= 15; g.resources.shadowEssence -= 10;
        g.globalPowerBonus = (g.globalPowerBonus || 1) * 1.02;
        (window.log || console.log)("Created Power Serum! Permanent +2% global power.");
    } 
    else if (type === 'make_alchemical_catalyst') {
        if ((g.resources.refinedEssence || 0) < 30 || (g.resources.divineShards || 0) < 8 || (g.resources.arcaneDust || 0) < 15) { (window.log || console.log)("Need 30 Refined Essence + 8 Divine Shards + 15 Arcane Dust"); return; }
        g.resources.refinedEssence -= 30; g.resources.divineShards -= 8; g.resources.arcaneDust -= 15;
        g.resources.alchemicalCatalyst = (g.resources.alchemicalCatalyst || 0) + 1;
        (window.log || console.log)("Created Alchemical Catalyst! Use in Breakthrough Research for big rewards.");
    } 
    else if (type === 'refine_essence') {
        if ((g.resources.slimeEssence || 0) < 20 || (g.resources.jelly || 0) < 8) { (window.log || console.log)("Need 20 Slime Essence + 8 Jelly"); return; }
        g.resources.slimeEssence -= 20; g.resources.jelly -= 8;
        const yieldAmount = Math.floor(3 * alchemyBonus * refineryBonus);
        g.resources.refinedEssence = (g.resources.refinedEssence || 0) + yieldAmount;
        (window.log || console.log)(`Refined ${yieldAmount} Refined Essence! (Refinery bonus applied)`);
    } 
    else if (type === 'make_explorer_tonic') {
        if ((g.resources.herbs || 0) < 20 || (g.resources.jelly || 0) < 15 || (g.resources.wood || 0) < 8) { (window.log || console.log)("Need 20 Herbs + 15 Jelly + 8 Wood"); return; }
        g.resources.herbs -= 20; g.resources.jelly -= 15; g.resources.wood -= 8;
        g.resources.explorerTonic = (g.resources.explorerTonic || 0) + Math.floor(3 * alchemyBonus);
        g.explorerTonicCharges = (g.explorerTonicCharges || 0) + Math.floor(3 * alchemyBonus);
        (window.log || console.log)("Created Explorer's Tonic! Use before exploring for better slime & resource drops.");
    }
    (window.updateUI || (() => {}))();
}

function transmuteGoldToMana() {
    const g = window.game || {};
    if (!g.resources) g.resources = {};
    if ((g.resources.gold || 0) < 100) { (window.log || console.log)("Need 100 Gold"); return; }
    g.resources.gold -= 100;
    g.resources.manaShards = (g.resources.manaShards || 0) + 8;
    (window.log || console.log)("Transmuted 100 Gold into 8 Mana Shards");
    (window.updateUI || (() => {}))();
}

function transmuteManaToDivine() {
    const g = window.game || {};
    if (!g.resources) g.resources = {};
    if ((g.resources.manaShards || 0) < 50) { (window.log || console.log)("Need 50 Mana Shards"); return; }
    g.resources.manaShards -= 50;
    g.resources.divineShards = (g.resources.divineShards || 0) + 3;
    (window.log || console.log)("Transmuted 50 Mana Shards into 3 Divine Shards");
    (window.updateUI || (() => {}))();
}

function useBattleElixir() {
    const g = window.game || {};
    if (!g.resources) g.resources = {};
    if ((g.resources.battleElixir || 0) < 1) { (window.log || console.log)("No Battle Elixirs"); return; }
    g.resources.battleElixir--;
    g.battleElixirActive = true;
    (window.log || console.log)("Battle Elixir activated! +25% power for next fight.");
    (window.updateUI || (() => {}))();
}

function useHealingSalve() {
    const g = window.game || {};
    if (!g.resources) g.resources = {};
    if ((g.resources.healingSalve || 0) < 1) { (window.log || console.log)("No Healing Salve!"); return; }
    g.resources.healingSalve--;
    
    let totalExp = 0;
    (g.slimes || []).forEach(slime => {
        const expGain = 20 + Math.floor(Math.random() * 12);
        slime.exp = (slime.exp || 0) + expGain;
        const recalc = window.recalculateSlimePower || (() => {});
        recalc(slime);
        totalExp += expGain;
    });
    
    (window.log || console.log)(`Used Healing Salve! All slimes gained a total of ${totalExp} EXP.`);
    (window.updateUI || (() => {}))();
}

function useExplorerTonic() {
    const g = window.game || {};
    if ((g.explorerTonicCharges || 0) <= 0) {
        (window.log || console.log)("No Explorer's Tonic charges! Craft some in Alchemy.");
        return;
    }
    (window.log || console.log)(`Explorer's Tonic ready! You have ${g.explorerTonicCharges} charge(s). Explore now for boosted results.`);
    (window.updateUI || (() => {}))();
}

function upgradeWorkshop(type) {
    const g = window.game || {};
    if (!g.resources) g.resources = {};
    if (!g.workshop) g.workshop = {incubator:0, trainingHall:0, refinery:0};

    if (type === 'advanced') {
        if ((g.resources.gold || 0) < 800 || (g.resources.manaShards || 0) < 25 || (g.resources.divineShards || 0) < 8) {
            (window.log || console.log)("Need 800 Gold + 25 Mana Shards + 8 Divine Shards");
            return;
        }
        g.resources.gold -= 800;
        g.resources.manaShards -= 25;
        g.resources.divineShards -= 8;
        g.globalPowerBonus = (g.globalPowerBonus || 1) * 1.08;
        (window.log || console.log)("Advanced Workshop upgraded! Permanent +8% global power.");
        (window.updateUI || (() => {}))();
        return;
    }

    const costGold = type === 'incubator' ? 120 : type === 'trainingHall' ? 150 : 180;
    const costEssence = type === 'incubator' ? 8 : type === 'trainingHall' ? 10 : 12;

    if ((g.resources.gold || 0) < costGold || (g.resources.refinedEssence || 0) < costEssence) {
        (window.log || console.log)(`Need ${costGold} Gold and ${costEssence} Refined Essence`);
        return;
    }
    g.resources.gold -= costGold;
    g.resources.refinedEssence -= costEssence;

    if (type === 'incubator') g.workshop.incubator = (g.workshop.incubator || 0) + 1;
    else if (type === 'trainingHall') g.workshop.trainingHall = (g.workshop.trainingHall || 0) + 1;
    else if (type === 'refinery') g.workshop.refinery = (g.workshop.refinery || 0) + 1;

    (window.log || console.log)(`${type} upgraded!`);
    (window.updateUI || (() => {}))();
}

function buyItem(item) {
    const g = window.game || {};
    if (!g.resources) g.resources = {};
    const can = window.canPerformAction || (() => true);
    if (!can()) {
        return;
    }
    if (item === 'jellyPack') {
        if ((g.resources.gold || 0) < 50) { (window.log || console.log)("Not enough Gold"); return; }
        g.resources.gold -= 50;
        g.resources.jelly = (g.resources.jelly || 0) + 25;
        (window.log || console.log)("Bought Jelly Pack!");
    } else if (item === 'manaPack') {
        if ((g.resources.gold || 0) < 120) { (window.log || console.log)("Not enough Gold"); return; }
        g.resources.gold -= 120;
        g.resources.manaShards = (g.resources.manaShards || 0) + 15;
        (window.log || console.log)("Bought Mana Pack!");
    } else if (item === 'woodPack') {
        if ((g.resources.gold || 0) < 40) { (window.log || console.log)("Not enough Gold"); return; }
        g.resources.gold -= 40;
        g.resources.wood = (g.resources.wood || 0) + 30;
        (window.log || console.log)("Bought Wood Pack!");
    } else if (item === 'herbPack') {
        if ((g.resources.gold || 0) < 35) { (window.log || console.log)("Not enough Gold"); return; }
        g.resources.gold -= 35;
        g.resources.herbs = (g.resources.herbs || 0) + 25;
        (window.log || console.log)("Bought Herb Pack!");
    }
    (window.updateUI || (() => {}))();
}

// Expose
window.processMaterial = processMaterial;
window.transmuteGoldToMana = transmuteGoldToMana;
window.transmuteManaToDivine = transmuteManaToDivine;
window.useBattleElixir = useBattleElixir;
window.useHealingSalve = useHealingSalve;
window.useExplorerTonic = useExplorerTonic;
window.upgradeWorkshop = upgradeWorkshop;
window.buyItem = buyItem;

console.log('✅ systems/alchemy.js loaded (Phase 0)');