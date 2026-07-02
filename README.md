# Slime Adventure

A cozy single-file idle browser game inspired by *By the Grace of the Gods*. Build and manage a collection of elemental slimes across a relaxing yet deep progression loop.

## ✨ Features

- **Exploration** — Progressive node-based World Map (Greenwild Forest → Crystal Mountains → Shadowfen → Volcanic Wastes → Celestial Peaks). Clear nodes to unlock the next; auto-farm cleared content.
- **Elemental Combat** — 16 elements with rock-paper-scissors advantages. Dungeons + 6 Boss Raids that reward smart team building.
- **Slime Collection** — Common → Legendary rarities, traits system, evolution, fusion, and breeding.
- **AFK Progression** — Send slimes on timed Training Missions. Use Training Scrolls for bonus EXP. Slimes return with resources (Jelly) automatically.
- **Alchemy & Workshop** — Craft Battle Elixirs, Healing Salves, Fertility Potions, Explorer’s Tonics, and permanent power boosts. Upgrade your Refinery, Incubator, and Training Hall.
- **Research** — Low-cost normal research and high-reward Breakthrough Research using Catalysts.
- **Endgame** — Endless Void Tower (starts at Player Lv 90), Divine Convergence for permanent global power, and milestone rewards.
- **Records & Traits** — Detailed lifetime stats and a growing trait collection system.
- **Quality of Life** — Dark mode, full slime management filters/sort, bulk lock/unlock, collapsible sections, auto-save every 30s, localStorage persistence.

## 🎮 How to Play

1. Open `index.html` in any modern browser (double-click or serve locally).
2. **Explore** the Map tab first to tame your initial slimes and gather basic resources.
3. Use slimes in **Dungeons** and prepare teams for **Boss Raids** (match elements for big advantages).
4. **Manage** your collection: send on Training Missions, Breed, Evolve, Fuse.
5. Craft powerful tools in the **Alchemy** lab.
6. Invest **Stat Points** on the Player tab (Taming, Alchemy, Combat, etc.).
7. Push into late game with the **Eternity** tab (Void Tower + Divine Convergence).

### Controls & Tips
- Click nodes on the Map to explore (or farm cleared ones).
- Toggle **Auto Farm** on cleared nodes for passive gains.
- Higher difficulties on the Map give better rewards but require better matchups.
- Use consumables (Battle Elixir before bosses, Healing Salve for EXP, etc.).
- Lock valuable slimes so they aren’t accidentally fused.
- Leadership stat increases how many slimes you can send on training at once.
- Save manually or rely on the 30-second auto-save.

## 🗂️ Project Structure

The game is now organized as a multi-file project (no longer a single monolithic file). This makes it much easier to maintain as we add visuals, systems, and eventually turn it into a desktop app.

```
Slime Adventure/
├── index.html          # Main entry point (opens the game)
├── package.json        # Project config + launch scripts
├── README.md
├── styles/
│   └── main.css        # All styles (including new visual slime effects)
└── js/
    ├── main.js         # Bootstraps the game
    ├── data/           # Constants, element visuals, map data, etc.
    ├── visuals.js      # createSlimeVisual() and element/rarity rendering
    ├── ui.js           # Rendering, modals, battle presentation
    └── systems/        # exploration, combat, management, alchemy logic
```

**How to launch (pick one):**

1. **Easiest (no install)**: Just double-click `index.html` in your file manager.
2. **Recommended for development**:
   ```bash
   npm install
   npm start
   ```
   Then open http://localhost:8080

---

**Important**: See `GAMEPLAN.md` for the detailed long-term step-by-step roadmap. This is the document future Grok sessions (or contributors) should follow to do heavy lifting on visuals, architecture, content, and the eventual desktop app.

## 💾 Save Data

- Stored in `localStorage` under the key `slimeAdventureSave`.
- Dark mode preference also saved separately.
- **Export / Import**: Use the 📤 Export and 📥 Import buttons (top bar) to backup or transfer progress between browsers/devices. The data is a compact base64 string.
- **Reset**: There's a "Full Reset" button at the bottom of the Records tab (for testing).
- To reset manually: clear site data for the file or use browser devtools.

## 🛠️ Development

The codebase is split across logical files:

- `js/data/` – Game constants (elements, bosses, map nodes, traits, etc.)
- `js/visuals.js` – The new visual system (`createSlimeVisual`, element themes, rarity effects)
- `js/ui.js` – All rendering, modals (detail view, battle sequence), haven, etc.
- `js/systems/` – Core gameplay systems
- `index.html` + `styles/main.css` – Thin shell + styles

Key objects/functions to know:
- `game` state object
- `recalculateSlimePower(slime)`
- `ELEMENT_VISUALS` + `createSlimeVisual(slime)`
- `updateUI()`, `renderHaven()`, `showBattleSequence()`, etc.

To develop:
- Edit files in `js/` and `styles/`
- Refresh the page (or the local server)

Future desktop app path: We can wrap this web app in **Electron** (or Tauri) with almost zero changes to the game code. The `index.html` becomes the renderer content.

## 🚀 Future Ideas / Roadmap (not yet implemented)

- New regions / deeper map nodes
- More traits and trait synergy
- Slime personalities or visual variants
- Prestige / reincarnation layer
- Better mobile touch UX & offline progress simulation
- Export / import save strings
- Sound / music hooks (currently silent)
- Achievements system
- Leaderboards or community sharing (if hosted)

## 📜 Credits / Inspiration

- Inspired by the cozy monster-taming and idle elements of *By the Grace of the Gods*.
- Built as a relaxing, self-contained browser experience.

---

**Ready to play?** Double-click `index.html` or run:

```bash
# From this folder (macOS / any system with Python)
python3 -m http.server 8000
# then open http://localhost:8000/index.html
```

Enjoy taming slimes! 🐾

