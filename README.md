# ASHFALLER: The Veil Between
## Stage 1 - Vertical Slice

A sci-fantasy extraction text RPG built with React + TypeScript + Vite + Tailwind CSS.

### What is this?

You are an **Ashfaller** — a lone ranger operating at the edge of a fractured reality. Beneath Dubbo, Australia, an ancient gate has opened into the **Red Waste** — a fractured world where powerful relics wait to be collected, and the Veil between worlds grows thin.

Each expedition is **8-15 minutes of tense decision-making**: travel deeper for better loot, but your lantern fades, your strength wanes, and the Veil may close before you can extract.

### Tech Stack

- **React 18** + TypeScript
- **Vite** (blazing fast dev server)
- **Tailwind CSS** + @tailwindcss/postcss
- **Zustand** (lightweight state management)
- **Framer Motion** (smooth animations)
- **localStorage** persistence

### Running the game

```bash
cd /c/ashfaller
npm install  # Already done
npm run dev
```

Then open `http://localhost:5173` in your browser.

### What to test — Prompt 1 Checklist

- [ ] **Game starts** — You begin in the Ashfall Archive. The opening text is atmospheric and readable.
- [ ] **UI is premium** — Obsidian glass panels, amber glows, scanlines, brass accents feel present.
- [ ] **First expedition** — Click "Ready for Expedition" and transition smoothly to the Threshold Gate.
- [ ] **Actions work** — Every action button works and advances the narrative.
- [ ] **XP gains feel good** — You see "+XP" notifications and watch the XP bar fill. Leveling up shows a satisfying message.
- [ ] **Items drop** — Find several items (common, uncommon, rare, mythic). Rare/mythic items glow and have flavor text.
- [ ] **Inventory displays correctly** — Can see all collected items; click one to read its description.
- [ ] **Stats update properly** — Vitality, Focus, Lantern, XP bars animate smoothly as you gain/lose values.
- [ ] **Complete an expedition** — Push through the Red Waste to either: Extract successfully (return to Archive) OR lose (die from low Vitality/Lantern).
- [ ] **Game saves** — Refresh the page; your level, XP, and inventory persist.
- [ ] **Replay is smooth** — Click "RETURN TO ARCHIVE" to go again. No lag, clean state.

### Current Scene Flow

1. **Ashfall Archive** (Hub) — Rest, study, prepare
2. **Threshold Gate** (Entry) — Feel the Veil thinning
3. **Red Waste Approach** (Exploration) — The first area
4. **Glass Dune** (Landmark) — Ancient crystal structure
5. **Broken Obelisk** (Sacred Ground) — Deepest point, high danger/reward
6. **Hollow Caravan** (Wreckage) — Graveyard of past travelers
7. **Extraction Point** (Final Choice) — Extract safely OR push into the Veil
8. **Return to Archive** (Win) OR **Veil Lost** (Alt win)

### Recommended Next Steps — Stage 2

After you've tested Stage 1, the next iteration should add:

1. **Rarity + Attunement** — Items level up by use. "Equipping" a relic gives passive bonuses.
2. **Better loot scaling** — Rarer items drop from deeper locations. Mythic items feel precious.
3. **Extraction pressure** — Lantern depletes faster the deeper you go. Veil becomes unstable; scenes can change.
4. **Consequence system** — Some choices have hidden flags that affect later outcomes.
5. **Archive upgrades** — Spend relics at the hub to unlock new gate destinations.

### Architecture

```
src/
  components/
    GameLog.tsx        — Scrolling narrative log
    StatsPanel.tsx     — Player stats bars
    InventoryPanel.tsx — Item list + detail
    ActionButtons.tsx  — Choice buttons
  data/
    scenes.ts          — All scene definitions (branching narrative)
    items.ts           — Item templates + rarity
  store/
    gameStore.ts       — Zustand state (persistence via localStorage)
  App.tsx              — Main game loop + action handling
  index.css            — Tailwind + custom styles
```

### Design notes

- **Scenes are data-driven** — Add new locations by extending `SCENES` in `data/scenes.ts`.
- **Actions are simple** — Each button triggers text, XP, items, stat changes, and a scene transition.
- **State is centralized** — All game logic flows through Zustand, which auto-persists.
- **UI is responsive** — Flex layout adapts to different window sizes gracefully.

### Known limitations (by design)

- No combat system yet
- Only one full expedition path (linear, branching at endpoints)
- No procedural generation
- No multiplayer or online features
- Attunement/item progression not yet implemented
- Audio not yet added

This is a **vertical slice** — one complete, polished experience that proves the core loop works. Future stages will add breadth (more locations, choices, mechanics) and depth (attunement, legacy unlocks, mastery).

### Have fun!

The writing is intentionally atmospheric and mysterious. Pay attention to the whispers. Pay attention to the Names. The Veil is always watching.

Good luck, Ashfaller.
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
