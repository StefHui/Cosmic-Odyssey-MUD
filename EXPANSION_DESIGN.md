# Cosmic Odyssey MUD — Expansion Design & Implementation Spec

> **Purpose of this doc:** A self-contained, implementation-ready spec for a new chat/session to build 4 major expansion features in stages. The implementer has *no memory of the prior conversation* — everything needed is here.
>
> **粵語 TL;DR(俾 owner 睇):** 呢份係將個 demo 升級成完整 RPG 嘅施工圖。分 4 個階段做,每階段 build 綠燈 + 可玩 + commit 先去下一個。設計決定已經拍板(見下面 "Locked design decisions")。

---

## 0. Context for the implementer (READ FIRST)

### Repo & stack
- **Repo:** `StefHui/Cosmic-Odyssey-MUD`, branch `main`. (Local dir is empty → `gh repo clone StefHui/Cosmic-Odyssey-MUD` first.)
- **Stack:** Vite 6 + React 19 + TypeScript ~5.8 + Tailwind v4. Pure front-end, **no backend, no API keys**. Game is fully deterministic/local.
- **Persistence:** `localStorage` key `"COSMIC_ODYSSEY_SAVE_STATE"`, shape = `GameSave` in `src/types.ts`.
- **Verify after every change:** `npm run lint` (= `tsc --noEmit`) **and** `npm run build` must both be green.

### File map
| File | Role |
|------|------|
| `src/App.tsx` | ~3,450-line single component — ALL state, combat engine, town actions, JSX. |
| `src/data.ts` | Static data + `getElementRelation` (the only shared logic). |
| `src/types.ts` | Domain types incl. `GameSave`. |
| `src/components/ElementChart.tsx` | Affinity matrix widget. |
| `src/tests/gameLogic.test.ts` | Hand-rolled console-assert tests (orphaned — not wired to npm). |

### Core mechanics already in place (do not re-derive — reuse)
- **Element cycle:** Fire→Plant→Earth→Electric→Water→Fire. `getElementRelation(atk, def)` returns `{ multiplier, type, symbol, text }`: same=1.0, beats=1.5 (`critical`), beaten=0.75 (`guarded`).
- **Damage formula (inline in `executeAllyAction` / `executeMonsterTurn`):** `Math.max(floor, Math.round((atk - def*k) * multiplier))`. Floors today: normal attack 2 (k=0.4), skill 5 (k=0.45), monster 1 (k=0.4). (Consider unifying floor to 2.)
- **Level curve (in `winBattle`, also duplicated in `claimQuestReward` and the storm event):** while `exp >= maxExp`: `maxExp = round(maxExp*1.5)`, `maxHp = round(maxHp*1.15)+15`, `maxMp = round(maxMp*1.15)+8`, `atk+=4`, `def+=2`, full heal. ⚠️ This level-up loop is copy-pasted in 3 places — **extract it to a helper `applyExpGain(member, exp)` in `data.ts`** as part of this work and reuse everywhere.
- **Zones:** `ZONES` (5 zones, `minLevel` gates entry, checked vs `party[0].lv`).
- **Combat flow:** `startCombat` → ally turns (`executeAllyAction`) → `passTurnToNextColleague` → `executeMonsterTurn` → loop; `winBattle` / `loseBattle` end it. Turns are driven by `setTimeout` + `setCombat`/`setParty`.

### ⚠️ KNOWN GOTCHAS — must respect
1. **Stale autosave pattern.** React `setState` is async. Several places call `triggerAutosave(...)` right after `setX(...)` but pass the **old closure value**, so the save misses the just-applied change. **Always pass freshly-computed "next" values into `triggerAutosave`.** There are 3 existing real bugs to FIX as part of this work:
   - Lore decrypt (`App.tsx` ~line 2414): passes stale `gold` + `materials` → decode reward not persisted that save.
   - Space event merchant buy-feather (`handleSpaceEventChoice`, ~line 1055): passes stale `items` → bought Phoenix Feather not persisted that save.
   - `restAtTavern`: `setDaysPassed(d=>d+1)` then saves stale `daysPassed` → day count off by one.
