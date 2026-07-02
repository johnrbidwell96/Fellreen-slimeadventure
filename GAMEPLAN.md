# Slime Adventure — Long-Term Gameplan

This document is a detailed, step-by-step roadmap for evolving **Slime Adventure** from its current state into a polished, engaging "whole game" experience (inspired by collector games like Raid Shadow Legends) while preserving all core mechanics.

The plan is designed so that **any future Grok session** (or human contributor) can pick it up, understand the current state, and do meaningful heavy lifting without needing the full conversation history.

---

## 1. Vision & Success Criteria

### Core Vision
- Keep the relaxing idle/collector soul (taming, breeding, AFK training, elemental strategy, exploration, endgame tower).
- Make it **feel like a real game**, not a text spreadsheet:
  - Strong visual identity for every slime (element + rarity).
  - Satisfying visual feedback and "ceremony" for key moments (new slime, battle results, progression).
  - Modern collector game polish: nice cards, animations, clear information hierarchy.
- Long-term target: Desktop application for Windows and macOS (one nice installable app).

### What "Whole Game" Means Here
- **Collection** feels premium (visual grid, detail views, rarity shine).
- **Exploration** has impact (animated results, new slime reveals).
- **Combat** has spectacle (visual team vs boss, elemental VFX, damage pop, win/loss drama).
- **Progression** is clear and motivating (bars, milestones, nice numbers).
- Everything stays cozy and not overwhelming.

### Non-Goals (for now)
- Not turning it into a high-production gacha with paid pulls.
- Not adding multiplayer or complex live service.
- Keep the single-player relaxing idle fantasy.

---

## 2. Current State (as of 2026-07-01)

- **Tech**: Browser-based (HTML + CSS + vanilla JS). Runs by opening `index.html` or via local server.
- **Architecture**: Moving away from single-file. We have started extracting:
  - `styles/main.css` (all styles including new visual effects)
  - `js/visuals.js` (ELEMENT_VISUALS, createSlimeVisual, showNewSlimeReveal, showBattleSequence)
- Core game systems are still mostly in `index.html` (game state, logic, many render functions).
- **Visual progress already made**:
  - Basic CSS slime blobs with element colors, eyes, level badges, rarity glows/shimmers.
  - Haven cards show mini visuals + clickable detail modal.
  - New slime taming has a reveal modal.
  - Boss fights have a basic animated battle presentation.
  - Inventory upgraded to icon grid.
- **Launch**: `open index.html` or `npm start`.
- **Save**: Still localStorage + Export/Import.

**Immediate problems to solve**:
- Still too monolithic in `index.html`.
- Many systems (exploration feedback, full battle, management) need more visual love.
- No real assets yet (pure CSS/emoji).
- No desktop wrapper yet.

---

## 3. Recommended Project Architecture

### Folder Structure (Target)

```
Slime Adventure/
├── index.html                 # Thin shell (loads CSS + main JS)
├── package.json
├── README.md
├── GAMEPLAN.md                # This file
├── styles/
│   └── main.css
├── js/
│   ├── main.js                # Boot / init / wiring
│   ├── state.js               # game object, save/load, recalculateSlimePower
│   ├── visuals.js             # createSlimeVisual + element themes (already started)
│   ├── ui.js                  # render functions, modals, battle UI, updates
│   ├── data/
│   │   ├── constants.js       # elements, ELEMENT_CHART, bossData, MAP_DATA, TRAINING_MISSIONS, etc.
│   │   └── traits.js
│   └── systems/
│       ├── exploration.js
│       ├── combat.js
│       ├── management.js      # breeding, fusion, evolve, training missions
│       ├── alchemy.js
│       └── progression.js     # player level, milestones, void tower
├── electron/ (future)         # Desktop wrapper
│   └── main.js
└── assets/ (future)
    ├── images/
    └── audio/
```

