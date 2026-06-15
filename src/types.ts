export type ElementType = "Fire" | "Plant" | "Earth" | "Electric" | "Water";

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
  type: "healing" | "mana" | "revive";
  effectValue: number;
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
  gold: number;
  daysPassed: number;
  party: Character[];
  unlockedCompanions: string[]; // companion classes available to recruit OR recruit log
  quests: Quest[];
  items: Item[];
  activeZoneId: string;
  materials?: Record<string, number>; // material inventory
  craftedArtifactIds?: string[]; // crafted passive accessories
  claimedAchievementIds?: string[]; // claimed milestones
  decryptedLogIds?: string[]; // decrypted story logs
  statistics: {
    totalGoldGained: number;
    totalMonstersSlain: number;
    totalUpgradesDone: number;
  };
}