2. **Combat uses stale-closure-prone `setTimeout` chains.** When threading state across a turn, pass the computed party explicitly (as `winBattle(finalPartyState)` already does) rather than relying on the `party` closure.
3. **Animation IDs** use `` `..._${Date.now()}` `` and can collide within 1ms → React duplicate-key warnings. Use a monotonic counter or append `Math.random()`.
4. **`GameSave` backward-compat.** On load, every field is read with `if (parsed.x !== undefined)` guards. When you ADD fields, keep this pattern + provide defaults so old saves still load. **Add `saveVersion: number` to `GameSave` and write a small migration/merge-defaults step.**

### Locked design decisions (already approved by owner)
- **Build in stages**, in the order below; each stage independently playable + committed.
- **Forge (upgrade) failure = deduct gold, keep level, + pity mechanism** (guaranteed success after enough consecutive fails). No permanent downgrade.
- **Time-of-day has real gameplay effects:** different monsters per time slot, night-only monsters, monsters stronger at night, night-exclusive bosses.

### Recommended build order
1. **Stage 1 — Day / time-of-day system (早午晚 + multiple actions per day)** ← foundational, others hook into it.
2. **Stage 2 — Monster variety + randomized drop tables + gear/potion drops.**
3. **Stage 3 — Trading post (交易所) + forge success rate with pity.**
4. **Stage 4 — Story: main quest line + side/daily quests + lore gating.**

---

## Stage 1 — Day & Time-of-Day System (早午晚)

**Goal:** A day has 3 time slots; ventures consume slots; town management is free; time of day changes gameplay; resting advances the day.

### 1.1 State & types
```ts
// types.ts
export type TimeOfDay = "morning" | "noon" | "night"; // 早晨 / 午間 / 夜晚

// GameSave additions:
saveVersion: number;        // start at 1
timeSlotIndex: number;      // 0=morning, 1=noon, 2=night
```
- New React state: `const [timeSlotIndex, setTimeSlotIndex] = useState(0)`.
- Helper: `const TIME_ORDER: TimeOfDay[] = ["morning","noon","night"]`; `const currentTimeOfDay = TIME_ORDER[timeSlotIndex]`.
- Map for UI: morning `☀️ 早晨`, noon `🌤️ 午間`, night `🌙 夜晚`.

### 1.2 Rules
- **Slot-consuming actions:** completing a venture = one slot. A "venture" = a `startCombat` that results in a combat OR a space event. Advance the slot **when the venture resolves** (`winBattle`, `loseBattle`, `escapeCombat`, and after `handleSpaceEventChoice`). Do **not** advance on the "min level too low / all dead" early-returns.
- **Free actions (no slot):** shop buy/sell, blacksmith upgrade/awaken/craft, recruit, claim quest, decrypt lore, trading post.
- **End of day:** after the **night** venture resolves (slot would go past index 2), block further ventures and prompt to rest. `startCombat` should refuse with a log: `"🌙 夜深了，隊伍需要休整。請前往太空酒館休息以迎接新一天。"` when `timeSlotIndex > 2` (or when already used night).
  - Implementation: let `timeSlotIndex` advance to `3` meaning "day exhausted". Guard ventures on `timeSlotIndex >= 3`.
- **Resting (`restAtTavern`):** set `daysPassed+1`, `timeSlotIndex = 0`, full HP/MP restore. (Also **fix the stale `daysPassed` save bug** here.)
- **Anti-softlock:** add a **free "野外紮營" (Camp)** button: advances `daysPassed+1`, `timeSlotIndex=0`, restores **30% maxHP/MP** (no gold). Tavern rest (paid, `party.length*15`) = full restore. So a broke player is never stuck.

### 1.3 Time-of-day gameplay effects
- **Morning ☀️:** baseline.
- **Noon 🌤️:** victory **gold reward ×1.15** (stack with existing Gold Attractor artifact). Log it.
- **Night 🌙:** at spawn, multiply monster `hp/maxHp/atk` by **1.25** (and `def` by 1.15); drop chances ×1.4 (cap 0.95) and +1 to max qty; reward exp/gold ×1.2. Night unlocks night-only monsters and the night boss (see Stage 2).
- Encounter selection: filter zone monster pool by `timeAvailability` containing `currentTimeOfDay` (Stage 2 adds the tags). Until Stage 2 lands, all current monsters are available at all times (default `["morning","noon","night"]`).