### Tech Choices (for now)
- **Vanilla JS + CSS** (keep barrier low).
- ES modules where practical (or careful script order during transition).
- No heavy frameworks unless it clearly helps (later consideration: lightweight state lib?).
- For desktop: **Electron** + electron-builder (or electron-forge). This is the path of least resistance from a web game.

---

## 4. Phased Roadmap (Step-by-Step)

### Phase 0: Solid Foundation (Do this first)

**Goal**: Make the project easy and safe to work on for future sessions.

**Tasks**:
1. Finish splitting the remaining logic out of `index.html`.
   - Extract all constants → `js/data/constants.js`
   - Extract core game state + persistence → `js/state.js`
   - Extract all render/update functions → `js/ui.js`
   - Move remaining systems (exploration, combat logic, etc.) into `js/systems/`
2. Make `index.html` a clean shell that loads:
   - `styles/main.css`
   - `js/visuals.js`
   - `js/data/constants.js`
   - `js/state.js`
   - `js/ui.js`
   - `js/main.js` (init everything)
3. Update all internal references (remove duplicates, make sure functions are exported properly via window or modules).
4. Add basic error handling / logging in development.
5. Improve `package.json` scripts (add build step later if needed).
6. Make sure "open index.html" and `npm start` both work cleanly.
7. Update README.md to point developers to this GAMEPLAN.md.

**Success Criteria**:
- You can delete large chunks of the old inline script.
- Changing a visual or a system only touches 1-2 files.
- New contributors can run the game in < 2 minutes.

---

### Phase 1: Visual Identity & Collection (Highest "game feel" impact)

**Goal**: Slimes look and feel special. Collection screen is a joy.

**Tasks**:
1. **Improve `createSlimeVisual`** (in `js/visuals.js`):
   - Add more personality (different body shapes per rarity? subtle animation via CSS keyframes).
   - Support "on mission" state visually.
   - Add evolution indicator.
2. **Major Collection Upgrade**:
   - Turn the top "Haven" into a nicer grid or carousel.
   - Full "Collection" tab/screen with search, filters (element, rarity, has trait, level), sorting.
   - Click any slime → rich detail view (big visual + stats + traits as nice badges + history?).
3. **New Slime Acquisition Polish**:
   - Better "hatch" / reveal animation when taming.
   - Show previous best rarity or "first of this element" callouts.
4. **Global Visual Language**:
   - Consistent element color usage everywhere (borders, text, backgrounds).
   - Rarity "frames" or card styles applied to all relevant places (inventory items too?).
5. **Add simple progress bars** (player XP, slime XP in detail view).

**Success Criteria**:
- Opening the game feels like opening a collector game, not a spreadsheet.
- Every rarity tier looks dramatically different.

---

### Phase 2: Core Loops — Make Actions Feel Good

**Goal**: Exploration and Combat stop being "text appears at bottom".

**Exploration**:
1. Create a dedicated `showExplorationResult()` modal/component (location flavor text + animated resource gains + new slime reveal if applicable).
2. Improve the Map tab:
   - Better node visuals (region-specific backgrounds/colors).
   - Subtle animations when nodes are cleared or auto-farmed.
   - Difficulty selector feels nicer.
3. Add floating resource popups or a "recent gains" area.

**Combat**:
1. Evolve the battle sequence (currently basic in `showBattleSequence`):
   - Show individual slime attacks or "team power clash" animation.
   - Elemental advantage VFX (color flashes, advantage text "Strong vs!", "Weak against!").
   - Floating damage numbers on both sides.
   - Health/power bars that animate.
   - Clear "Victory" or "Defeated" screen with rewards that pop in.
2. Add a similar (lighter) system for regular Dungeons.
3. Improve boss preparation screen (show team power preview with visuals).

**Management**:
- Nice animations for Breeding, Evolving, Fusing.
- Visual feedback when sending slimes on training (or when they return).

**Success Criteria**:
- Taming a slime, winning a boss, and completing a training mission all feel rewarding to watch.

---

