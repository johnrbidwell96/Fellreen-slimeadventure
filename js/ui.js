/* ============================================
   UI.JS
   All rendering, modals, haven grid, updates, and UI interactions.
   Phase 0: Moving presentation out of index.html
============================================ */

// ===== CORE UI UPDATES =====
function updateSummary() {
    const levelEl = document.getElementById('playerLevel');
    const expEl = document.getElementById('playerExpText');
    const goldEl = document.getElementById('goldDisplay');
    const divineEl = document.getElementById('divineDisplay');

    if (levelEl) levelEl.innerText = (window.game && game.playerLevel) || 1;
    if (expEl && window.game) expEl.innerText = `(${game.playerExp}/${game.playerExpToNext})`;
    if (goldEl && window.game) goldEl.innerText = (game.resources && game.resources.gold) || 0;
    if (divineEl && window.game) divineEl.innerText = (game.resources && game.resources.divineShards) || 0;
}

function updateHavenGrid() {
    const grid = document.getElementById('havenGrid');
    if (!grid || !window.game) return;
    grid.innerHTML = '';

    const allSlimes = (game.slimes || []);
    let displaySlimes = [];

    // === PARTY SYSTEM: Top bar now shows your selected party ===
    if (typeof getParty === 'function') {
        displaySlimes = getParty();
    }
    if (displaySlimes.length === 0) {
        const maxFallback = (typeof getMaxPartySize === 'function') ? getMaxPartySize() : 30;
        displaySlimes = allSlimes.slice(0, maxFallback); // fallback until you set a party
    }

    // Show party size + total collection in the header
    const havenBar = grid.parentElement;
    if (havenBar) {
        const label = havenBar.querySelector('strong');
        const partyPower = (typeof getPartyPower === 'function') ? getPartyPower() : 0;
        if (label) {
            const pSize = displaySlimes.length;
            const maxP = (typeof getMaxPartySize === 'function') ? getMaxPartySize() : 30;
            const total = allSlimes.length;
            const officialParty = (typeof getParty === 'function' && getParty().length > 0);
            label.textContent = officialParty ? 
                `🐾 Your Party (${pSize}/${maxP}) • Power: ${partyPower} • Total: ${total}` : 
                `🐾 Top Slimes (set party in Manage) • Total: ${total}`;
        }
    }

    if (allSlimes.length === 0) {
        grid.innerHTML = '<div style="opacity:0.65; padding:12px 8px; font-size:11px;">No slimes yet. Explore the map to tame your first companion!</div>';
        return;
    }

    if (displaySlimes.length === 0) {
        grid.innerHTML = '<div style="opacity:0.7; padding:8px; font-size:11px; cursor:pointer;" onclick=" (window.openSlimeManagementModal||(()=>{}))() ">No party selected. Click "View All Slimes" in Manage tab to build your active party.</div>';
        return;
    }

    // Render the party members (these are the ones that matter for exploration/dungeons)
    displaySlimes.forEach(slime => {
        const card = document.createElement('div');
        card.style.cssText = `
            display: flex; flex-direction: column; align-items: center; 
            background: #0a2a1a; border: 2px solid #77ffaa; border-radius: 10px; 
            padding: 6px 4px 8px; min-width: 68px; max-width: 78px;
            cursor: pointer; transition: transform .15s ease, box-shadow .15s ease, border-color .15s;
        `;
        card.onmouseenter = () => { 
            card.style.transform = 'translateY(-2px) scale(1.03)'; 
            card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)'; 
            const rc = (typeof getRarityColor === 'function') ? getRarityColor(slime.rarity) : '#aaff99';
            card.style.borderColor = rc || '#aaff99';
        };
        card.onmouseleave = () => { 
            card.style.transform = ''; 
            card.style.boxShadow = ''; 
            card.style.borderColor = '#77ffaa';
        };

        // Larger, livelier visual for connection
        const visual = createSlimeVisual(slime, { size: 'md', interactive: true, showTraits: !!(slime.traits && slime.traits.length) });
        
        // Name makes them feel like individuals, not icons
        const nameEl = document.createElement('div');
        nameEl.style.cssText = 'font-size:10px; font-weight:700; margin-top:4px; text-align:center; max-width:72px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:#ccffdd;';
        nameEl.textContent = slime.name || 'Slime';

        const metaEl = document.createElement('div');
        metaEl.style.cssText = 'font-size:8.5px; opacity:0.85; text-align:center; line-height:1.1;';
        const rarityColor = (typeof getRarityColor === 'function') ? getRarityColor(slime.rarity) : '#aaff99';
        metaEl.innerHTML = `<span style="color:${rarityColor};">${slime.rarity || 'Common'}</span><br>Lv${slime.level||1} • ${slime.power||0} PWR`;

        card.appendChild(visual);
        card.appendChild(nameEl);
        card.appendChild(metaEl);

        card.onclick = () => showSlimeDetail(slime);
        grid.appendChild(card);
    });

    // Quick hint for full collection
    const extra = allSlimes.length - displaySlimes.length;
    if (extra > 0) {
        const more = document.createElement('div');
        more.style.cssText = 'font-size:9px; opacity:0.7; align-self:center; margin-top:4px; cursor:pointer; text-decoration:underline;';
        more.textContent = `+${extra} more in collection — open Manage for full list & party edits`;
        more.onclick = (e) => {
            e.stopPropagation();
            const openFn = window.openSlimeManagementModal || (() => {});
            openFn();
        };
        grid.appendChild(more);
    }
}