### 1.4 UI
- Header: `📅 第 {daysPassed} 日` + time-of-day chip + slot pips, e.g. `☀️● 🌤️● 🌙○` (filled = used). When exhausted show `需要休息`.
- Zone-select panel: show current time-of-day and a one-line modifier hint (e.g. `🌙 夜晚：魔物強化 +25%，稀有掉落率上升，可能遭遇夜行魔物/夜域主`).

### 1.5 Persistence & migration
- Add `saveVersion`, `timeSlotIndex` to the `GameSave` written in `triggerAutosave` and hydrate in the load `useEffect` with defaults (`timeSlotIndex ?? 0`). Bump `saveVersion` to 1.

### 1.6 Acceptance criteria
- Up to 3 ventures per day; after night, ventures blocked until rest/camp.
- Time chip + slot pips update correctly and persist across reload.
- Noon gold bonus and night monster buff are observable in logs.
- Camp prevents soft-lock when gold = 0.

---

## Stage 2 — Monster Variety + Drop Tables + Gear/Potion Drops

**Goal:** richer bestiary, time-gated & tiered monsters, and varied randomized loot (materials, potions, gear) with variable quantities.

### 2.1 Type changes
```ts
// types.ts
export type MonsterTier = "normal" | "elite" | "boss";

export interface DropEntry {
  kind: "material" | "item" | "gear";
  id: string;       // material id | item id | gearTemplate id (for gear, see 2.4)
  chance: number;   // 0..1 base chance (pre time-of-day bonus)
  min: number;      // min qty when it drops
  max: number;      // max qty
}

export interface MonsterTemplate {
  // ...existing fields...
  tier: MonsterTier;
  timeAvailability: TimeOfDay[];   // when this monster can appear
  dropTable: DropEntry[];
}
```
Backfill existing 10 templates: `tier:"normal"` (gravity_sentinel = `"boss"`), `timeAvailability: ["morning","noon","night"]`, and a `dropTable` reflecting current behavior plus a little variety.

### 2.2 New monsters (target ≥4 per zone, incl. ≥1 night-only + 1 night boss in later zones)
Add ~10–15 new templates across zones. For each: name (繁中 sci-fi flavor like existing), element matching zone, stats scaled to zone, `tier`, `timeAvailability`, `dropTable`.
- Examples of night-only flavor: zone_1 `"夜光孢子幽蛾"`, zone_3 `"熔燼夜行炎犬"`, zone_4 `"靜默雷暴遊魂"`, etc.
- **Night bosses** (`tier:"boss"`, `timeAvailability:["night"]`): one for at least zones 3/4/5, big HP/ATK, rich dropTable incl. `nebula_core` and an epic/legendary gear drop. Low spawn weight (see 2.3).

### 2.3 Spawn selection (rewrite the picker in `startCombat`)
1. Filter `zone.monsters` (now richer) by `timeAvailability.includes(currentTimeOfDay)`.
2. Weight by tier: normal 70%, elite 25%, boss 5% (boss only if a boss is in the filtered pool, e.g. at night). Tune per zone.
3. If `currentTimeOfDay === "night"`, apply the night stat multipliers from Stage 1.3 at spawn.

