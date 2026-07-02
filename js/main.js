/* ============================================
   MAIN.JS
   Bootstrap, initialization, tab management, and high-level wiring.
   Entry point for the full game loop.
============================================ */

// Initialization
function initGame() {
    console.log('🚀 Initializing Slime Adventure...');

    // Load saved game (or use defaults)
    const loaded = loadGame();
    if (!loaded) {
        console.log('New game started.');
    }

    // Load dark mode preference
    loadDarkModePreference();

    // Start auto-save
    startAutoSave();

    // Initial renders
    switchTab(0); // Start on Map tab
    updateUI();
    renderMap('greenwild');
    updateHavenGrid(); // Assuming this exists or will be in ui.js

    console.log('✅ Slime Adventure fully initialized!');
}

// Tab switching
let currentTab = 0;
function switchTab(tabIndex) {
    currentTab = tabIndex;
    
    // Hide all content
    document.querySelectorAll('.content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Show selected
    const tabContent = document.getElementById(`tab${tabIndex}`);
    if (tabContent) tabContent.classList.add('active');
    
    // Update tab styles
    document.querySelectorAll('.tab').forEach((tab, index) => {
        tab.classList.toggle('active', index === tabIndex);
    });

    // Refresh specific tabs if needed
    if (tabIndex === 0) renderMap('greenwild');
    if (tabIndex === 9) updateRecordsUI(); // Example
}

// Make global
window.switchTab = switchTab;
window.initGame = initGame;

// Auto-init on load
window.addEventListener('load', initGame);

console.log('✅ main.js loaded');