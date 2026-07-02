/* ============================================
   UI.JS
   All rendering, modals, haven grid, updates, and UI interactions.
   Keeps presentation separate from state/logic.
============================================ */

// Haven Grid (Your Slimes)
function updateHavenGrid() {
    const grid = document.getElementById('havenGrid');
    if (!grid) return;
    grid.innerHTML = '';

    if (!game.slimes || game.slimes.length === 0) {
        grid.innerHTML = '<div style="opacity:0.6; padding:20px;">No slimes yet. Explore to tame some!</div>';
        return;
    }

    game.slimes.slice(0, 8).forEach(slime => {  // Show top 8 in haven
        const visual = createSlimeVisual(slime, { size: 'sm', interactive: true });
        visual.onclick = () => showSlimeDetail(slime);
        grid.appendChild(visual);
    });
}

// Main Update Function
function updateUI() {
    // Player level / exp
    document.getElementById('playerLevel').textContent = game.playerLevel || 1;
    // Add more resource displays, etc.

    updateHavenGrid();
    // Call other renders as needed
}

// Modal helpers (examples)
function showSlimeDetail(slime) {
    // Implement detail modal logic here
    console.log('Showing detail for:', slime);
    // Full implementation can be expanded
}

function closeSlimeDetailModal() {
    // Close logic
    console.log('Detail modal closed');
}

// Add more as needed (boss modals, training, etc.)

console.log('✅ ui.js loaded');

// Make global
window.updateUI = updateUI;
window.updateHavenGrid = updateHavenGrid;
window.showSlimeDetail = showSlimeDetail;