### 2.4 Gear-drop model (decision: lightweight gear inventory)
Introduce dropped gear as inventory items the player can **equip (if better) or sell** at the trading post (Stage 3).
```ts
export type GearRarity = "common" | "rare" | "epic" | "legendary";
export interface GearTemplate {
  id: string; name: string; slot: "weapon" | "armor";
  rarity: GearRarity; element?: ElementType;
  // rolled stats range; on drop, roll within range:
  atkBonusRange?: [number, number];   // weapon
  defBonusRange?: [number, number];   // armor
  hpBonusRange?: [number, number];    // armor
}
export interface DroppedGear {
  uid: string;          // unique instance id
  templateId: string;
  slot: "weapon" | "armor"; rarity: GearRarity;
  name: string; level: number;  // start level 1, upgradable
  atkBonus: number; defBonus: number; hpBonus: number;
  element?: ElementType;
}
// GameSave addition:
gearInventory: DroppedGear[];
```
- Rarity → bonus scale (suggested): common ×1, rare ×1.6, epic ×2.4, legendary ×3.5 over a base.
- **Equipping:** equipping a `DroppedGear` replaces the member's `equipment.weapon`/`armor` and recomputes derived stats. ⚠️ Current code adds gear bonus directly into `atk`/`def`/`maxHp` at upgrade time (no separation between base and gear). To keep it simple and avoid a stat-recompute refactor, on equip: **remove old gear's bonus then add new gear's bonus** to `atk`/`def`/`maxHp`. Track the currently-applied bonus on the equipment object so swaps are reversible. (Alternatively do a full base/derived refactor — more correct but larger; note as optional.)
- **MVP fallback if the inventory is too big for one stage:** gear drops instead grant a free `+1` to a chosen member's weapon/armor (reusing `monolith_infuse` logic) OR convert to gold. Ship the inventory version if time allows; otherwise MVP and leave a TODO.

### 2.5 New consumables (potions)
Add to `SHOP_ITEMS` / a master item list (so drops can reference ids):
- `potion_hp_large` (+500 HP, price 70), `potion_mp_large` (+250 MP, 75), `elixir_full` (revive 100%, 300), `tonic_atk` (combat: +20% ATK for the battle, 60 — needs a temp-buff field on combat state).
- `tonic_atk` requires a per-battle buff: add `atkBuffPct` to combat state or a transient flag on the actor; apply in damage calc; clear on `winBattle`/`loseBattle`.

### 2.6 Drop resolution (rewrite winBattle drop block)
Replace the hardcoded zone-based material roll with:
```
for (const entry of monster.dropTable) {
  let chance = entry.chance;
  let maxQty = entry.max;
  if (night) { chance = Math.min(0.95, chance*1.4); maxQty += 1; }
  if (Math.random() < chance) {
    const qty = randInt(entry.min, maxQty);
    apply by kind: material→materials[id]+=qty; item→items[id].count+=qty; gear→push rolled DroppedGear x qty;
    log each drop.
  }
}
```
- Thread all updated collections (materials, items, gearInventory) into `triggerAutosave` (no stale saves).

### 2.7 Acceptance criteria
- Each zone has ≥4 monsters; night-only monsters & night bosses appear only at night.
- Loot varies in **type and quantity** between kills; potions and gear can drop; logs list every drop.
- Dropped gear appears in inventory and can be equipped/sold (or MVP fallback works).

---

## Stage 3 — Trading Post (交易所) + Forge Success Rate (with Pity)

### 3.1 Trading post — new town tab `"exchange"`
- **Materials:** buy & sell. Price by rarity (common 20 / rare 60 / epic 150). Buy = price ×1.5, sell = price ×0.5 (reuse existing 0.5 sell convention).
- **Gear:** sell from `gearInventory` (value by rarity×level). Optionally a **daily-refreshing stock** of 3–5 random gear/potions (ties to day system: regenerate when `daysPassed` changes; store `exchangeStockDay` + `exchangeStock` in state, not necessarily in save).
- UI: two columns (買 / 賣), material grid with +/- qty, gear list with sell buttons.

### 3.2 Forge success rate + pity (decision locked)
Modify `upgradeGear`:
```
const base = 0.95 - (currentLevel - 1) * 0.07;     // Lv1→2: 95%, Lv2→3: 88%, ...
const pityBonus = forgePity[slotKey] ?? 0;          // accumulated luck
const successChance = Math.min(0.99, Math.max(0.30, base) + pityBonus);
const roll = Math.random();
deduct gold (goldCost) ALWAYS;
if (roll < successChance) {
  apply +1 level & stat bonus (existing logic);
  forgePity[slotKey] = 0;                            // reset pity
  log success with chance shown;
  progress "upgrade" quest milestone (only on success? -> see note);
} else {
  forgePity[slotKey] = pityBonus + 0.15;            // +15% next time -> guaranteed within a few tries
  log failure: "強化失敗！裝備等級不變，但鍛造幸運值提升 (下次成功率 +15%)";
}
```
- `slotKey = `${charId}_${type}``. Add `forgePity: Record<string, number>` to `GameSave`.
- Show the **current success %** on the upgrade buttons in the blacksmith UI.
- **Quest note:** the existing "upgrade ×5" quest counts attempts via `checkQuestMilestone("upgrade",1,...)`. Decide: count **successes only** (recommended, matches "強化 5 次" intent) — move the milestone call into the success branch.
- Cost on failure still consumes gold (per locked decision). Pity guarantees no infinite money sink.

