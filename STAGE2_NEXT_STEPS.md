# ASHFALLER Stage 2 — Planned Improvements

After testing Stage 1, here are the most impactful next steps in priority order:

## 1. Item Attunement System

**What:** Items should level up with use. Using an item in an action increases its "attunement" (1–10), granting passive bonuses.

**Why:** Creates meaningful progression beyond just collecting things. Makes players value specific items and encourages repeated expeditions.

**Implementation:**
- Add `attunement: number` (0–10) to `InventoryItem`
- Add `onUseBonus?: { xp: number; vitality: number }` to items
- When an item is used in an action, increment attunement and apply bonus
- Display attunement level in the inventory detail view (e.g. "★★★☆☆")
- At level 10, unlock a special "awakened" effect (unique flavor text + bigger bonuses)

**Example:**
- **Dustglass Shard** (0 stars) → Use it 10 times → Becomes **Awakened Dustglass** (Reveals hidden paths)

---

## 2. Loot Rarity & Depth Scaling

**What:** Deeper you go, better loot appears. Different scenes have different drop pools.

**Why:** Makes extraction pressure meaningful. You stay longer for the good stuff, but risk is real.

**Implementation:**
- Add `lootPool: string[]` to each `Scene` definition
- Weight pools by depth: Archive/Threshold = common/uncommon, Obelisk/Caravan = rare/mythic
- When items drop, roll rarity first, then pick from that rarity's pool
- Consider using a weighted random picker

**Example:**
```ts
'broken-obelisk': {
  // ...
  lootPool: {
    common: ['gate-coin', 'ashwater-flask'],
    uncommon: ['dustglass-shard', 'whisper-thread'],
    rare: ['brass-locator', 'veil-salt', 'obelisk-fragment'],
    mythic: ['name-scroll', 'crystal-message'],
  },
}
```

---

## 3. Extraction Pressure & Lantern Drain

**What:** Lantern depletes faster the deeper you go. Lantern depletion rate increases per location.

**Why:** Creates the "do I go deeper or back now?" tension that makes the game addictive.

**Implementation:**
- Add `lanternCostPerAction: number` to each scene (Archive = 0, Red Waste = 5, Glass Dune = 10, Obelisk = 15)
- Deduct lantern on action completion, not just on travel
- When lantern gets low (< 25%), show a warning in the log: "Your lantern flickers weakly."
- At 0, expedition ends automatically (failure state)
- Optionally: scenes can become "unstable" when lantern < 30%, hiding some actions or changing text

---

## 4. Veil Layers & Hidden Actions

**What:** Some scenes have hidden second layer of choices revealed only by the "Listen" action or high Focus.

**Why:** Rewards curiosity and attentiveness. Adds replayability (discover new paths on repeat runs).

**Implementation:**
- Add `veiled: SceneAction[]` to scenes (hidden actions)
- "Listen" action has a small chance (or Focus check?) to reveal one veiled action
- Veiled actions are usually better rewards but higher risk
- Example: In Broken Obelisk, "Listen" reveals "Speak a True Name" (high XP, high risk of Veil damage)

---

## 5. Consequence System & Story Flags

**What:** Choices have invisible flags. Later scenes react to what you did earlier.

**Why:** Makes the world feel alive and reactive. Encourages roleplaying.

**Implementation:**
- Add `flags: Set<string>` to GameState (e.g. `'respected-caravan', 'spoke-true-name'`)
- Each action can set flags: `action.setFlags: ['key']`
- Scenes can have conditional actions: `action.requiresFlag: 'spoke-true-name'` (only show if flag set)
- Or conditional text: `description` changes based on flags

**Example:**
- First run: You find the Hollow Caravan, search it, take relics
- Second run (with flag 'looted-caravan'): Scene text changes to acknowledge you've been here before

---

## 6. Archive Hub Upgrades

**What:** Return to Archive and spend relics to unlock permanent perks for future runs.

**Why:** Makes the hub meaningful. Gives meta-progression (legacy unlocks) beyond single-run XP.

**Implementation:**
- Add `archiveUpgrades: Set<string>` to GameState
- In Archive, add new actions like "Use Relic at the Forge"
- Upgrades cost specific mythic items or accumulated "Archive Points" (gained from relics returned)
- Examples:
  - **Reinforced Lantern**: Lantern capacity +20
  - **Ashfall Attire**: Vitality recovery +5 per expedition
  - **New Gate Code**: Unlock a second expedition destination
  - **Archive Library**: Unlock codex entries (lore, item descriptions)

---

## 7. Polish & Juice

**What:** Tighten animations, add sound design, improve text feedback.

**Why:** Make success *feel* good. Make failure sting slightly. Make the world feel tangible.

**Ideas:**
- Subtle background pulse when collecting rares/mythics
- Screen shake on critical moments (Veil closing, lantern dying)
- Item particles/swoosh on pickup
- Better "level up" fanfare (bigger glow, satisfying number pop)
- Log entries appear with typewriter effect (not instant)
- Audio: ambient wind, gate hum, level-up chime, extraction success sound

---

## 8. Codex / Lore Compendium

**What:** Players unlock codex entries by discovering items, locations, and NPCs.

**Why:** Rewards curiosity. Builds world-building depth without bloating the main loop.

**Implementation:**
- Add `codexEntries: Map<string, CodexEntry>` to GameState
- Each item/scene/NPC can register a codex entry when discovered
- In Archive, add "View Codex" that shows all discovered entries
- Mythic items or story moments unlock special entries

---

## Testing & Feedback Loop

After each stage, test:
1. **One full expedition** — Does it feel engaging?
2. **Repeat 3 runs** — Do you see variation? Do upgrades feel meaningful?
3. **Check UX** — Is anything confusing? Do animations feel responsive?
4. **Read the writing** — Does the atmosphere hold up?

---

## Minimal MVP for Stage 2

If you want to pick just ONE system to add first, choose **Item Attunement** or **Loot Scaling**. Both are:
- Self-contained (don't require other systems)
- Immediately feel rewarding
- Add replay value

Then add **Extraction Pressure** (lantern drain per scene) — it's small but transforms the whole feel of the game.

Good luck! The bones are solid. Now it's about *deepening* what works.

— Claude