function updateUI() {
    if (!window.game) return;

    (window.sanitizeParty || (() => {}))();

    updateSummary();
    updateHavenGrid();

    // Update other dynamic displays if present
    const alchemyEl = document.getElementById('alchemyBonus');
    if (alchemyEl && game.player && game.player.stats) {
        alchemyEl.innerText = Math.floor((game.player.stats.alchemy || 0) * 4);
    }

    if (typeof renderInventory === 'function') renderInventory();
    if (typeof renderPlayer === 'function') renderPlayer();

    // Update visible party power displays (helpful for gauging dungeon readiness)
    const partyPwr = (typeof getPartyPower === 'function') ? getPartyPower() : 0;
    const dunPwrEl = document.getElementById('dungeonPartyPower');
    if (dunPwrEl) dunPwrEl.innerText = partyPwr;
}

function log(msg) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = msg;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.transition = 'opacity 0.4s ease';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 400);
    }, 2200);
}

// Toggle collapsible sections (used by Dungeons tab headers, Manage, Alchemy etc.)
function toggleSection(section) {
    if (!section) return;
    let el = document.getElementById(section + 'Content');
    if (!el) el = document.getElementById(section);
    if (!el) return;
    el.classList.toggle('collapsed');
}
window.toggleSection = toggleSection;

let currentTraitTooltip = null;

function showTraitTooltip(element, traitKey) {
    hideTraitTooltip();
    const defs = window.TRAIT_DEFINITIONS || {};
    const def = defs[traitKey] || { name: traitKey, description: 'A mysterious trait.' };
    const tooltip = document.createElement('div');
    tooltip.style.cssText = 'position:absolute;z-index:99999;background:#0a1f14;border:1px solid #77ffaa;padding:6px 9px;border-radius:6px;font-size:11px;max-width:240px;pointer-events:none;box-shadow:0 2px 6px rgba(0,0,0,0.4);';
    tooltip.innerHTML = `<strong style="color:#aaff99;">${def.name || traitKey}</strong><br><span style="opacity:0.85;">${def.description || def.desc || ''}</span>`;
    document.body.appendChild(tooltip);
    currentTraitTooltip = tooltip;
    const r = element.getBoundingClientRect();
    tooltip.style.left = (r.left + window.scrollX + 2) + 'px';
    tooltip.style.top = (r.bottom + window.scrollY + 6) + 'px';
}

