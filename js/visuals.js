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
// Raid Shadow Legends inspired: premium cards with strong visual identity per rarity + element.
function createSlimeVisual(slime, opts = {}) {
    const size = opts.size || 'md';
    const vis = getElementVisuals(slime.element);
    const rarity = slime.rarity || 'Common';
    const rarityClass = `rarity-${rarity}`;

    const wrapper = document.createElement('div');
    wrapper.className = `slime-visual ${sizeClass(size)} ${rarityClass}`;
    wrapper.dataset.element = slime.element;
    if (opts.interactive) wrapper.style.cursor = 'pointer';

    // Outer rarity frame for collector premium feel
    const frame = document.createElement('div');
    frame.className = 'rarity-frame';
    wrapper.appendChild(frame);

    const body = document.createElement('div');
    body.className = 'slime-body';
    body.style.background = `linear-gradient(145deg, ${vis.color} 0%, ${adjustColor(vis.color, -18)} 55%, ${vis.color} 100%)`;
    body.style.borderColor = '#fff';

    // Add shape variation for rarity + element personality (Raid collector vibe)
    let bodyRadius = '50%';
    if (rarity === 'Epic' || rarity === 'Legendary') {
        bodyRadius = '45% 55% 48% 52%';
    } else if (rarity === 'Rare') {
        bodyRadius = '48% 52% 45% 55%';
    }

    // Element personality shapes
    const elemShape = {
        'Water': '50% 50% 45% 55%',
        'Fire': '40% 60% 55% 45%',
        'Plant': '55% 45% 40% 60%',
        'Lightning': '45% 55% 35% 65%',
    };
    if (elemShape[slime.element]) {
        bodyRadius = elemShape[slime.element];
    }

    body.style.borderRadius = bodyRadius;

    // Make the rarity frame follow the same shape so it doesn't look like a misaligned circle around an organic blob
    if (frame) frame.style.borderRadius = bodyRadius;

    const shine = document.createElement('div');
    shine.className = 'shine';
    body.appendChild(shine);

    // Add mouth for more personality (Raid collector vibe)
    const mouth = document.createElement('div');
    mouth.className = 'slime-mouth';
    let mouthStyle = 'position:absolute; top:55%; left:35%; width:30%; height:8%; background:#222; border-radius: 0 0 50% 50%; box-shadow: 0 1px 0 rgba(255,255,255,0.2);';
    if (slime.element === 'Fire') mouthStyle = 'position:absolute; top:52%; left:30%; width:40%; height:10%; background:#222; border-radius: 20% 20% 50% 50%;';
    else if (slime.element === 'Water') mouthStyle = 'position:absolute; top:55%; left:35%; width:30%; height:6%; background:#222; border-radius: 50%;';
    else if (slime.element === 'Plant') mouthStyle = 'position:absolute; top:56%; left:32%; width:36%; height:5%; background:#222; border-radius: 30% 30% 60% 60%;';
    else if (slime.element === 'Lightning') mouthStyle = 'position:absolute; top:53%; left:28%; width:44%; height:7%; background:#222; border-radius: 10% 10% 40% 40%;';
    mouth.style.cssText = mouthStyle;
    body.appendChild(mouth);

    // Element badge (type icon) - can be hidden for dense list views
    if (opts.showElementBadge !== false) {
        const badge = document.createElement('div');
        badge.className = 'slime-element-badge';
        badge.innerText = vis.icon;
        badge.style.background = vis.bg || 'rgba(255,255,255,0.95)';
        badge.style.color = (rarity === 'Legendary' || rarity === 'Epic') ? '#fff' : '#111';
        body.appendChild(badge);
    }

    // Level badge - positioned on wrapper for clean overlay
    const lvl = document.createElement('div');
    lvl.className = 'slime-level-badge';
    lvl.innerText = 'Lv' + (slime.level || 1);
    wrapper.appendChild(lvl);

    // Power number for quick strength feel (Raid style) - on wrapper, not inside the slime body
    const pwr = document.createElement('div');
    pwr.className = 'slime-power-badge';
    pwr.innerText = (slime.power || 0);
    wrapper.appendChild(pwr);

    // Evolution indicator (1★ to 5★)
    const evoLevel = slime.evolutionLevel || 0;
    if (evoLevel > 0) {
        const evo = document.createElement('div');
        evo.className = 'slime-evo-indicator';
        evo.innerText = '★'.repeat(Math.min(evoLevel, 5));
        evo.style.fontSize = (evoLevel >= 3 ? '14px' : '12px');
        if (evoLevel >= 4) evo.style.color = '#ffdd77';
        if (evoLevel === 5) {
            evo.style.textShadow = '0 0 6px #f59e0b';
        }
        wrapper.appendChild(evo);
    }

    // On mission overlay - stronger visual (dim + label)
    if (opts.onMission || slime.onMission) {
        body.style.opacity = '0.4';
        body.style.filter = 'grayscale(0.4) brightness(0.8)';
        const mission = document.createElement('div');
        mission.className = 'slime-mission-overlay';
        mission.style.cssText = 'position:absolute; inset:0; background:rgba(0,0,0,0.35); display:flex; align-items:center; justify-content:center; font-size:8px; font-weight:700; color:#ffaa66; border-radius:inherit; z-index:4; letter-spacing:0.5px;';
        mission.innerHTML = 'ON MISSION';
        body.appendChild(mission);
        // Also dim the frame for on-mission
        const f = wrapper.querySelector('.rarity-frame');
        if (f) f.style.opacity = '0.5';
    }

    wrapper.appendChild(body);

    // Trait stars for visual density
    if (opts.showTraits && slime.traits && slime.traits.length > 0) {
        const t = document.createElement('div');
        t.className = 'slime-trait-stars';
        t.innerText = '★'.repeat(Math.min(slime.traits.length, 3));
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

// Celebratory reveal modal when a new slime is tamed - Raid style hatch ceremony
function showNewSlimeReveal(slime) {
    if (!slime) return;
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';

    const vis = createSlimeVisual(slime, { size: 'xl', showTraits: true });

    // Simple callouts for acquisition feel (Phase 1 polish)
    let callout = '';
    if (slime.rarity === 'Legendary' || slime.rarity === 'Epic') {
        callout = `<div style="color:#ffdd77; font-size:11px; margin:4px 0;">★ Rare find! ★</div>`;
    } else if (slime.traits && slime.traits.length > 0) {
        callout = `<div style="font-size:10px; opacity:0.8;">With traits already!</div>`;
    } else if (slime.power > 200) {
        callout = `<div style="font-size:10px; opacity:0.8;">Strong from the start!</div>`;
    }

    modal.innerHTML = `
        <div class="modal-content result-modal" style="max-width:440px; text-align:center; border-color: ${getRarityColor(slime.rarity)};">
            <div style="color:#ffdd77; font-size:13px; margin-bottom:2px; letter-spacing:1px;">✨ NEW SLIME ACQUIRED ✨</div>
            ${callout}
            <div style="margin:8px 0 4px;">${vis.outerHTML}</div>
            <div style="font-size:16px; font-weight:700;">${slime.name}</div>
            <div style="font-size:13px; margin-bottom:4px;"><span style="color:${getRarityColor(slime.rarity)};">${slime.rarity}</span> <span style="opacity:0.7;">${slime.element}</span></div>
            <div style="font-size:12px; opacity:0.9;">Lv ${slime.level} • ${slime.power} PWR</div>
            ${slime.traits && slime.traits.length ? `<div style="margin-top:6px; font-size:11px; color:#aaffcc;">Traits: ${slime.traits.map(t => (window.TRAIT_DEFINITIONS && TRAIT_DEFINITIONS[t]) ? TRAIT_DEFINITIONS[t].name : t).join(', ')}</div>` : ''}
            <button onclick="this.closest('.modal').remove(); if(typeof updateUI==='function') updateUI();" style="margin-top:12px; width:auto; min-height:38px; padding:6px 20px;">Add to Collection</button>
        </div>
    `;
    document.body.appendChild(modal);

    // Auto close on visual click for nice feel
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

// Popup for material/resource gains from exploration (same style as slime catch)
function showResourceGain(location, resourcesGained, onComplete) {
    showGainModal("🗺️ EXPLORATION COMPLETE", `Explored ${location}!`, resourcesGained, onComplete);
}

function showGainModal(title, subtitle, gains, onComplete) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';

    const resourceIcons = {
        wood: '🪵',
        jelly: '🫐',
        herbs: '🌿',
        stone: '🪨',
        crystal: '💎',
        arcaneDust: '✨',
        gold: '🪙',
        slimeEssence: '💠',
        shadowEssence: '🌑',
        divineShards: '✨',
    };

    let content = `<div style="color:#ffdd77; font-size:14px; margin-bottom:4px;">${title}</div>
            <div style="font-size:15px; margin-bottom:8px;"><strong>${subtitle}</strong></div>`;

    if (gains && gains.length > 0) {
        let gainsHTML = gains.map(r => {
            const parts = r.split(' ');
            const amt = parts[0];
            let namePart = parts.slice(1).join(' ').toLowerCase().replace(/\s+/g, '');
            if (namePart.includes('wood')) namePart = 'wood';
            else if (namePart.includes('jelly')) namePart = 'jelly';
            else if (namePart.includes('herb')) namePart = 'herbs';
            else if (namePart.includes('stone')) namePart = 'stone';
            else if (namePart.includes('crystal')) namePart = 'crystal';
            else if (namePart.includes('arcane') || namePart.includes('dust')) namePart = 'arcaneDust';
            else if (namePart.includes('gold')) namePart = 'gold';
            else if (namePart.includes('slimeessence') || namePart.includes('essence')) namePart = 'slimeEssence';
            else if (namePart.includes('shadow')) namePart = 'shadowEssence';
            else if (namePart.includes('divine')) namePart = 'divineShards';
            const icon = resourceIcons[namePart] || '📦';
            return `<div style="background:#113322; border:2px solid #77ffaa; border-radius:8px; padding:6px 10px; display:flex; align-items:center; gap:8px; min-width:100px;">
                <span style="font-size:18px;">${icon}</span>
                <div><strong>${r}</strong></div>
            </div>`;
        }).join('');
        content += `<div style="margin:10px 0; font-size:13px;">You found:</div>
            <div style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center;">${gainsHTML}</div>`;
    } else {
        content += `<div style="margin:10px 0; font-size:13px; opacity:0.8;">No additional rewards this time.</div>`;
    }

    modal.innerHTML = `
        <div class="modal-content result-modal" style="max-width:420px; text-align:center;">
            ${content}
            <button style="margin-top:14px; width:auto; min-height:38px; padding:6px 20px;">Continue</button>
        </div>
    `;
    document.body.appendChild(modal);

    const btn = modal.querySelector('button');
    if (btn) {
        btn.onclick = () => {
            modal.remove();
            if (typeof updateUI === 'function') updateUI();
            if (typeof onComplete === 'function') onComplete();
        };
    }
}

window.showResourceGain = showResourceGain;
window.showGainModal = showGainModal;

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