### 3.3 Acceptance criteria
- Upgrade buttons show % chance; chance drops with level, floor 30%.
- Failures deduct gold, keep level, raise pity; success consumes pity; success is guaranteed within ~5 fails.
- Trading post can buy/sell materials and sell gear; daily stock refreshes with the day.

---

## Stage 4 — Story: Main Quest Line + Side/Daily Quests + Lore Gating

### 4.1 Quest type changes
```ts
// types.ts — extend Quest
export interface Quest {
  // ...existing...
  kind: "main" | "side" | "daily";
  chapter?: number;                 // for main line ordering
  prerequisiteQuestId?: string;     // unlock chain
  storyBefore?: string;             // narrative shown when offered
  storyAfter?: string;              // narrative shown on completion
  isUnlocked?: boolean;             // gated quests start locked
}
// GameSave additions:
completedQuestIds: string[];
currentChapter: number;            // main-line progress
dailyQuestDate: number;            // daysPassed when dailies last refreshed
```

### 4.2 Main quest line (`MAIN_QUESTS` in data.ts)
- A chain of **~6–8 chapters**, each unlocking the next on completion (`prerequisiteQuestId`), advancing an overarching story (e.g. uncover why the前文明 "崩塌", culminating in the gravity_sentinel / a final night boss).
- Tie chapters to zones: e.g. Ch.1 clear zone_1 tasks → Ch.2 unlock zone_2 narrative, … Ch.final defeat a night boss in zone_5.
- On completing a chapter: `currentChapter++`, show `storyAfter`, unlock next chapter's quest + maybe new lore.

### 4.3 Side & daily quests
- **Side pool** (`SIDE_QUEST_POOL`): unlocked by level or chapter; varied `targetType` incl. existing (`slay/gold/experience/upgrade`) plus new **collect-material** and **slay-specific-monster** (add `targetMonsterId?`/`targetMaterialId?` to Quest, and hook counting in `winBattle`).
- **Daily pool** (`DAILY_QUEST_POOL`): each new day (when `daysPassed` increases past `dailyQuestDate`), refresh 2–3 small dailies (small slay/collect, decent gold). Reset their progress.
- Quest board UI: group by 主線 / 支線 / 每日 tabs.

### 4.4 Lore gating
- Add more `LORE_RECORDS`; gate by **main-quest chapter** (`unlockedAtChapter`) in addition to / instead of level. Keep `getReward` functional-update pattern (already correct) but **fix the stale save** at the decrypt handler (pass fresh `gold`/`materials`).

### 4.5 Acceptance criteria
- Main quests unlock sequentially with before/after story text; `currentChapter` persists.
- Side quests appear by gating; collect-material & slay-specific quests track correctly.
- Dailies refresh once per in-game day and reset progress.
- New lore unlocks by chapter; decode reward persists immediately (bug fixed).

---

## Cross-cutting checklist (apply throughout)
- [ ] Extract the **level-up loop** into `applyExpGain(member, exp): {member, leveledUp, newLv}` in `data.ts`; replace all 3 copies.
- [ ] Fix the **3 stale-autosave bugs** (lore decrypt, merchant feather, restAtTavern day).
- [ ] Add **`saveVersion`** + merge-defaults migration so old saves keep loading.
- [ ] Thread freshly-computed next-state into every `triggerAutosave` call (no stale closures).
- [ ] Replace `Date.now()`-only animation IDs with collision-proof IDs.
- [ ] Keep `npm run lint` **and** `npm run build` green after every stage; commit per stage.
- [ ] (Nice-to-have) Wire a real `"test"` npm script and import the real (now-extracted) formulas into `src/tests/gameLogic.test.ts` so tests guard production code.

