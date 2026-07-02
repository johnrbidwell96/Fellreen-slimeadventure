/* ============================================
   VISUALS.JS
   Slime visual rendering system + battle / reveal helpers.
   Pure DOM + CSS. Used to make the game feel like a real collector title.
============================================ */

// Element theme definitions (color + icon)
const ELEMENT_VISUALS = {
    Water:    { color: '#4fc3f7', icon: '💧', bg: '#0b3b4a' },
    Fire:     { color: '#f87171', icon: '🔥', bg: '#4a1f1f' },
    Earth:    { color: '#a78a5c', icon: '🪨', bg: '#2f2a1f' },
    Wind:     { color: '#86efac', icon: '🌬️', bg: '#1f3a2a' },
    Plant:    { color: '#4ade80', icon: '🌿', bg: '#15381f' },
    Lightning:{ color: '#facc15', icon: '⚡', bg: '#3a3318' },
    Ice:      { color: '#67e8f9', icon: '❄️', bg: '#1a2f3a' },
    Shadow:   { color: '#a78bfa', icon: '🌑', bg: '#211c35' },
    Light:    { color: '#fde047', icon: '✨', bg: '#3a3520' },
    Metal:    { color: '#94a3b8', icon: '⚙️', bg: '#262c35' },
    Poison:   { color: '#c084fc', icon: '☠️', bg: '#2a1f3a' },
    Crystal:  { color: '#7dd3fc', icon: '💎', bg: '#1f2a3a' },
    Lava:     { color: '#fb923c', icon: '🌋', bg: '#3a2218' },
    Storm:    { color: '#60a5fa', icon: '⛈️', bg: '#1f263a' },
    Spirit:   { color: '#e0f2fe', icon: '👻', bg: '#2a2f3a' },
    Void:     { color: '#c026ff', icon: '🕳️', bg: '#241a35' }
};

function getElementVisuals(element) {
    return ELEMENT_VISUALS[element] || { color: '#77ffaa', icon: '🟢', bg: '#113322' };
}

function getRarityStyles(rarity) {
    const base = (typeof getRarityColor === 'function') ? getRarityColor(rarity) : '#aaff99';
    return {
        borderColor: base,
        glow: (rarity === 'Legendary') ? '0 0 14px ' + base : (rarity === 'Epic') ? '0 0 9px ' + base : ''
    };
}

// Creates a rich visual representation of a slime using CSS only.
function createSlimeVisual(slime, opts = {}) {
    const size = opts.size || 'md';
    const vis = getElementVisuals(slime.element);
    const rarityClass = `rarity-${slime.rarity || 'Common'}`;

    const wrapper = document.createElement('div');
    wrapper.className = `slime-visual ${sizeClass(size)} ${rarityClass}`;
    if (opts.interactive) wrapper.style.cursor = 'pointer';

    const body = document.createElement('div');
    body.className = 'slime-body';
    body.style.background = `linear-gradient(145deg, ${vis.color} 0%, ${adjustColor(vis.color, -18)} 55%, ${vis.color} 100%)`;
    body.style.borderColor = '#fff';

    const shine = document.createElement('div');
    shine.className = 'shine';
    body.appendChild(shine);

    // Element badge
    const badge = document.createElement('div');
    badge.className = 'slime-element-badge';
    badge.innerText = vis.icon;
    body.appendChild(badge);

    // Level badge
    const lvl = document.createElement('div');
    lvl.className = 'slime-level-badge';
    lvl.innerText = 'Lv' + (slime.level || 1);
    body.appendChild(lvl);

    wrapper.appendChild(body);

    // Optional small trait indicator
    if (opts.showTraits && slime.traits && slime.traits.length > 0) {
        const t = document.createElement('div');
        t.style.cssText = 'position:absolute;bottom:-1px;left:2px;font-size:9px;opacity:0.85;';
        t.innerText = '★';
        wrapper.appendChild(t);
    }

    wrapper._slime = slime;
    return wrapper;
}

function sizeClass(size) {
    if (size === 'sm') return 'size-sm';
    if (size === 'lg') return 'size-lg';
    if (size === 'xl') return 'size-xl';
    return '';
}

function adjustColor(hex, amount) {
    try {
        let r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
        r = Math.max(0, Math.min(255, r + amount));
        g = Math.max(0, Math.min(255, g + amount));
        b = Math.max(0, Math.min(255, b + amount));
        return '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('');
    } catch(e) { return '#113322'; }
}

