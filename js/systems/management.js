/* ============================================
   SYSTEMS / MANAGEMENT.JS
   Breeding, fusing, evolving, training, party, locking, research.
   Phase 0 extraction.
============================================ */

// Large management logic moved here. Uses window. for game etc.

function slimeParty() {
    const g = window.game || {};
    if (!g.slimes || g.slimes.length === 0) { (window.log || console.log)("No slimes to party with!"); return; }

    const now = Date.now();
    const cooldownMs = 60 * 60 * 1000; // 60 minutes
    const timeSinceLast = now - (g.lastSlimePartyTime || 0);

    if (timeSinceLast < cooldownMs) {
        const remainingMs = cooldownMs - timeSinceLast;
        const remainingMin = Math.ceil(remainingMs / 60000);
        (window.log || console.log)(`Slime Party is on cooldown. Ready again in ~${remainingMin} minute(s).`);
        return;
    }

    // Apply effects
    (g.slimes || []).forEach(s => {
        s.exp = (s.exp || 0) + 14;
        (window.recalculateSlimePower || (() => {}))(s);
    });
    (window.gainPlayerExp || (() => {}))(6);

    // Bonus jelly
    let jellyBonus = 3 + Math.floor(Math.random() * 4);
    (g.slimes || []).forEach(slime => {
        const bonusFn = window.getJellyProductionBonus || (() => 0);
        jellyBonus += bonusFn(slime);
    });
    if (!g.resources) g.resources = {};
    g.resources.jelly = (g.resources.jelly || 0) + jellyBonus;

    g.partyPowerBonusUntil = now + (90 * 60 * 1000);
    g.lastSlimePartyTime = now;

    (window.log || console.log)(`🎉 Slime Party! All slimes gained EXP + made ${jellyBonus} Jelly. Your slimes are energized! (+10% power for 90 min)`);
    (window.updateUI || (() => {}))();
    const partyBtn = window.updateSlimePartyButton || (() => {});
    partyBtn();
}

function evolveSlime() {
    const g = window.game || {};
    const candidates = (g.slimes || []).filter(s => s.level >= 10 && !s.evolved);
    if (candidates.length === 0) { (window.log || console.log)("Need a level 10+ slime that hasn't evolved yet."); return; }
    const slime = candidates[0];
    slime.evolved = true;
    slime.level += 4;
    (window.recalculateSlimePower || (() => {}))(slime);
    g.totalEvolutions = (g.totalEvolutions || 0) + 1;
    (window.log || console.log)(`${slime.name} evolved! Power greatly increased (now scales with level + rarity).`);
    (window.updateUI || (() => {}))();
}

function fuseSlimes() {
    const g = window.game || {};
    const unlocked = (g.slimes || []).filter(s => !s.locked);
    if (unlocked.length < 2) {
        (window.log || console.log)("Need at least 2 unlocked slimes to fuse.");
        return;
    }

    let s1 = null;
    let s2 = null;

    for (let i = 0; i < unlocked.length; i++) {
        for (let j = i + 1; j < unlocked.length; j++) {
            if (unlocked[i].rarity === unlocked[j].rarity) {
                s1 = unlocked[i];
                s2 = unlocked[j];
                break;
            }
        }
        if (s1) break;
    }

    if (!s1 || !s2) {
        (window.log || console.log)("You can only fuse slimes of the **same rarity**. Get two of the same rarity unlocked.");
        return;
    }

    let baseSlime, sacrificeSlime;
    if (s1.power >= s2.power) {
        baseSlime = s1;
        sacrificeSlime = s2;
    } else {
        baseSlime = s2;
        sacrificeSlime = s1;
    }

    const idxBase = (g.slimes || []).findIndex(s => s.id === baseSlime.id);
    const idxSacrifice = (g.slimes || []).findIndex(s => s.id === sacrificeSlime.id);

    const fused = { 
        ...baseSlime, 
        level: Math.max(baseSlime.level, sacrificeSlime.level) + 3, 
        exp: 0,
        locked: false,
        evolved: baseSlime.evolved || sacrificeSlime.evolved
    };
    (window.recalculateSlimePower || (() => {}))(fused);

    const toRemove = [idxBase, idxSacrifice].sort((a,b) => b-a);
    toRemove.forEach(i => (g.slimes || []).splice(i, 1));

    g.slimes = g.slimes || [];
    g.slimes.push(fused);
    g.totalFusions = (g.totalFusions || 0) + 1;
    (window.log || console.log)(`Fused ${sacrificeSlime.rarity} slime into ${baseSlime.name}!`);

    (window.sanitizeParty || (() => {}))();
    (window.updateUI || (() => {}))();
}

