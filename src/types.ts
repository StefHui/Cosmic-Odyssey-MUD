export type ElementType = "Fire" | "Plant" | "Earth" | "Electric" | "Water";

// 早午晚 — day is split into 3 time slots, each with its own gameplay effects.
export type TimeOfDay = "morning" | "noon" | "night";

export interface Skill {
  name: string;
  mpCost: number;
  multiplier: number;
  description: string;
  effect: "damage" | "heal" | "buff_atk" | "shield";
}

export interface Equipment {
  name: string;
  level: number;
  bonus: number;
  // --- Dropped-gear tracking (Stage 2). Present when a DroppedGear is equipped in this slot. ---
  gearUid?: string;        // uid of the equipped DroppedGear (undefined = starter gear)
  rarity?: GearRarity;
  element?: ElementType;
  appliedAtk?: number;     // atk bonus this gear currently contributes to the character
  appliedDef?: number;     // def bonus
  appliedHp?: number;      // maxHp bonus
}

export interface EquipmentSet {
  weapon: Equipment;
  armor: Equipment;
}

export interface Character {
  id: string;
  name: string;
  className: "Hero" | "Wizard" | "Priest" | "Assassin" | "Paladin";
  title: string;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  atk: number;
  def: number;
  lv: number;
  exp: number;
  maxExp: number;
  element: ElementType;
  isDead?: boolean;
  activeSkill: Skill;
  equipment: EquipmentSet;
}

export type MonsterTier = "normal" | "elite" | "boss";

export interface DropEntry {
  kind: "material" | "item" | "gear";
  id: string; // material id | item id | gear template id
  chance: number; // 0..1 base chance (pre time-of-day bonus)
  min: number; // min qty when it drops
  max: number; // max qty
}

export interface MonsterTemplate {
  name: string;
  baseHp: number;
  baseAtk: number;
  baseDef: number;
  element: ElementType;
  rewardExp: number;
  rewardGold: number;
  description: string;
  emoji: string;
  tier: MonsterTier;
  timeAvailability: TimeOfDay[]; // which time slots this monster can appear in
  dropTable: DropEntry[];
}

export interface Monster {
  id: string; // unique runtime id
  name: string;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  element: ElementType;
  rewardExp: number;
  rewardGold: number;
  description: string;
  emoji: string;
  isDead: boolean;
  tier: MonsterTier;
  dropTable: DropEntry[];
}

// --- Gear drops (Stage 2): lightweight inventory of equippable/sellable gear ---
export type GearRarity = "common" | "rare" | "epic" | "legendary";

export interface GearTemplate {
  id: string;
  name: string;
  slot: "weapon" | "armor";
  rarity: GearRarity;
  element?: ElementType;
  atkBonusRange?: [number, number]; // weapon
  defBonusRange?: [number, number]; // armor
  hpBonusRange?: [number, number]; // armor
}

export interface DroppedGear {
  uid: string; // unique instance id
  templateId: string;
  slot: "weapon" | "armor";
  rarity: GearRarity;
  name: string;
  level: number; // start level 1, upgradable
  atkBonus: number;
  defBonus: number;
  hpBonus: number;
  element?: ElementType;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  targetType: "experience" | "slay" | "gold" | "upgrade";
  targetValue: number;
  currentValue: number;
  rewardGold: number;
  rewardExp: number;
  status: "active" | "ready" | "completed";
}

export interface Zone {
  id: string;
  name: string;
  description: string;
  minLevel: number;
  element: ElementType;
  monsters: string[]; // names of monster templates
  iconName: string; // Lucide icon mapping name
  bgGradient: string;
  colorHex: string;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  type: "healing" | "mana" | "revive" | "buff";
  effectValue: number; // healing/mana: flat amount; revive: % of maxHp; buff: % ATK for the battle
  price: number;
  emoji: string;
  count: number;
}

export interface Material {
  id: string;
  name: string;
  description: string;
  emoji: string;
  rarity: "common" | "rare" | "epic";
}

export interface Artifact {
  id: string;
  name: string;
  description: string;
  emoji: string;
  effectText: string;
  recipe: {
    gold: number;
    materials: Record<string, number>;
  };
}

export interface SpaceEvent {
  id: string;
  title: string;
  description: string;
  illustration: string; // emoji or design tag
  choices: Array<{
    text: string;
    actionId: string;
    description: string;
  }>;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji?: string;
  targetType: "slay" | "gold_total" | "upgrade_max" | "awake_count";
  targetValue: number;
  rewardGold: number;
  rewardText: string;
}

export interface BattleLog {
  id: string;
  text: string;
  type: "normal" | "player_action" | "monster_action" | "system" | "victory" | "gameover" | "critical" | "guarded" | "achievement" | "crafting" | "event";
}

export interface GameSave {
  saveVersion?: number; // bumped when the save shape changes; merge-defaults on load
  gold: number;
  daysPassed: number;
  timeSlotIndex?: number; // 0=morning, 1=noon, 2=night, 3=day exhausted
  party: Character[];
  unlockedCompanions: string[]; // companion classes available to recruit OR recruit log
  quests: Quest[];
  items: Item[];
  activeZoneId: string;
  materials?: Record<string, number>; // material inventory
  craftedArtifactIds?: string[]; // crafted passive accessories
  claimedAchievementIds?: string[]; // claimed milestones
  decryptedLogIds?: string[]; // decrypted story logs
  gearInventory?: DroppedGear[]; // dropped gear (Stage 2)
  forgePity?: Record<string, number>; // per-slot accumulated forge luck (Stage 3)
  statistics: {
    totalGoldGained: number;
    totalMonstersSlain: number;
    totalUpgradesDone: number;
  };
}
