/* ============================================
   DATA/CONSTANTS.JS
   All game constants, elements, map data, bosses, etc.
   Single source of truth for static data.
============================================ */

const ELEMENTS = ["Water","Fire","Earth","Wind","Plant","Lightning","Ice","Shadow","Light","Metal","Poison","Crystal","Lava","Storm","Spirit","Void"];

const ELEMENT_NAMES = {
    Water: ["Aqua"], Fire: ["Blaze"], Earth: ["Terra"], Wind: ["Zephyr"],
    Plant: ["Bloom"], Lightning: ["Bolt"], Ice: ["Frost"], Shadow: ["Shade"],
    Light: ["Lumina"], Metal: ["Steel"], Poison: ["Venom"], Crystal: ["Gem"],
    Lava: ["Magma"], Storm: ["Tempest"], Spirit: ["Wisp"], Void: ["Abyss"]
};

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
    // ... (other regions can be expanded here)
    shadowfen: { /* ... */ },
    volcanic: { /* ... */ },
    celestial: { /* ... */ }
};

const DUNGEON_REQUIREMENTS = {
    forest_depths: 3, crystal_caverns: 8, shadow_abyss: 18, ancient_temple: 30,
    molten_core: 42, glacial_spire: 48, thunder_sanctum: 55, abyssal_throne: 68, origin_core: 82
};

const BOSS_REQUIREMENTS = {
    fire_dragon: 15, stone_golem: 28, ancient_treant: 45,
    shadow_lich: 62, storm_sovereign: 78, divine_colossus: 92
};

const MILESTONES = [
    { level: 30, name: "+5% Global Power", effect: () => { /* handled in progression */ } },
    { level: 50, name: "+2 extra Stat Points per level-up", effect: () => {} },
    // Add more as needed
];

// Make available globally for now (transition to imports later)
window.ELEMENTS = ELEMENTS;
window.ELEMENT_NAMES = ELEMENT_NAMES;
window.TRAINING_MISSIONS = TRAINING_MISSIONS;
window.ELEMENT_CHART = ELEMENT_CHART;
window.BOSS_DATA = BOSS_DATA;
window.MAP_DATA = MAP_DATA;
window.DUNGEON_REQUIREMENTS = DUNGEON_REQUIREMENTS;
window.BOSS_REQUIREMENTS = BOSS_REQUIREMENTS;
window.MILESTONES = MILESTONES;

console.log('✅ data/constants.js loaded');