// Celebratory reveal modal when a new slime is tamed
function showNewSlimeReveal(slime) {
    if (!slime) return;
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';

    const vis = createSlimeVisual(slime, { size: 'xl' });

    modal.innerHTML = `
        <div class="modal-content result-modal" style="max-width:420px; text-align:center;">
            <div style="color:#ffdd77; font-size:14px; margin-bottom:4px;">✨ NEW SLIME TAMED! ✨</div>
            <div style="margin:10px 0;">${vis.outerHTML}</div>
            <div style="font-size:15px;"><strong>${slime.name}</strong> <span style="color:${getRarityColor(slime.rarity)};">(${slime.rarity} ${slime.element})</span></div>
            <div style="font-size:12px; opacity:0.85; margin-top:6px;">Lv ${slime.level} • ${slime.power} PWR</div>
            ${slime.traits && slime.traits.length ? `<div style="margin-top:8px; font-size:11px; color:#aaffcc;">Traits: ${slime.traits.map(t => (window.TRAIT_DEFINITIONS && TRAIT_DEFINITIONS[t]) ? TRAIT_DEFINITIONS[t].name : t).join(', ')}</div>` : ''}
            <button onclick="this.closest('.modal').remove(); if(typeof updateUI==='function') updateUI();" style="margin-top:14px; width:auto; min-height:38px; padding:6px 20px;">Awesome!</button>
        </div>
    `;
    document.body.appendChild(modal);

    setTimeout(() => {
        const v = modal.querySelector('.slime-visual');
        if (v) {
            v.style.cursor = 'pointer';
            v.onclick = () => {
                modal.remove();
                const real = (window.game && game.slimes) ? game.slimes.find(x => x.id === slime.id) : null;
                if (real && typeof openSlimeDetail === 'function') openSlimeDetail(real);
            };
        }
    }, 30);
}

// Animated battle presentation for bosses
function showBattleSequence(playerSlimes, boss, resultData) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';

    const arenaHTML = `
        <div class="modal-content battle-modal" style="max-width:620px;">
            <h2 style="margin:0 0 6px 0; text-align:center;">${resultData.success ? '⚔️ Victory!' : '💥 Defeat...'}</h2>
            <div class="battle-arena">
                <div class="battle-side">
                    <div class="label">YOUR TEAM</div>
                    <div id="battle-player-team" style="display:flex; gap:6px;"></div>
                </div>
                <div style="text-align:center; font-size:11px; opacity:0.75; min-width:70px;">
                    VS<br>
                    <strong style="font-size:13px; color:#ffdd88;">${boss.name}</strong><br>
                    <span style="color:${getElementVisuals(boss.element).color};">${boss.element}</span>
                </div>
                <div class="battle-side">
                    <div class="label">BOSS</div>
                    <div id="battle-boss" style="display:flex; justify-content:center;"></div>
                </div>
            </div>
            <div id="battle-log" style="margin:10px 0; min-height:48px; background:#0a2a1a; border-radius:6px; padding:8px; font-size:12px; text-align:center;"></div>
            <div style="text-align:center;">
                <button onclick="this.closest('.modal').remove(); if(typeof updateUI==='function') updateUI();" style="width:auto; min-height:36px; padding:6px 18px;">Continue</button>
            </div>
        </div>
    `;
    modal.innerHTML = arenaHTML;
    document.body.appendChild(modal);

    const playerTeamEl = modal.querySelector('#battle-player-team');
    const bossEl = modal.querySelector('#battle-boss');
    const logEl = modal.querySelector('#battle-log');

    playerSlimes.forEach(s => {
        const v = createSlimeVisual(s, { size: 'sm' });
        playerTeamEl.appendChild(v);
    });

    const bossVis = document.createElement('div');
    bossVis.style.cssText = `width:72px;height:72px;border-radius:50%;background:${getElementVisuals(boss.element).color};display:flex;align-items:center;justify-content:center;border:4px solid #fff;font-size:28px;box-shadow:0 0 10px rgba(0,0,0,0.4);`;
    bossVis.innerText = getElementVisuals(boss.element).icon;
    bossEl.appendChild(bossVis);

    const steps = [
        () => { logEl.innerHTML = `Team power: <strong>${resultData.finalPower}</strong> vs ${boss.basePower}`; },
        () => { logEl.innerHTML = resultData.success ? 'Advantage strikes land!' : 'The boss overpowers your team...'; },
        () => {
            if (resultData.success) {
                logEl.innerHTML = `+${resultData.gold} Gold • +${resultData.essence} Essence` + (resultData.divineGain ? ` • +${resultData.divineGain} Divine` : '');
            } else {
                logEl.innerHTML = 'Better luck (and better element matchups) next time.';
            }
        }
    ];

    let i = 0;
    const interval = setInterval(() => {
        if (i < steps.length) {
            steps[i]();
            i++;
        } else {
            clearInterval(interval);
            if (resultData.success) {
                logEl.innerHTML += `<div style="margin-top:6px; color:#4ade80; font-weight:700;">VICTORY!</div>`;
            }
        }
    }, 620);
}

// Make some functions globally available for the current monolithic script during transition
window.ELEMENT_VISUALS = ELEMENT_VISUALS;
window.getElementVisuals = getElementVisuals;
window.createSlimeVisual = createSlimeVisual;
window.showNewSlimeReveal = showNewSlimeReveal;
window.showBattleSequence = showBattleSequence;