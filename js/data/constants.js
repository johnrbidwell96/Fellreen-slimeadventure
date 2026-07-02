/* ============================================
   DATA/CONSTANTS.JS
   Single source of truth for all static game data.
   Phase 0 extraction target.
============================================ */

const ELEMENTS = ["Water","Fire","Earth","Wind","Plant","Lightning","Ice","Shadow","Light","Metal","Poison","Crystal","Lava","Storm","Spirit","Void"];

const ELEMENT_NAMES = {
    Water: ["Aqua"], Fire: ["Blaze"], Earth: ["Terra"], Wind: ["Zephyr"],
    Plant: ["Bloom"], Lightning: ["Bolt"], Ice: ["Frost"], Shadow: ["Shade"],
    Light: ["Lumina"], Metal: ["Steel"], Poison: ["Venom"], Crystal: ["Gem"],
    Lava: ["Magma"], Storm: ["Tempest"], Spirit: ["Wisp"], Void: ["Abyss"]
};

// Legacy aliases for transition period (many functions still expect these)
const elements = ELEMENTS;
const names = ELEMENT_NAMES;

const TRAINING_MISSIONS = [
    { id: "quick", name: "Quick Session", durationMinutes: 10, expPerSlime: 22, desc: "Short practice" },
    { id: "focused", name: "Focused Training", durationMinutes: 30, expPerSlime: 75, desc: "Good workout" },
    { id: "rigorous", name: "Rigorous Drill", durationMinutes: 90, expPerSlime: 260, desc: "Hard training" },
    { id: "endurance", name: "Endurance Training", durationMinutes: 180, expPerSlime: 580, desc: "Long dedicated session" },
    { id: "master", name: "Master Regimen", durationMinutes: 360, expPerSlime: 1250, desc: "Maximum long-term gains (best for overnight)" }
];

const ELEMENT_CHART = {
    Water: { strong: ["Fire", "Lava"], weak: ["Lightning", "Ice", "Plant"] },
    Fire: { strong: ["Plant", "Ice", "Wind"], weak: ["Water", "Earth", "Lava"] },
    Earth: { strong: ["Lightning", "Fire", "Poison"], weak: ["Wind", "Water", "Plant"] },
    Wind: { strong: ["Plant", "Poison", "Earth"], weak: ["Lightning", "Ice", "Storm"] },
    Plant: { strong: ["Water", "Earth", "Poison"], weak: ["Fire", "Lava", "Wind"] },
    Lightning: { strong: ["Water", "Wind", "Metal"], weak: ["Earth", "Plant", "Storm"] },
    Ice: { strong: ["Water", "Plant", "Wind"], weak: ["Fire", "Lava", "Lightning"] },
    Shadow: { strong: ["Light", "Spirit", "Void"], weak: ["Light", "Crystal", "Storm"] },
    Light: { strong: ["Shadow", "Void", "Poison"], weak: ["Shadow", "Void", "Metal"] },
    Metal: { strong: ["Lightning", "Ice", "Crystal"], weak: ["Fire", "Lava", "Poison"] },
    Poison: { strong: ["Plant", "Water", "Spirit"], weak: ["Earth", "Wind", "Light"] },
    Crystal: { strong: ["Shadow", "Void", "Lightning"], weak: ["Metal", "Fire", "Lava"] },
    Lava: { strong: ["Plant", "Ice", "Metal"], weak: ["Water", "Earth", "Wind"] },
    Storm: { strong: ["Wind", "Lightning", "Water"], weak: ["Earth", "Metal", "Crystal"] },
    Spirit: { strong: ["Shadow", "Poison", "Void"], weak: ["Light", "Crystal", "Metal"] },
    Void: { strong: ["Light", "Shadow", "Spirit"], weak: ["Crystal", "Storm", "Metal"] }
};

const BOSS_DATA = {
    fire_dragon: { name: "Fire Dragon", element: "Fire", basePower: 180 },
    stone_golem: { name: "Stone Golem", element: "Earth", basePower: 260 },
    ancient_treant: { name: "Ancient Treant", element: "Plant", basePower: 380 },
    shadow_lich: { name: "Shadow Lich", element: "Shadow", basePower: 520 },
    storm_sovereign: { name: "Storm Sovereign", element: "Storm", basePower: 680 },
    divine_colossus: { name: "Divine Colossus", element: "Light", basePower: 920 }
};

// Legacy alias
const bossData = BOSS_DATA;