function hideTraitTooltip() {
    if (currentTraitTooltip && currentTraitTooltip.parentNode) currentTraitTooltip.parentNode.removeChild(currentTraitTooltip);
    currentTraitTooltip = null;
}

window.showTraitTooltip = showTraitTooltip;
window.hideTraitTooltip = hideTraitTooltip;

// ===== SLIME DETAIL =====
let currentDetailSlimeId = null;

function showSlimeDetail(slime) {
    openSlimeDetail(slime);
}

function openSlimeDetail(slime) {
    const modal = document.getElementById('slimeDetailModal');
    const content = document.getElementById('slimeDetailContent');
    if (!modal || !content || !slime || !window.game) return;

    currentDetailSlimeId = slime.id;
    content.innerHTML = '';

    const vis = createSlimeVisual(slime, { size: 'xl', showTraits: true });

    const traitList = (slime.traits && slime.traits.length)
        ? slime.traits.map(t => (window.TRAIT_DEFINITIONS && TRAIT_DEFINITIONS[t]) ? TRAIT_DEFINITIONS[t].name : t).join(', ')
        : 'None yet';

    const info = document.createElement('div');
    info.style.cssText = 'width:100%; max-width:320px;';
    info.innerHTML = `
        <div style="font-size:15px; margin:6px 0;"><strong>${slime.name}</strong> <span style="opacity:0.7;">(${slime.element})</span></div>
        <div style="margin-bottom:8px;">
            <span style="color:${getRarityColor(slime.rarity)}; font-weight:700;">${slime.rarity}</span>
            ${slime.evolved ? ' <span style="color:#ffdd77;">★ EVOLVED</span>' : ''}
            ${slime.locked ? ' <span style="color:#ffaa66;">🔒 LOCKED</span>' : ''}
            ${(typeof isInParty === 'function' && isInParty(slime.id)) ? ' <span style="color:#ffdd77;">★ IN PARTY</span>' : ''}
        </div>
        <div style="background:#0a2a1a; border:2px solid #77ffaa; border-radius:8px; padding:8px; font-size:12px; line-height:1.4; text-align:left;">
            Level ${slime.level || 1} • ${slime.power} PWR<br>
            EXP: ${slime.exp || 0}<br>
            <span style="opacity:0.85;">Traits: ${traitList}</span>
        </div>
    `;

    const actions = document.createElement('div');
    actions.style.cssText = 'display:flex; gap:6px; flex-wrap:wrap; justify-content:center; width:100%;';
    actions.innerHTML = `
        <button onclick="quickEvolveFromDetail()" style="width:auto; min-height:36px; padding:4px 12px; font-size:11px;">🌟 Evolve</button>
        <button onclick="quickLockFromDetail()" style="width:auto; min-height:36px; padding:4px 12px; font-size:11px;">🔒 Lock</button>
        <button onclick="quickTogglePartyFromDetail()" style="width:auto; min-height:36px; padding:4px 12px; font-size:11px; background:#2a3a22; border-color:#aaff99;">★ Party</button>
    `;

    content.appendChild(vis);
    content.appendChild(info);
    content.appendChild(actions);

    const lockBtn = document.getElementById('detailLockBtn');
    if (lockBtn) {
        lockBtn.innerText = slime.locked ? '🔓 Unlock' : '🔒 Lock';
        lockBtn.onclick = () => {
            quickLockFromDetail();
            const updated = game.slimes.find(s => s.id === currentDetailSlimeId);
            if (updated) openSlimeDetail(updated);
        };
    }

    modal.style.display = 'flex';
}

function closeSlimeDetailModal() {
    const modal = document.getElementById('slimeDetailModal');
    if (modal) modal.style.display = 'none';
    currentDetailSlimeId = null;
}