function openLockModal() {
    const modal = document.getElementById('lockModal');
    const list = document.getElementById('lockSlimeList');
    const g = window.game || {};
    if (list) list.innerHTML = '';

    if (!g.slimes || g.slimes.length === 0) {
        if (list) list.innerHTML = '<p style="color:#ffaa66;">You have no slimes yet.</p>';
        if (modal) modal.style.display = 'flex';
        return;
    }

    (g.slimes || []).forEach((slime, index) => {
        const div = document.createElement('div');
        div.style.cssText = 'background:#113322; border:2px solid #77ffaa; border-radius:8px; padding:10px; margin:6px 0; display:flex; justify-content:space-between; align-items:center;';

        div.innerHTML = `
            <div>
                <strong>${slime.name}</strong> (Lv ${slime.level} ${slime.element} ${slime.rarity})<br>
                <small>${slime.power} PWR • ${slime.exp || 0} EXP</small>
            </div>
            <div>
                <button onclick="toggleLock(${index}); (window.openLockModal || (() => {}))();" style="min-height:40px; width:auto; padding:8px 16px;">
                    ${slime.locked ? '🔓 Unlock' : '🔒 Lock'}
                </button>
            </div>
        `;
        if (list) list.appendChild(div);
    });

    if (modal) modal.style.display = 'flex';
}

function closeLockModal() {
    const modal = document.getElementById('lockModal');
    if (modal) modal.style.display = 'none';
    (window.updateUI || (() => {}))();
}

function openSlimeManagementModal() {
    const modal = document.getElementById('slimeManagementModal');
    const elementFilter = document.getElementById('slimeFilterElement');
    const g = window.game || {};

    window.managementSelectedSlimes = window.managementSelectedSlimes || [];

    if (elementFilter) {
        elementFilter.innerHTML = '<option value="">All Elements</option>';
        const elementsList = [...new Set((g.slimes || []).map(s => s.element))];
        elementsList.sort().forEach(el => {
            const opt = document.createElement('option');
            opt.value = el;
            opt.textContent = el;
            elementFilter.appendChild(opt);
        });
    }

    if (modal) modal.style.display = 'flex';
    const filterFn = window.filterSlimeList || (() => {});
    filterFn();

    // Gentle hint about the new party system
    if (typeof window.log === 'function' && (!window.game || !(window.game.party || []).length)) {
        setTimeout(() => (window.log || console.log)('Tip: Use the ☆/★ buttons to build your Party. Only your party affects exploration and dungeons!'), 800);
    }
}

function closeSlimeManagementModal() {
    window.managementSelectedSlimes = [];
    const modal = document.getElementById('slimeManagementModal');
    if (modal) modal.style.display = 'none';
    (window.updateUI || (() => {}))();
}