## Suggested commit messages
- `feat(time): add day + morning/noon/night system with time-based encounters`
- `feat(loot): tiered/time-gated monsters with randomized drop tables (materials, potions, gear)`
- `feat(economy): trading post + forge success rate with pity mechanic`
- `feat(story): main quest line, side/daily quests, chapter-gated lore`

## Out of scope (backlog, optional)
- Save export/import (string code) — high value given localStorage fragility.
- SFX/BGM toggle. Party reorder. Mobile layout pass.
- Full base/derived stat refactor for clean gear equipping.

---

## Appendix A — Quick reference: where everything lives

> Line numbers are as of commit `f474bed` (the commit that added this doc). They drift as you edit — treat them as "jump-near here", and confirm by searching the symbol name. All in `src/App.tsx` unless noted.

### Key symbols & anchors (current line numbers)
| Symbol / anchor | Line | File |
|---|---|---|
| `interface LoreRecord` + `LORE_RECORDS` data | 75 | App.tsx |
| state: `gold/daysPassed/party/quests/items/activeZoneId/statistics` | ~146 | App.tsx |
| state: `materials/craftedArtifactIds/claimedAchievementIds/activeSpaceEvent` | ~159 | App.tsx |
| state: `activeTab` (explore/tavern/blacksmith/quests) | 170 | App.tsx |
| state: `questsSubTab` / `smithySubTab` | 171–172 | App.tsx |
| **load** save (`localStorage.getItem`) — hydrate new fields here | 258 | App.tsx |
| `triggerAutosave` (writes save) — add new fields here | 309 | App.tsx |
| `localStorage.setItem` inside triggerAutosave | 335 | App.tsx |
| `resetGame` | 353 | App.tsx |
| `checkQuestMilestone` | 384 | App.tsx |
| `claimQuestReward` (has duplicated level-up loop) | 415 | App.tsx |
| `upgradeGear` ← **Stage 3 success rate + pity** | 490 | App.tsx |
| `awakenCharacter` | 553 | App.tsx |
| `craftArtifact` | 623 | App.tsx |
| `claimAchievement` | 689 | App.tsx |
| `buyConsumable` / `sellConsumable` | 724 / 750 | App.tsx |
| `restAtTavern` ← **Stage 1 day advance + FIX stale `daysPassed` save** | 772 | App.tsx |
| `recruitCompanion` | 797 | App.tsx |
| `startCombat` ← **Stage 1 slot guard + Stage 2 spawn picker** | 848 | App.tsx |
| `handleSpaceEventChoice` ← **Stage 1 advance slot + FIX stale `items` save (~line 1055)** | 910 | App.tsx |
| `executeAllyAction` (inline damage formula, skill/item) | 1059 | App.tsx |
| `passTurnToNextColleague` | 1292 | App.tsx |
| `executeMonsterTurn` (Phoenix Lens revive already here) | 1333 | App.tsx |
| `winBattle` ← **Stage 1 noon gold + Stage 2 drop table; has level-up loop** | 1429 | App.tsx |
| `loseBattle` / `escapeCombat` ← **Stage 1 advance slot** | 1547 / 1577 | App.tsx |
| `useItemOutOfCombat` | 1618 | App.tsx |
| `<header>` (top bar) ← **Stage 1 day + time-of-day chip + slot pips** | 1814 | App.tsx |
| `<main id="station-cabinet-main-scroller">` | 1850 | App.tsx |
| TOWN VIEW container | 2290 | App.tsx |
| tab buttons (`setActiveTab(...)`) ← **Stage 3 add `"exchange"` tab button here** | 2303–2344 | App.tsx |
| `activeTab === "explore"` panel ← **Stage 1 time hint on zone select** | 2358 | App.tsx |
| `activeTab === "tavern"` panel ← **Stage 1 add Camp button near rest** | 2541 | App.tsx |
| `activeTab === "blacksmith"` panel (forge/alchemy/awaken subtabs) ← **Stage 3 show success %** | 2624 | App.tsx |
| `LORE_RECORDS.map` decrypt UI ← **Stage 4 chapter gating + FIX stale save (~line 2414)** | 2382 | App.tsx |
| `activeTab === "quests"` panel ← **Stage 4 main/side/daily tabs** | 2868 | App.tsx |
| `<footer>` (stats bar) | 3343 | App.tsx |