function quickLockFromDetail() {
    if (!window.game || !currentDetailSlimeId) return;
    const s = game.slimes.find(x => x.id === currentDetailSlimeId);
    if (s) {
        s.locked = !s.locked;
        if (typeof log === 'function') log(s.locked ? 'Slime locked.' : 'Slime unlocked.');
        if (typeof updateUI === 'function') updateUI();
    }
}

function quickEvolveFromDetail() {
    if (!window.game || !currentDetailSlimeId) return;
    const s = game.slimes.find(x => x.id === currentDetailSlimeId);
    if (!s) return;
    if (s.level < 10 || s.evolved) {
        if (typeof log === 'function') log('Needs Lv10+ and not yet evolved.');
        return;
    }
    s.evolved = true;
    s.level += 4;
    if (typeof recalculateSlimePower === 'function') recalculateSlimePower(s);
    if (window.game) game.totalEvolutions = (game.totalEvolutions || 0) + 1;
    if (typeof log === 'function') log(`${s.name} evolved!`);
    closeSlimeDetailModal();
    if (typeof updateUI === 'function') updateUI();
    setTimeout(() => {
        const fresh = game.slimes.find(x => x.id === s.id);
        if (fresh) openSlimeDetail(fresh);
    }, 120);
}

function quickTogglePartyFromDetail() {
    if (!window.game || !currentDetailSlimeId) return;
    const s = game.slimes.find(x => x.id === currentDetailSlimeId);
    if (!s) return;

    if (typeof togglePartyMember === 'function') {
        const wasIn = (typeof isInParty === 'function') ? isInParty(s.id) : false;
        const ok = togglePartyMember(s.id);
        if (ok) {
            if (typeof log === 'function') log(`${s.name} ${wasIn ? 'removed from' : 'added to'} party.`);
            if (typeof updateUI === 'function') updateUI();
            // refresh detail
            setTimeout(() => {
                const fresh = game.slimes.find(x => x.id === currentDetailSlimeId);
                if (fresh && document.getElementById('slimeDetailModal').style.display === 'flex') {
                    openSlimeDetail(fresh);
                }
            }, 50);
        }
    }
}

// ===== RENDERERS =====
function renderHaven() {
    // alias to the new implementation
    updateHavenGrid();
}

function renderInventory() {
    const container = document.getElementById('inventoryGrid');
    if (!container || !window.game) return;
    container.innerHTML = '';
    container.style.display = 'grid';
    container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(108px, 1fr))';
    container.style.gap = '6px';

    const items = [
        { key: 'wood', label: 'Wood', icon: '🪵' }, { key: 'jelly', label: 'Jelly', icon: '🫐' }, { key: 'herbs', label: 'Herbs', icon: '🌿' },
        { key: 'stone', label: 'Stone', icon: '🪨' }, { key: 'gold', label: 'Gold', icon: '🪙' },
        { key: 'trainingScrolls', label: 'Scrolls', icon: '📜' }, { key: 'battleElixir', label: 'Elixir', icon: '🧪' },
        { key: 'healingSalve', label: 'Salve', icon: '💊' }, { key: 'fertilityPotion', label: 'Fertility', icon: '🧬' },
        { key: 'refinedEssence', label: 'Refined', icon: '💎' }, { key: 'divineShards', label: 'Divine', icon: '✨' },
        { key: 'manaShards', label: 'Mana', icon: '🔷' }, { key: 'explorerTonic', label: 'Tonic', icon: '🍯' }
    ];

    items.forEach(item => {
        const val = (game.resources && game.resources[item.key]) || 0;
        if (val > 0) {
            const div = document.createElement('div');
            div.style.cssText = 'background:#113322; border:2px solid #77ffaa; border-radius:8px; padding:6px 8px; display:flex; align-items:center; gap:6px;';
            div.innerHTML = `<span style="font-size:16px;">${item.icon}</span><div><strong>${item.label}</strong><br><span style="font-size:12px;">${val}</span></div>`;
            container.appendChild(div);
        }
    });
}