const UNLOCKABLE_AREAS = [
    { id: "mountain", name: "Mountain", level: 5 },
    { id: "lake", name: "Crystal Lake", level: 5 },
    { id: "cave", name: "Cave", level: 5 },
    { id: "swamp", name: "Swamp", level: 12 },
    { id: "ruins", name: "Ancient Ruins", level: 12 },
    { id: "grove", name: "Mystic Grove", level: 18 },
    { id: "volcano", name: "Volcano", level: 25 },
    { id: "tundra", name: "Frozen Tundra", level: 25 },
    { id: "abyss", name: "Abyssal Depths", level: 55 },
    { id: "spire", name: "Celestial Spire", level: 65 },
    { id: "void", name: "Void Realm", level: 75 },
    { id: "garden", name: "Eternal Garden", level: 85 },
    { id: "nexus", name: "Origin Nexus", level: 95 }
];

const DUNGEON_REQUIREMENTS = {
    forest_depths: 3, crystal_caverns: 8, shadow_abyss: 18, ancient_temple: 30,
    molten_core: 42, glacial_spire: 48, thunder_sanctum: 55, abyssal_throne: 68, origin_core: 82
};

const BOSS_REQUIREMENTS = {
    fire_dragon: 15, stone_golem: 28, ancient_treant: 45,
    shadow_lich: 62, storm_sovereign: 78, divine_colossus: 92
};

const MILESTONES = [
    { level: 30, name: "+5% Global Power", effect: () => { if (window.game) game.globalPowerBonus = (game.globalPowerBonus || 1) * 1.05; } },
    { level: 50, name: "+2 extra Stat Points per level-up", effect: () => {} },
    { level: 75, name: "+10% better rarity from exploration", effect: () => {} },
    { level: 100, name: "Eternal Alchemy Recipes Unlocked", effect: () => { if (typeof log === 'function') log("New powerful Alchemy recipes available!"); } },
    { level: 150, name: "+15% more Divine Shards from bosses", effect: () => {} }
];

const VOID_TOWER_MIN_LEVEL = 90;

// ==================== MAP DATA ====================
const MAP_DATA = {
    greenwild: {
        name: "Greenwild Forest",
        nodes: [
            { id: "gw1", name: "Whispering Glade", baseDifficulty: "Easy", reward: "Good resources + slime chance" },
            { id: "gw2", name: "Old Oak Hollow", baseDifficulty: "Normal", reward: "Better resources" },
            { id: "gw3", name: "Hidden Grove", baseDifficulty: "Hard", reward: "High rewards + possible rare slime" },
            { id: "gw4", name: "Ancient Roots", baseDifficulty: "Normal", reward: "Good resources" }
        ]
    },
    crystal: {
        name: "Crystal Mountains",
        nodes: [
            { id: "cm1", name: "Crystal Path", baseDifficulty: "Normal", reward: "Crystal & good resources" },
            { id: "cm2", name: "Frozen Peak", baseDifficulty: "Hard", reward: "High value rewards" },
            { id: "cm3", name: "Glacier Core", baseDifficulty: "Hard", reward: "Excellent rewards + rare slime chance" }
        ]
    },
    shadowfen: {
        name: "Shadowfen Swamp",
        nodes: [
            { id: "sf1", name: "Murkwood Trail", baseDifficulty: "Normal", reward: "Shadow resources + herbs" },
            { id: "sf2", name: "Bog of Whispers", baseDifficulty: "Hard", reward: "High shadow essence" },
            { id: "sf3", name: "Witch's Hollow", baseDifficulty: "Hard", reward: "Rare slime chance + mana" },
            { id: "sf4", name: "Blackroot Depths", baseDifficulty: "Normal", reward: "Strong resources" },
            { id: "sf5", name: "Thornveil Marsh", baseDifficulty: "Hard", reward: "Excellent rewards + catalyst chance" },
            { id: "sf6", name: "Abyssal Mire (Boss)", baseDifficulty: "Hard", reward: "Top tier rewards + legendary slime chance" }
        ]
    },
    volcanic: {
        name: "Volcanic Wastes",
        nodes: [
            { id: "vw1", name: "Ashen Fields", baseDifficulty: "Normal", reward: "Fire resources + stone" },
            { id: "vw2", name: "Lava Rivers", baseDifficulty: "Hard", reward: "High crystal & refined essence" },
            { id: "vw3", name: "Ember Peak", baseDifficulty: "Hard", reward: "Excellent fire rewards" },
            { id: "vw4", name: "Magma Core", baseDifficulty: "Hard", reward: "Top tier resources + rare slime" },
            { id: "vw5", name: "Infernal Spire (Boss)", baseDifficulty: "Hard", reward: "Best rewards in region + divine chance" }
        ]
    },
    celestial: {
        name: "Celestial Peaks",
        nodes: [
            { id: "cp1", name: "Starlit Path", baseDifficulty: "Normal", reward: "Light & mana resources" },
            { id: "cp2", name: "Moonveil Ridge", baseDifficulty: "Hard", reward: "High divine shard chance" },
            { id: "cp3", name: "Astral Observatory", baseDifficulty: "Hard", reward: "Excellent rewards + catalyst" },
            { id: "cp4", name: "Nexus of Stars", baseDifficulty: "Hard", reward: "Top tier rewards + legendary slime" },
            { id: "cp5", name: "Throne of the Cosmos (Boss)", baseDifficulty: "Hard", reward: "Ultimate rewards + massive power bonus chance" }
        ]
    }
};