### data.ts (static data — most ADD work lands here)
| Symbol | Line | Stage |
|---|---|---|
| `getElementRelation` / emoji / label / color | 4–65 | — (reuse) |
| `SHOP_ITEMS` ← add new potions | 76 | 2 |
| `RECRUITABLE_COMPANIONS` / `HERO_INITIAL` | 110 / 221 | — |
| `MONSTER_TEMPLATES` ← add monsters + `tier`/`timeAvailability`/`dropTable` | 250 | 2 |
| `ZONES` ← richer monster lists | 368 | 2 |
| `MATERIALS` | 427 | 2/3 |
| `ARTIFACTS` | 455 | — |
| `ACHIEVEMENTS` | 503 | 4 |
| `RANDOM_EVENTS` | 543 | — |
| `INITIAL_QUESTS` ← split into MAIN/SIDE/DAILY pools | 633 | 4 |
| **NEW:** `applyExpGain()` helper (extract level-up loop) | — | cross-cutting |
| **NEW:** `GEAR_TEMPLATES`, gear-roll helpers | — | 2 |

### types.ts (extend these interfaces)
| Type | Line | Add |
|---|---|---|
| `Skill` / `Equipment` / `Character` | 3 / 11 / 22 | (gear bonus tracking on Equipment for swaps — Stage 2) |
| `MonsterTemplate` | 42 | `tier`, `timeAvailability`, `dropTable` (Stage 2) |
| `Quest` | 69 | `kind`, `chapter`, `prerequisiteQuestId`, `storyBefore/After`, `isUnlocked`, `targetMonsterId?`, `targetMaterialId?` (Stage 4) |
| `Item` | 93 | (maybe `buffPct` for tonic — Stage 2) |
| `GameSave` | 153 | `saveVersion`, `timeSlotIndex`, `gearInventory`, `forgePity`, `completedQuestIds`, `currentChapter`, `dailyQuestDate` (across stages) |
| **NEW** | — | `TimeOfDay`, `MonsterTier`, `DropEntry`, `GearRarity`, `GearTemplate`, `DroppedGear` |

### Per-stage "touch list" (the short version)
- **Stage 1:** types(`TimeOfDay`,`GameSave`) → state(`timeSlotIndex`) → load@258 + triggerAutosave@309/335 → `startCombat`@848 (guard) → `winBattle/loseBattle/escapeCombat` + `handleSpaceEventChoice` (advance slot) → `restAtTavern`@772 (+camp) → `<header>`@1814 + explore panel@2358 + tavern panel@2541 (UI).
- **Stage 2:** types(`MonsterTier`,`DropEntry`,gear types,`MonsterTemplate`,`GameSave.gearInventory`) → data(`MONSTER_TEMPLATES`@250, `ZONES`@368, `SHOP_ITEMS`@76, new `GEAR_TEMPLATES`) → `startCombat`@848 spawn picker → `winBattle`@1429 drop block → gear inventory UI (new sub-panel).
- **Stage 3:** types(`GameSave.forgePity`) → `upgradeGear`@490 (success/pity) + blacksmith UI@2624 (show %) → new `"exchange"` tab button@2303 + new exchange panel + sell-gear UI.
- **Stage 4:** types(`Quest` ext, `GameSave` quest fields) → data(`INITIAL_QUESTS`@633 → MAIN/SIDE/DAILY, more `LORE_RECORDS`@89) → `checkQuestMilestone`@384 + `claimQuestReward`@415 (chapter advance, collect/slay-specific counting in `winBattle`@1429) → quests panel@2868 (tabs) + lore gating@2382.

### Sanity gate (run after each stage)
```bash
npm run lint && npm run build
```
Both must pass before committing the stage.