function renderPlayer() {
    const container = document.getElementById('playerStats');
    if (!container || !window.game || !game.player) return;
    const s = game.player.stats || {};
    const alchemyBonus = Math.floor((s.alchemy || 0) * 4);
    container.innerHTML = `
        <div class="stat-row"><strong>Stat Points Available:</strong> ${game.player.statPoints || 0}</div>
        <div class="stat-row"><strong>Taming:</strong> ${s.taming || 0} <small>(+${(s.taming||0) * 3}% better rarity)</small></div>
        <div class="stat-row"><strong>Alchemy:</strong> ${s.alchemy || 0} <small>(+${alchemyBonus}% better yields)</small></div>
        <div class="stat-row"><strong>Combat:</strong> ${s.combat || 0} <small>(+${(s.combat||0) * 2.5}% team power)</small></div>
        <div class="stat-row"><strong>Leadership:</strong> ${s.leadership || 0} <small>(+1 party slot per point, up to 30)</small></div>
        <div class="stat-row"><strong>Endurance:</strong> ${s.endurance || 0} <small>(+${(s.endurance||0) * 5}% daily rewards)</small></div>
        <div class="stat-row"><strong>Party Power:</strong> ${typeof getPartyPower === 'function' ? getPartyPower() : 0} <small>(sum of your active party)</small></div>
    `;
}

function renderWorkshop() {
    const container = document.getElementById('workshopUpgrades');
    if (!container || !window.game) return;
    const refineryLevel = (game.workshop && game.workshop.refinery) || 0;
    container.innerHTML = `
        <button onclick="upgradeWorkshop('incubator')">Upgrade Incubator (Breeding) - 120 Gold + 8 Refined Essence</button>
        <button onclick="upgradeWorkshop('trainingHall')">Upgrade Training Hall - 150 Gold + 10 Refined Essence</button>
        <button onclick="upgradeWorkshop('refinery')">Upgrade Refinery (Alchemy) - 180 Gold + 12 Refined Essence<br><small>Current: Level ${refineryLevel} (+${refineryLevel * 15}% Refined yield)</small></button>
        <button onclick="upgradeWorkshop('advanced')">Advanced Workshop - 800 Gold + 25 Mana Shards + 8 Divine Shards</button>
    `;
}