function filterSlimeList() {
    const searchEl = document.getElementById('slimeSearch');
    const sortEl = document.getElementById('slimeSort');
    const rarityEl = document.getElementById('slimeFilterRarity');
    const elementEl = document.getElementById('slimeFilterElement');
    const hasTraitEl = document.getElementById('filterHasTrait');
    const listEl = document.getElementById('slimeManagementList');
    const countEl = document.getElementById('bulkSelectCount');
    const g = window.game || {};

    if (!listEl) return;
    listEl.innerHTML = '';

    window.managementSelectedSlimes = window.managementSelectedSlimes || [];

    let slimes = [...(g.slimes || [])];
    if (slimes.length === 0) {
        listEl.innerHTML = '<p style="padding:10px; color:#ffaa66;">You have no slimes yet. Go explore!</p>';
        if (countEl) countEl.textContent = '';
        return;
    }

    // Apply filters
    const search = ((searchEl && searchEl.value) || '').toLowerCase().trim();
    const rarityFilter = (rarityEl && rarityEl.value) || '';
    const elementFilter = (elementEl && elementEl.value) || '';
    const hasTraitOnly = (hasTraitEl && hasTraitEl.checked) || false;

    let filtered = slimes.filter(slime => {
        const matchesSearch = !search ||
            (slime.name && slime.name.toLowerCase().includes(search)) ||
            (slime.element && slime.element.toLowerCase().includes(search));
        const matchesRarity = !rarityFilter || slime.rarity === rarityFilter;
        const matchesElement = !elementFilter || slime.element === elementFilter;
        const matchesTrait = !hasTraitOnly || (slime.traits && slime.traits.length > 0);
        return matchesSearch && matchesRarity && matchesElement && matchesTrait;
    });

    // Apply sort
    const sortMode = (sortEl && sortEl.value) || 'power-desc';
    const rarityOrder = { Legendary: 5, Epic: 4, Rare: 3, Uncommon: 2, Common: 1 };

    filtered.sort((a, b) => {
        switch (sortMode) {
            case 'power-desc': return (b.power || 0) - (a.power || 0);
            case 'power-asc':  return (a.power || 0) - (b.power || 0);
            case 'level-desc': return (b.level || 0) - (a.level || 0);
            case 'rarity-desc':
                return (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
            case 'name-asc':
                return (a.name || '').localeCompare(b.name || '');
            default: return 0;
        }
    });

    if (filtered.length === 0) {
        listEl.innerHTML = '<p style="padding:10px; color:#ffaa66;">No slimes match the current filters.</p>';
        if (countEl) countEl.textContent = '';
        return;
    }

    function updateCount() {
        if (countEl) {
            const n = (window.managementSelectedSlimes || []).length;
            countEl.textContent = n > 0 ? `${n} selected` : '';
        }
    }

    // Render each slime as a row
    filtered.forEach(slime => {
        const originalIndex = (g.slimes || []).findIndex(s => s.id === slime.id);

        const row = document.createElement('div');
        const isSel = window.managementSelectedSlimes.includes(slime.id);
        row.style.cssText = 'display:flex; align-items:center; gap:8px; background:#0f2a20; border:1px solid ' + (isSel ? '#aaff99' : '#556655') + '; border-radius:6px; padding:6px 8px; margin:3px 0; font-size:12px;' + (isSel ? ' box-shadow: 0 0 0 1px #aaff99;' : '');

        // Small visual
        let visual = document.createElement('span');
        if (typeof createSlimeVisual === 'function') {
            visual = createSlimeVisual(slime, { size: 'sm', interactive: false, showTraits: false });
            visual.style.width = '36px';
            visual.style.height = '36px';
            visual.style.flexShrink = '0';
        }

        // Info
        const info = document.createElement('div');
        info.style.flex = '1';
        info.style.minWidth = '0';
        const traits = (slime.traits && slime.traits.length) ? ` • ${slime.traits.length} trait${slime.traits.length > 1 ? 's' : ''}` : '';
        const partyBadge = (typeof isInParty === 'function' && isInParty(slime.id)) ? ' <span style="color:#ffdd77; font-size:10px;">★ PARTY</span>' : '';
        info.innerHTML = `
            <strong style="display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${slime.name}${partyBadge}</strong>
            <small style="opacity:0.85;">${slime.element} • ${slime.rarity} • Lv${slime.level || 1} • ${slime.power || 0} PWR${traits}</small>
        `;

        // Controls
        const ctrls = document.createElement('div');
        ctrls.style.cssText = 'display:flex; align-items:center; gap:3px; flex-shrink:0;';

        // Selection checkbox for bulk
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = window.managementSelectedSlimes.includes(slime.id);
        cb.style.marginRight = '2px';
        cb.onchange = () => {
            if (!window.managementSelectedSlimes) window.managementSelectedSlimes = [];
            if (cb.checked) {
                if (!window.managementSelectedSlimes.includes(slime.id)) window.managementSelectedSlimes.push(slime.id);
            } else {
                window.managementSelectedSlimes = window.managementSelectedSlimes.filter(id => id !== slime.id);
            }
            // live update highlight
            row.style.border = '1px solid ' + (cb.checked ? '#aaff99' : '#556655');
            if (cb.checked) {
                row.style.boxShadow = '0 0 0 1px #aaff99';
            } else {
                row.style.boxShadow = '';
            }
            updateCount();
        };

        // === Party toggle (new party system) ===
        const inParty = (typeof isInParty === 'function') ? isInParty(slime.id) : false;
        const partyBtn = document.createElement('button');
        partyBtn.textContent = inParty ? '★' : '☆';
        partyBtn.title = inParty ? 'Remove from Party' : 'Add to Party (affects exploration & dungeons)';
        partyBtn.style.cssText = `font-size:12px; padding:1px 4px; min-height:22px; line-height:1; ${inParty ? 'color:#ffdd77;' : ''}`;
        partyBtn.onclick = (e) => {
            e.stopPropagation();
            if (typeof togglePartyMember === 'function') {
                const success = togglePartyMember(slime.id);
                if (success) {
                    (window.log || console.log)(`${slime.name} ${inParty ? 'removed from' : 'added to'} party.`);
                    (window.filterSlimeList || (() => {}))();
                    (window.updateUI || (() => {}))();
                }
            }
        };

        // Lock toggle
        const lockBtn = document.createElement('button');
        lockBtn.textContent = slime.locked ? '🔓' : '🔒';
        lockBtn.title = slime.locked ? 'Unlock' : 'Lock';
        lockBtn.style.cssText = 'font-size:11px; padding:1px 5px; min-height:22px; line-height:1;';
        lockBtn.onclick = (e) => {
            e.stopPropagation();
            const target = (originalIndex >= 0) ? (g.slimes || [])[originalIndex] : slime;
            if (target) {
                target.locked = !target.locked;
                (window.log || console.log)(`${slime.name} is now ${target.locked ? 'locked' : 'unlocked'}.`);
            }
            (window.filterSlimeList || (() => {}))();
            (window.updateUI || (() => {}))();
        };

        // Quick detail
        const viewBtn = document.createElement('button');
        viewBtn.textContent = '👁';
        viewBtn.title = 'View details';
        viewBtn.style.cssText = 'font-size:11px; padding:1px 5px; min-height:22px;';
        viewBtn.onclick = (e) => {
            e.stopPropagation();
            if (typeof showSlimeDetail === 'function') showSlimeDetail(slime);
            else if (typeof openSlimeDetail === 'function') openSlimeDetail(slime);
        };

        // Release / dismiss (cull unwanted low-rarity slimes)
        const releaseBtn = document.createElement('button');
        releaseBtn.textContent = '❌';
        releaseBtn.title = 'Release (dismiss) this slime - get a little gold back';
        releaseBtn.style.cssText = 'font-size:10px; padding:1px 4px; min-height:22px; background:#4a2222; border-color:#aa6666; color:#ffaaaa;';
        releaseBtn.onclick = (e) => {
            e.stopPropagation();
            if (confirm(`Release ${slime.name} (${slime.rarity})? You will get a small gold reward.`)) {
                const rel = window.releaseSlime || (() => {});
                rel(slime.id);
            }
        };

        ctrls.appendChild(cb);
        ctrls.appendChild(partyBtn);
        ctrls.appendChild(lockBtn);
        ctrls.appendChild(viewBtn);
        ctrls.appendChild(releaseBtn);

        row.appendChild(visual);
        row.appendChild(info);
        row.appendChild(ctrls);

        // Click row to toggle selection (but not if clicking controls)
        row.onclick = (e) => {
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;
            cb.checked = !cb.checked;
            cb.onchange();
        };

        listEl.appendChild(row);
    });

    updateCount();
}

function toggleLockFromManagement(originalIndex) {
    const g = window.game || {};
    if (g.slimes && g.slimes[originalIndex]) {
        g.slimes[originalIndex].locked = !g.slimes[originalIndex].locked;
    }
}

function bulkLockSelected() {
    const g = window.game || {};
    let count = 0;
    (g.slimes || []).forEach(slime => {
        if (window.managementSelectedSlimes && window.managementSelectedSlimes.includes(slime.id)) {
            slime.locked = true;
            count++;
        }
    });
    if (count > 0) {
        (window.log || console.log)(`Locked ${count} slime(s).`);
        window.managementSelectedSlimes = [];
        (window.filterSlimeList || (() => {}))();
    }
}

function bulkUnlockSelected() {
    const g = window.game || {};
    let count = 0;
    (g.slimes || []).forEach(slime => {
        if (window.managementSelectedSlimes && window.managementSelectedSlimes.includes(slime.id)) {
            slime.locked = false;
            count++;
        }
    });
    if (count > 0) {
        (window.log || console.log)(`Unlocked ${count} slime(s).`);
        window.managementSelectedSlimes = [];
        (window.filterSlimeList || (() => {}))();
    }
}

/** Release (dismiss) a slime you don't want to keep. Gives a tiny gold reward. */
function releaseSlime(slimeId) {
    const g = window.game || {};
    const idx = (g.slimes || []).findIndex(s => s.id === slimeId);
    if (idx < 0) return;

    const slime = g.slimes[idx];

    if (typeof isInParty === 'function' && isInParty(slimeId)) {
        if (typeof removeFromParty === 'function') removeFromParty(slimeId);
    }

    // Small compensation based on power (encourages culling weak ones)
    const reward = Math.max(1, Math.floor((slime.power || 20) / 12));
    if (!g.resources) g.resources = {};
    g.resources.gold = (g.resources.gold || 0) + reward;

    g.slimes.splice(idx, 1);
    (window.log || console.log)(`Released ${slime.name} (${slime.rarity}). Received ${reward} Gold.`);

    (window.sanitizeParty || (() => {}))();
    (window.updateUI || (() => {}))();
    const filterFn = window.filterSlimeList || (() => {});
    filterFn();
}

function toggleLock(index) {
    const g = window.game || {};
    if (g.slimes && g.slimes[index]) {
        g.slimes[index].locked = !g.slimes[index].locked;
        const status = g.slimes[index].locked ? 'locked' : 'unlocked';
        (window.log || console.log)(`${g.slimes[index].name} is now ${status}.`);
    }
}

function startBreeding(useFertility = false) {
    const g = window.game || {};
    if (!g.slimes || g.slimes.length < 2) { (window.log || console.log)("Need at least 2 slimes to breed."); return; }
    
    if (useFertility) {
        if (!g.resources) g.resources = {};
        if ((g.resources.fertilityPotion || 0) < 1) {
            (window.log || console.log)("No Fertility Potion! Craft some or use normal breeding.");
            return;
        }
        g.resources.fertilityPotion--;
    }
    
    const gen = window.generateRandomSlime || (() => null);
    const baby = gen("Medium", useFertility);
    if (baby) {
        baby.level = 1;
        g.slimes = g.slimes || [];
        g.slimes.push(baby);
        g.lifetimeSlimesTamed = (g.lifetimeSlimesTamed || 0) + 1;
        
        let msg = `Breeding complete! You got a new ${baby.rarity} ${baby.element} slime!`;
        if (useFertility) msg += " (Fertility Potion used - better rarity!)";
        (window.log || console.log)(msg);
        (window.updateUI || (() => {}))();
    }
}

function openTrainingModal() {
    const modal = document.getElementById('trainingModal');
    const missionList = document.getElementById('missionList');
    const slimeSection = document.getElementById('slimeSelectionForTraining');
    const g = window.game || {};

    if (missionList) missionList.innerHTML = '';
    if (slimeSection) slimeSection.style.display = 'none';
    window.selectedMissionId = null;

    const missions = window.TRAINING_MISSIONS || [];
    missions.forEach(mission => {
        const div = document.createElement('div');
        div.className = 'mission-card';
        div.innerHTML = `
            <strong>${mission.name}</strong> <small style="color:#ffdd88;">(${mission.durationMinutes} min)</small><br>
            <span style="font-size:12px;">${mission.desc}</span><br>
            <span style="color:#aaff99; font-size:12px;">+${mission.expPerSlime} EXP per slime</span>
        `;
        div.onclick = () => {
            const selectFn = window.selectMissionForTraining || (() => {});
            selectFn(mission.id, div);
        };
        if (missionList) missionList.appendChild(div);
    });

    if (modal) modal.style.display = 'flex';
}

function selectMissionForTraining(missionId, element) {
    const missions = document.querySelectorAll('#missionList .mission-card');
    missions.forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    window.selectedMissionId = missionId;

    const slimeSection = document.getElementById('slimeSelectionForTraining');
    const list = document.getElementById('trainingSlimeList');
    const g = window.game || {};
    if (list) list.innerHTML = '';

    const available = (g.slimes || []).filter(s => !s.onMission);
    if (available.length === 0) {
        if (list) list.innerHTML = '<p style="color:#ffaa66;">All your slimes are currently on missions.</p>';
        if (slimeSection) slimeSection.style.display = 'block';
        return;
    }

    available.forEach(slime => {
        const div = document.createElement('div');
        div.className = 'slime-select-item';
        div.innerHTML = `
            <input type="checkbox" id="train-${slime.id}">
            <label for="train-${slime.id}" style="flex:1; cursor:pointer;">
                <strong>${slime.name}</strong> (Lv ${slime.level} ${slime.element} ${slime.rarity})<br>
                <small>${slime.power} PWR</small>
            </label>
        `;
        if (list) list.appendChild(div);
    });

    if (slimeSection) slimeSection.style.display = 'block';
}

function confirmSendOnMission() {
    if (!window.selectedMissionId) { (window.log || console.log)("Please select a mission first"); return; }

    const missions = window.TRAINING_MISSIONS || [];
    const mission = missions.find(m => m.id === window.selectedMissionId);
    const checkboxes = document.querySelectorAll('#trainingSlimeList input[type="checkbox"]:checked');
    const selectedIds = Array.from(checkboxes).map(cb => parseInt(cb.id.split('-')[1]));
    const g = window.game || {};

    if (selectedIds.length === 0) { (window.log || console.log)("Select at least one slime"); return; }

    const maxSlots = 2 + Math.floor(((g.player && g.player.stats && g.player.stats.leadership) || 0) / 4);
    if (selectedIds.length > maxSlots) { (window.log || console.log)(`You can only send ${maxSlots} slimes (Leadership bonus included)`); return; }

    const useScrollEl = document.getElementById('useTrainingScrollCheck');
    const useScroll = useScrollEl && useScrollEl.checked;
    let expMultiplier = 1.0;
    
    if (useScroll) {
        if (!g.resources) g.resources = {};
        if ((g.resources.trainingScrolls || 0) < 1) {
            (window.log || console.log)("No Training Scrolls left! Sending without bonus.");
        } else {
            g.resources.trainingScrolls--;
            expMultiplier = 1.5;
            (window.log || console.log)("Training Scroll used! +50% EXP for this mission.");
        }
    }

    const now = Date.now();
    const endTime = now + ((mission.durationMinutes || 10) * 60 * 1000);
    const finalExp = Math.floor((mission.expPerSlime || 0) * expMultiplier);

    let sent = 0;
    (g.slimes || []).forEach(slime => {
        if (selectedIds.includes(slime.id) && !slime.onMission) {
            slime.onMission = true;
            slime.missionEndTime = endTime;
            slime.currentMissionId = mission.id;
            slime.currentMissionExp = finalExp;
            sent++;
        }
    });

    (window.log || console.log)(`Sent ${sent} slime(s) on ${mission.name} for ${mission.durationMinutes} minutes.`);
    const closeFn = window.closeTrainingModal || (() => {});
    closeFn();
    (window.updateUI || (() => {}))();
}

function closeTrainingModal() {
    const modal = document.getElementById('trainingModal');
    if (modal) modal.style.display = 'none';
    window.selectedMissionId = null;
}

function startMissionTimerSystem() {
    if (window.missionTimerInterval) clearInterval(window.missionTimerInterval);
    window.missionTimerInterval = setInterval(() => {
        const updateFn = window.updateMissionTimersAndCompletions || (() => {});
        updateFn();
    }, 1000);
}

function updateMissionTimersAndCompletions() {
    const g = window.game || {};
    let changed = false;
    const now = Date.now();

    (g.slimes || []).forEach(slime => {
        if (slime.onMission && slime.missionEndTime && now >= slime.missionEndTime) {
            let expGain = slime.currentMissionExp || 100;

            const trainingMultFn = window.getTrainingExpMultiplier || (() => 1);
            expGain = Math.floor(expGain * trainingMultFn(slime));

            const jellyBonusFn = window.getJellyProductionBonus || (() => 0);
            const jellyBonus = jellyBonusFn(slime);
            if (jellyBonus > 0) {
                if (!g.resources) g.resources = {};
                g.resources.jelly = (g.resources.jelly || 0) + jellyBonus;
            }

            slime.exp = (slime.exp || 0) + expGain;
            slime.level = Math.floor(1 + (slime.exp || 0) / 95);
            (window.recalculateSlimePower || (() => {}))(slime);
            slime.onMission = false;
            slime.missionEndTime = null;
            slime.currentMissionId = null;
            slime.currentMissionExp = null;

            let msg = `${slime.name} returned from training! +${expGain} EXP`;
            if (jellyBonus > 0) msg += ` (+${jellyBonus} Jelly)`;
            (window.log || console.log)(msg);
            changed = true;
        }
    });

    if (changed) {
        (window.updateUI || (() => {}))();
    } else {
        const haven = window.renderHaven || (() => {});
        haven();
    }
    const party = window.updateSlimePartyButton || (() => {});
    party();
}

// Expose key management functions
window.slimeParty = slimeParty;
window.evolveSlime = evolveSlime;
window.fuseSlimes = fuseSlimes;
window.openLockModal = openLockModal;
window.closeLockModal = closeLockModal;
window.openSlimeManagementModal = openSlimeManagementModal;
window.closeSlimeManagementModal = closeSlimeManagementModal;
window.filterSlimeList = filterSlimeList;
window.toggleLockFromManagement = toggleLockFromManagement;
window.bulkLockSelected = bulkLockSelected;
window.bulkUnlockSelected = bulkUnlockSelected;
window.toggleLock = toggleLock;
window.releaseSlime = releaseSlime;
window.bulkReleaseSelected = bulkReleaseSelected;
window.startBreeding = startBreeding;
window.openTrainingModal = openTrainingModal;
window.selectMissionForTraining = selectMissionForTraining;
window.confirmSendOnMission = confirmSendOnMission;
window.closeTrainingModal = closeTrainingModal;
window.startMissionTimerSystem = startMissionTimerSystem;
window.updateMissionTimersAndCompletions = updateMissionTimersAndCompletions;

console.log('✅ systems/management.js loaded (Phase 0)');