### Phase 3: Content, Depth & Progression

**Tasks** (can be done in parallel with Phase 2):
1. More regions / map nodes with distinct flavor.
2. New traits, more alchemy recipes, new consumables.
3. Better Records / Achievements tab (visual collection of unlocked things).
4. Player milestones with nicer rewards.
5. Offline progress simulation (when you come back after hours).
6. Balance pass on economy and power curves (use the visual systems to make numbers feel better).
7. Optional: Slime "personalities" or small flavor text that appears in detail view.

---

### Phase 4: Desktop Application (Windows + macOS)

**Goal**: Turn the web game into a proper installed app.

**Recommended Path**: Electron (fastest to working desktop app).

**Steps**:
1. Create an `electron/` folder.
2. Add `electron/main.js` (basic BrowserWindow that loads the local `index.html` or a built version).
3. Add `preload.js` if needed for secure APIs later.
4. Update `package.json` with Electron dependencies + build scripts:
   - `npm run electron:start`
   - `npm run build:desktop` (produces installers)
5. Use `electron-builder` or `electron-forge` for packaging.
6. Handle save data properly (use `app.getPath('userData')` instead of just localStorage for better persistence).
7. Add app icons, window title, menu, etc.
8. Test on macOS (and Windows via CI or VM later).
9. Optional later: Auto-updater.

Alternative (lighter): Tauri (Rust + webview). Consider if bundle size becomes an issue.

**Success Criteria**:
- User can download and run a native app that feels like the web version + has native window behaviors.

---

### Phase 5: Advanced Polish & Features

- Sound design (Web Audio or simple files).
- Better art (actual SVG or PNG slimes per element/rarity — start with a few hero slimes).
- Accessibility (color contrast, keyboard navigation, reduced motion).
- Performance (large collections).
- Save cloud sync? (stretch)
- Steam / itch.io release preparation.
- Mobile-friendly version or PWA.

---

## 5. How Future Grok Sessions Should Work

1. Read this `GAMEPLAN.md` first.
2. Run the project (`npm start` or open `index.html`).
3. Check current state against the phases.
4. Pick the **highest priority unfinished task** in the earliest incomplete phase.
5. Implement cleanly in the right file.
6. Test the flow end-to-end (explore → tame → battle → etc.).
7. Update this GAMEPLAN.md with what was completed and any new notes.
8. When in doubt, ask the user for prioritization between phases/tasks.

**Coding Guidelines**:
- Keep core logic (numbers, state transitions) separate from presentation.
- New visuals should be built in `js/visuals.js` or small CSS additions.
- Prefer enhancing existing systems over rewriting them.
- Maintain save compatibility (add migration code if structure changes).
- Document any new important functions.

---

## 6. Quick Wins vs Big Projects

**High impact, relatively quick** (good for short sessions):
- More polish on `createSlimeVisual` and the detail modal.
- Better exploration result screen.
- Improve the battle animation sequence (more stages/VFX).
- Make the Map tab prettier.
- Add progress bars.

**Bigger efforts**:
- Full refactor into clean modules (Phase 0).
- Complete combat overhaul.
- Desktop Electron wrapper.

---

## 7. Risks & Principles

- **Don't break the fun** — always keep the existing systems working while adding visuals.
- **Cozy first** — flashy effects should feel good, not overwhelming or try-hard.
- **Incremental** — ship visible improvements often instead of one giant rewrite.
- **Desktop ready** — every decision should consider "will this work when wrapped in Electron?"

---

## 8. Starting Point Recommendation (for next session)

Current recommended starting task:

**Complete Phase 0** (multi-file cleanup) if not fully done, then jump into **Phase 1** focusing on:
- Enhancing the Collection experience
- Making the new slime reveal even more satisfying

Then move to Phase 2 combat/exploration feedback.

---

**This document is the single source of truth for long-term direction.** Update it as the project evolves.

Let's make some cool slimes. 🐾

---

*Last updated: 2026-07-01*