function renderRecords() {
    if (!window.game) return;

    const combatEl = document.getElementById('combatStats');
    if (combatEl) {
        combatEl.innerHTML = `
            <div><strong>Total Damage Dealt:</strong> ${Math.floor(game.totalDamageDealt || 0).toLocaleString()}</div>
            <div><strong>Bosses Defeated:</strong> ${game.totalBossesDefeated || 0}</div>
        `;
    }

    const progEl = document.getElementById('progressionStats');
    if (progEl) {
        progEl.innerHTML = `
            <div><strong>Highest Level:</strong> ${game.highestLevel || 1}</div>
            <div><strong>Dungeons Cleared:</strong> ${game.totalDungeonsCleared || 0}</div>
            <div><strong>Divine Shards Earned:</strong> ${game.lifetimeDivineShards || 0}</div>
        `;
    }

    const collEl = document.getElementById('collectionStats');
    if (collEl) {
        collEl.innerHTML = `
            <div><strong>Slimes Tamed:</strong> ${game.lifetimeSlimesTamed || 0}</div>
            <div><strong>Fusions Performed:</strong> ${game.totalFusions || 0}</div>
            <div><strong>Evolutions Performed:</strong> ${game.totalEvolutions || 0}</div>
        `;
    }

    const otherEl = document.getElementById('otherStats');
    if (otherEl) {
        const bonusPercent = Math.round(((game.globalPowerBonus || 1) - 1) * 100);
        otherEl.innerHTML = `
            <div><strong>Global Power Bonus:</strong> +${bonusPercent}%</div>
            <div><strong>Divine Convergences:</strong> ${game.divineConvergenceCount || 0}</div>
        `;
    }

    const traitEl = document.getElementById('traitStats');
    if (traitEl && window.TRAIT_DEFINITIONS) {
        let totalTraits = 0;
        let tierCount = { Common: 0, Uncommon: 0, Rare: 0, Epic: 0 };
        let uniqueTraits = new Set();

        if (game.slimes && game.slimes.length > 0) {
            game.slimes.forEach(slime => {
                if (slime.traits && slime.traits.length > 0) {
                    totalTraits += slime.traits.length;
                    slime.traits.forEach(traitKey => {
                        uniqueTraits.add(traitKey);
                        const def = TRAIT_DEFINITIONS[traitKey];
                        if (def && tierCount[def.tier] !== undefined) tierCount[def.tier]++;
                    });
                }
            });
        }

        let html = `
            <div style="margin-bottom:8px;">
                <strong>Total Traits:</strong> ${totalTraits} &nbsp;&nbsp; 
                <strong>Unique:</strong> ${uniqueTraits.size}
            </div>
            <div style="margin-bottom:10px; font-size:11px;">
                <strong>By Tier:</strong><br>
                <span style="color:#9ca3af;">Common:</span> <strong>${tierCount.Common}</strong> &nbsp;
                <span style="color:#4ade80;">Uncommon:</span> <strong>${tierCount.Uncommon}</strong> &nbsp;
                <span style="color:#60a5fa;">Rare:</span> <strong>${tierCount.Rare}</strong> &nbsp;
                <span style="color:#c084fc;">Epic:</span> <strong>${tierCount.Epic}</strong>
            </div>
        `;

        if (uniqueTraits.size > 0) {
            html += `<div style="margin-top:6px;"><strong>Your Traits:</strong></div>`;
            html += `<div style="margin-top:4px; display:flex; flex-wrap:wrap; gap:6px; max-height:80px; overflow-y:auto;">`;
            uniqueTraits.forEach(traitKey => {
                const def = TRAIT_DEFINITIONS[traitKey];
                if (def) {
                    const tierColor = def.tier === "Epic" ? "#c084fc" : (def.tier === "Rare" ? "#60a5fa" : (def.tier === "Uncommon" ? "#4ade80" : "#9ca3af"));
                    html += `<span onmouseenter="showTraitTooltip(this, '${traitKey}')" onmouseleave="hideTraitTooltip()"
                        style="background:#113322; border:1px solid ${tierColor}; border-radius:6px; padding:3px 8px; font-size:10px; color:${tierColor}; cursor:help;">
                        ${def.name}
                    </span>`;
                }
            });
            html += `</div>`;
        } else {
            html += `<div style="margin-top:8px; opacity:0.7; font-size:11px;">No traits yet. Higher rarity slimes are more likely to have traits.</div>`;
        }
        traitEl.innerHTML = html;
    }
}

// ===== FORMAT + HELPERS =====
function formatRemainingTime(seconds) {
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m < 60) return `${m}m ${s}s`;
    const h = Math.floor(m / 60);
    return `${h}h ${m % 60}m`;
}

// ===== MANAGEMENT MODAL FILTERS =====
// Full implementation lives in js/systems/management.js (loaded later, overrides window.filterSlimeList)

// ===== GLOBAL EXPORTS =====
window.updateUI = updateUI;
window.updateHavenGrid = updateHavenGrid;
window.updateSummary = updateSummary;
window.renderHaven = renderHaven;
window.renderInventory = renderInventory;
window.renderPlayer = renderPlayer;
window.renderWorkshop = renderWorkshop;
window.renderRecords = renderRecords;
window.showSlimeDetail = showSlimeDetail;
window.openSlimeDetail = openSlimeDetail;
window.closeSlimeDetailModal = closeSlimeDetailModal;
window.log = log;
window.formatRemainingTime = formatRemainingTime;
window.toggleSection = toggleSection;

console.log('✅ ui.js loaded (Phase 0 - expanded)');