/* ============================================
   MAIN.JS
   Bootstrap, initialization, tab management, and high-level wiring.
   Phase 0 clean entry point.
============================================ */

let currentTab = 0;

function initGame() {
    console.log('🚀 Initializing Slime Adventure (Phase 0 modular)...');

    // Load saved game
    let loaded = false;
    if (typeof loadGame === 'function') {
        loaded = loadGame();
    }
    if (!loaded) {
        console.log('New game started.');
        if (window.game) {
            // ensure defaults
        }
    }

    (window.sanitizeParty || (() => {}))();

    // Ensure map progress inited for greenwild at least
    if (typeof window.getMapProgress === 'function') {
        window.getMapProgress('greenwild');
    }

    // Dark mode
    if (typeof loadDarkModePreference === 'function') {
        loadDarkModePreference();
    } else if (typeof window.loadDarkModePreference === 'function') {
        window.loadDarkModePreference();
    }

    // Auto save
    if (typeof startAutoSave === 'function') {
        startAutoSave();
    }

    // Initial UI + Map
    if (!window.currentMapDifficulty) window.currentMapDifficulty = "Easy";
    switchTab(0);

    if (typeof updateUI === 'function') updateUI();

    // Initial lock states for dungeons / bosses (makes locked text show/hide correctly)
    if (typeof window.updateDungeonLocks === 'function') window.updateDungeonLocks();
    if (typeof window.updateBossLocks === 'function') window.updateBossLocks();
    if (typeof window.updateExploreLocks === 'function') window.updateExploreLocks();

    // Force the module's renderMap and key functions
    if (typeof renderMap === 'function') window.renderMap = renderMap;
    const doRender = window.renderMap || (typeof renderMap === 'function' ? renderMap : null);
    if (doRender) {
        // Pick a sensible starting view: prefer the most advanced region the player has access to.
        let startRegion = 'greenwild';
        try {
            const gp = (typeof getMapProgress === 'function') ? getMapProgress : (r => (window.game && window.game.mapProgress && window.game.mapProgress[r]) || {cleared:[]});
            if ((gp('crystal').cleared || []).includes('cm3')) startRegion = 'shadowfen';
            else if ((gp('greenwild').cleared || []).includes('gw4')) startRegion = 'crystal';
        } catch(e){}
        doRender(startRegion);
    }

    // Ensure exploration functions are on window (in case of override)
    if (typeof exploreNode === 'function') window.exploreNode = exploreNode;
    if (typeof farmClearedNode === 'function') window.farmClearedNode = farmClearedNode;
    if (typeof autoExploreClearedNodes === 'function') window.autoExploreClearedNodes = autoExploreClearedNodes;
    if (typeof renderMap === 'function') window.renderMap = renderMap;

    // Force doExplore and helpers (robust)
    if (typeof doExplore === 'function') window.doExplore = doExplore;
    if (typeof generateRandomSlime === 'function') window.generateRandomSlime = generateRandomSlime;
    if (typeof gainPlayerExp === 'function') window.gainPlayerExp = gainPlayerExp;

    // Aggressive search on window for doExplore (to handle any scoping/override)
    if (typeof window.doExplore !== 'function') {
        for (let k in window) {
            if (k.toLowerCase().includes('doexplore') && typeof window[k] === 'function') {
                window.doExplore = window[k];
                console.log('[DEBUG main] Found doExplore on window as', k);
                break;
            }
        }
    }

    // Ensure MAP_DATA is on window
    if (!window.MAP_DATA) {
        if (typeof MAP_DATA !== 'undefined') window.MAP_DATA = MAP_DATA;
        else {
            for (let k in window) {
                if (k.toUpperCase().includes('MAP') && window[k] && typeof window[k] === 'object' && window[k].greenwild) {
                    window.MAP_DATA = window[k];
                    break;
                }
            }
        }
    }
    if (window.MAP_DATA) console.log('[DEBUG main] MAP_DATA present for regions:', Object.keys(window.MAP_DATA));

    // Start mission timer system if available
    if (typeof startMissionTimerSystem === 'function') {
        startMissionTimerSystem();
    }

    console.log('✅ Slime Adventure fully initialized!');
}

function switchTab(tabIndex) {
    currentTab = tabIndex;

    document.querySelectorAll('.content').forEach(content => {
        content.classList.remove('active');
    });

    const tabContent = document.getElementById(`tab${tabIndex}`);
    if (tabContent) tabContent.classList.add('active');

    document.querySelectorAll('.tab').forEach((tab, index) => {
        tab.classList.toggle('active', index === tabIndex);
    });

    // Tab-specific refresh
    if (tabIndex === 0) {
        if (typeof renderMap === 'function') {
            const lastRegion = window.currentMapRegion || 'greenwild';
            setTimeout(() => renderMap(lastRegion), 50);
        }
    }
    if (tabIndex === 9 && typeof renderRecords === 'function') {
        setTimeout(() => renderRecords(), 80);
    }
    if (tabIndex === 1) {
        // Refresh dungeon/boss lock states when opening Dungeons tab
        setTimeout(() => {
            if (typeof window.updateDungeonLocks === 'function') window.updateDungeonLocks();
            if (typeof window.updateBossLocks === 'function') window.updateBossLocks();
        }, 30);
    }
    if (typeof updateUI === 'function') updateUI();
}

// Expose
window.switchTab = switchTab;
window.initGame = initGame;

// Boot
window.addEventListener('load', () => {
    // Small delay in case some scripts finish async
    setTimeout(initGame, 30);
});

console.log('✅ main.js loaded (Phase 0)');