// Region-specific loot tables
const REGION_LOOT_TABLES = {
    greenwild: { resources: ["wood", "herbs", "jelly"], bonusChance: 0.30, slimeBonus: 0.10 },
    crystal:   { resources: ["stone", "crystal", "refinedEssence"], bonusChance: 0.38, slimeBonus: 0.14 },
    shadowfen: { resources: ["shadowEssence", "manaShards", "herbs"], bonusChance: 0.46, slimeBonus: 0.20 },
    volcanic:  { resources: ["refinedEssence", "arcaneDust", "stone"], bonusChance: 0.52, slimeBonus: 0.19 },
    celestial: { resources: ["divineShards", "manaShards", "refinedEssence"], bonusChance: 0.60, slimeBonus: 0.26 }
};

// ==================== TRAITS ====================
const TRAIT_DEFINITIONS = {
    // Training Traits
    "quick_learner":       { name: "Quick Learner", tier: "Common", desc: "+8% EXP from Quick and Focused training." },
    "training_focused":    { name: "Training Focused", tier: "Uncommon", desc: "+14% EXP from all Training Missions." },
    "endurance_specialist":{ name: "Endurance Specialist", tier: "Rare", desc: "+22% EXP from long training missions." },
    "training_prodigy":    { name: "Training Prodigy", tier: "Epic", desc: "+30% EXP from all Training Missions." },

    // Combat Traits
    "combat_instinct":  { name: "Combat Instinct", tier: "Common", desc: "+6% Power." },
    "elemental_adept":  { name: "Elemental Adept", tier: "Uncommon", desc: "+12% power vs strong element matchups." },
    "combat_veteran":   { name: "Combat Veteran", tier: "Rare", desc: "+18% Power." },
    "battle_hardened":  { name: "Battle Hardened", tier: "Epic", desc: "+25% Power." },

    // Resource Traits
    "jelly_producer":    { name: "Jelly Producer", tier: "Common", desc: "Produces extra Jelly from training and parties." },
    "resourceful":       { name: "Resourceful", tier: "Uncommon", desc: "+12% resources from exploration." },
    "essence_harvester": { name: "Essence Harvester", tier: "Rare", desc: "+20% Slime Essence from dungeons." },

    // Breeding Traits
    "stable_bloodline": { name: "Stable Bloodline", tier: "Common", desc: "Slightly better rarity when breeding." },
    "rare_lineage":     { name: "Rare Lineage", tier: "Rare", desc: "+15% better rarity chance when breeding." }
};

function getTraitChanceByRarity(rarity) {
    const chances = {
        "Common":    { chance: 0.25, rarePlus: 0.08 },
        "Uncommon":  { chance: 0.42, rarePlus: 0.18 },
        "Rare":      { chance: 0.65, rarePlus: 0.35 },
        "Epic":      { chance: 0.82, rarePlus: 0.55 },
        "Legendary": { chance: 0.95, rarePlus: 0.75 }
    };
    return chances[rarity] || { chance: 0.3, rarePlus: 0.15 };
}

function getRarityColor(rarity) {
    switch (rarity) {
        case "Common":    return "#9ca3af";
        case "Uncommon":  return "#22c55e";
        case "Rare":      return "#3b82f6";
        case "Epic":      return "#a855f7";
        case "Legendary": return "#f59e0b";
        default:          return "#aaff99";
    }
}

// Map progress helpers moved to js/systems/exploration.js (centralized)
// ==================== GLOBAL EXPOSURE (for current monolithic transition) ==================
window.ELEMENTS = ELEMENTS;
window.ELEMENT_NAMES = ELEMENT_NAMES;
window.elements = elements;
window.names = names;
window.TRAINING_MISSIONS = TRAINING_MISSIONS;
window.ELEMENT_CHART = ELEMENT_CHART;
window.BOSS_DATA = BOSS_DATA;
window.bossData = bossData;
window.UNLOCKABLE_AREAS = UNLOCKABLE_AREAS;
window.DUNGEON_REQUIREMENTS = DUNGEON_REQUIREMENTS;
window.BOSS_REQUIREMENTS = BOSS_REQUIREMENTS;
window.MILESTONES = MILESTONES;
window.VOID_TOWER_MIN_LEVEL = VOID_TOWER_MIN_LEVEL;
window.MAP_DATA = MAP_DATA;
window.REGION_LOOT_TABLES = REGION_LOOT_TABLES;
window.TRAIT_DEFINITIONS = TRAIT_DEFINITIONS;

window.getRarityColor = getRarityColor;
window.getTraitChanceByRarity = getTraitChanceByRarity;

console.log('✅ data/constants.js fully loaded (Phase 0)');