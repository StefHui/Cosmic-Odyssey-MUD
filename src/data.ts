import { Character, MonsterTemplate, Zone, Quest, Item, ElementType, Material, Artifact, Achievement, SpaceEvent, TimeOfDay, GearTemplate, GearRarity, DroppedGear } from "./types";

// --- Day / Time-of-Day ordering & UI labels (早午晚) ---
export const TIME_ORDER: TimeOfDay[] = ["morning", "noon", "night"];

export function getTimeOfDayLabel(t: TimeOfDay): string {
  switch (t) {
    case "morning": return "☀️ 早晨";
    case "noon": return "🌤️ 午間";
    case "night": return "🌙 夜晚";
  }
}

// Shared level-up loop. Returns a fresh leveled-up member plus whether it leveled.
// Extracted so the curve lives in ONE place (winBattle / claimQuestReward / storm event reuse this).
export function applyExpGain(
  member: Character,
  exp: number
): { member: Character; leveledUp: boolean; newLv: number } {
  let currentExp = member.exp + exp;
  let nextLv = member.lv;
  let nextMaxExp = member.maxExp;
  let nextHp = member.hp;
  let nextMaxHp = member.maxHp;
  let nextMp = member.mp;
  let nextMaxMp = member.maxMp;
  let nextAtk = member.atk;
  let nextDef = member.def;
  let leveledUp = false;

  while (currentExp >= nextMaxExp) {
    currentExp -= nextMaxExp;
    nextLv += 1;
    nextMaxExp = Math.round(nextMaxExp * 1.5);
    nextMaxHp = Math.round(nextMaxHp * 1.15) + 15;
    nextMaxMp = Math.round(nextMaxMp * 1.15) + 8;
    nextAtk = nextAtk + 4;
    nextDef = nextDef + 2;
    nextHp = nextMaxHp; // full heal on level up
    nextMp = nextMaxMp;
    leveledUp = true;
  }

  return {
    member: {
      ...member,
      lv: nextLv,
      exp: currentExp,
      maxExp: nextMaxExp,
      hp: nextHp,
      maxHp: nextMaxHp,
      mp: nextMp,
      maxMp: nextMaxMp,
      atk: nextAtk,
      def: nextDef
    },
    leveledUp,
    newLv: nextLv
  };
}

// Get elemental relation details
export function getElementRelation(
  attacker: ElementType,
  defender: ElementType
): { multiplier: number; type: "critical" | "guarded" | "normal"; symbol: string; text: string } {
  // Cycle: Fire 🔥 -> Plant 🌿 -> Earth ⛰️ -> Electric ⚡ -> Water 💧 -> Fire 🔥
  if (attacker === defender) {
    return { multiplier: 1.0, type: "normal", symbol: "", text: "一般效果" };
  }

  const beats: Record<ElementType, ElementType> = {
    Fire: "Plant",
    Plant: "Earth",
    Earth: "Electric",
    Electric: "Water",
    Water: "Fire",
  };

  if (beats[attacker] === defender) {
    return {
      multiplier: 1.5,
      type: "critical",
      symbol: "💥",
      text: "剋制！造成 1.5x 致命傷害！"
    };
  }

  if (beats[defender] === attacker) {
    return {
      multiplier: 0.75,
      type: "guarded",
      symbol: "🛡️",
      text: "被抗性抵擋，傷害降至 0.75x"
    };
  }

  return { multiplier: 1.0, type: "normal", symbol: "", text: "一般效果" };
}

// Get Element Emoji
export function getElementEmoji(elem: ElementType): string {
  switch (elem) {
    case "Fire": return "🔥";
    case "Plant": return "🌿";
    case "Earth": return "⛰️";
    case "Electric": return "⚡";
    case "Water": return "💧";
  }
}

// Get Element Label in Chinese
export function getElementLabel(elem: ElementType): string {
  switch (elem) {
    case "Fire": return "火 (Fire)";
    case "Plant": return "草 (Plant)";
    case "Earth": return "土 (Earth)";
    case "Electric": return "雷 (Electric)";
    case "Water": return "水 (Water)";
  }
}

// Helper for UI CSS colors based on Element
export function getElementColorClass(elem: ElementType): string {
  switch (elem) {
    case "Fire": return "text-orange-400 bg-orange-950/40 border-orange-800/60";
    case "Plant": return "text-emerald-400 bg-emerald-950/40 border-emerald-800/60";
    case "Earth": return "text-amber-500 bg-amber-950/40 border-amber-800/60";
    case "Electric": return "text-cyan-400 bg-cyan-950/40 border-cyan-800/60";
    case "Water": return "text-blue-400 bg-blue-950/40 border-blue-800/60";
  }
}

// Global default shop items templates
export const SHOP_ITEMS: Item[] = [
  {
    id: "potion_hp",
    name: "微型高能治療素",
    description: "高濃度奈米修復劑，能為出戰隊伍的一名隊員回復全體 250 點生命值 (HP)",
    type: "healing",
    effectValue: 250,
    price: 30,
    emoji: "🧪",
    count: 0
  },
  {
    id: "potion_mp",
    name: "微型重核能魔泉",
    description: "離子微粒加速試劑，點燃魔能。能回復一名隊員 100 點法力值 (MP)",
    type: "mana",
    effectValue: 100,
    price: 35,
    emoji: "🌀",
    count: 0
  },
  {
    id: "phoenix_feather",
    name: "鳳凰量子甦生羽",
    description: "載入逆時波形程式，使一名戰死的夥伴原地復活，回復 50% 的生命值",
    type: "revive",
    effectValue: 50, // percents
    price: 150,
    emoji: "🪶",
    count: 0
  },
  {
    id: "potion_hp_large",
    name: "巨型超能治療艙",
    description: "工業級奈米修復凝膠，能為一名隊員一口氣回復 500 點生命值 (HP)",
    type: "healing",
    effectValue: 500,
    price: 70,
    emoji: "💉",
    count: 0
  },
  {
    id: "potion_mp_large",
    name: "巨型重核能魔泉",
    description: "高密度離子魔能濃縮液，能回復一名隊員 250 點法力值 (MP)",
    type: "mana",
    effectValue: 250,
    price: 75,
    emoji: "🔵",
    count: 0
  },
  {
    id: "elixir_full",
    name: "完全甦生靈藥",
    description: "傳說中的完全逆時靈藥，使一名戰死夥伴原地完全復活並回復 100% 生命值",
    type: "revive",
    effectValue: 100, // percents
    price: 300,
    emoji: "🌟",
    count: 0
  },
  {
    id: "tonic_atk",
    name: "狂戰腎上腺激素",
    description: "戰鬥中飲用，使該隊員本場戰鬥的攻擊力 (ATK) 提升 20%（持續至戰鬥結束）",
    type: "buff",
    effectValue: 20, // percent ATK buff for the battle
    price: 60,
    emoji: "🧬",
    count: 0
  }
];

// --- GEAR DROP TEMPLATES (Stage 2) ---
// Rarity scales the rolled bonus. On drop we roll within the range.
export const GEAR_RARITY_LABEL: Record<GearRarity, string> = {
  common: "普通",
  rare: "稀有",
  epic: "史詩",
  legendary: "傳說"
};

export const GEAR_RARITY_COLOR: Record<GearRarity, string> = {
  common: "text-slate-300 bg-slate-900/60 border-slate-700/60",
  rare: "text-sky-300 bg-sky-950/40 border-sky-700/50",
  epic: "text-fuchsia-300 bg-fuchsia-950/40 border-fuchsia-700/50",
  legendary: "text-amber-300 bg-amber-950/40 border-amber-600/50"
};

export const GEAR_TEMPLATES: Record<string, GearTemplate> = {
  // Weapons
  gear_plasma_blade: { id: "gear_plasma_blade", name: "等離子振盪刃", slot: "weapon", rarity: "common", atkBonusRange: [6, 12] },
  gear_ion_lance: { id: "gear_ion_lance", name: "離子穿透長矛", slot: "weapon", rarity: "rare", element: "Electric", atkBonusRange: [16, 26] },
  gear_nova_cannon: { id: "gear_nova_cannon", name: "新星熔核砲", slot: "weapon", rarity: "epic", element: "Fire", atkBonusRange: [30, 48] },
  gear_singularity_edge: { id: "gear_singularity_edge", name: "奇點崩裂之刃", slot: "weapon", rarity: "legendary", element: "Earth", atkBonusRange: [55, 80] },
  // Armor
  gear_alloy_plate: { id: "gear_alloy_plate", name: "合金複合護板", slot: "armor", rarity: "common", defBonusRange: [4, 9], hpBonusRange: [20, 45] },
  gear_aegis_weave: { id: "gear_aegis_weave", name: "神盾編織護甲", slot: "armor", rarity: "rare", element: "Water", defBonusRange: [10, 18], hpBonusRange: [60, 110] },
  gear_void_carapace: { id: "gear_void_carapace", name: "虛空甲殼裝甲", slot: "armor", rarity: "epic", element: "Plant", defBonusRange: [20, 32], hpBonusRange: [140, 230] },
  gear_titan_bulwark: { id: "gear_titan_bulwark", name: "泰坦壁壘聖殼", slot: "armor", rarity: "legendary", element: "Earth", defBonusRange: [38, 58], hpBonusRange: [320, 480] }
};

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// --- Trading post pricing (Stage 3) ---
export const MATERIAL_BASE_PRICE: Record<"common" | "rare" | "epic", number> = {
  common: 20,
  rare: 60,
  epic: 150
};

// Buy = base ×1.5, Sell = base ×0.5
export function materialBuyPrice(rarity: "common" | "rare" | "epic"): number {
  return Math.ceil(MATERIAL_BASE_PRICE[rarity] * 1.5);
}
export function materialSellPrice(rarity: "common" | "rare" | "epic"): number {
  return Math.floor(MATERIAL_BASE_PRICE[rarity] * 0.5);
}

const GEAR_RARITY_BASE_VALUE: Record<GearRarity, number> = {
  common: 30,
  rare: 90,
  epic: 220,
  legendary: 500
};

// Sell value scales with rarity and gear level.
export function gearSellValue(gear: DroppedGear): number {
  return Math.round(GEAR_RARITY_BASE_VALUE[gear.rarity] * (1 + (gear.level - 1) * 0.5));
}
export function gearBuyPrice(rarity: GearRarity): number {
  return Math.round(GEAR_RARITY_BASE_VALUE[rarity] * 1.5);
}

// Roll a concrete DroppedGear instance from a template id.
export function rollDroppedGear(templateId: string): DroppedGear | null {
  const t = GEAR_TEMPLATES[templateId];
  if (!t) return null;
  const uid = `gear_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const atkBonus = t.atkBonusRange ? randInt(t.atkBonusRange[0], t.atkBonusRange[1]) : 0;
  const defBonus = t.defBonusRange ? randInt(t.defBonusRange[0], t.defBonusRange[1]) : 0;
  const hpBonus = t.hpBonusRange ? randInt(t.hpBonusRange[0], t.hpBonusRange[1]) : 0;
  return {
    uid,
    templateId,
    slot: t.slot,
    rarity: t.rarity,
    name: t.name,
    level: 1,
    atkBonus,
    defBonus,
    hpBonus,
    element: t.element
  };
}

// Initial Companion templates for tavern recruitment
export const RECRUITABLE_COMPANIONS: Character[] = [
  {
    id: "wizard_base",
    name: "麗娜·電星 (Lina)",
    className: "Wizard",
    title: "雷爆元素使",
    hp: 220,
    maxHp: 220,
    mp: 120,
    maxMp: 120,
    atk: 45,
    def: 12,
    lv: 1,
    exp: 0,
    maxExp: 100,
    element: "Electric",
    activeSkill: {
      name: "超離子風暴",
      mpCost: 20,
      multiplier: 2.2,
      description: "激發脈衝力場，攻擊單一敵人，附帶極強導電爆炸效果。",
      effect: "damage"
    },
    equipment: {
      weapon: { name: "量子共振手杖", level: 1, bonus: 5 },
      armor: { name: "星光編織護罩", level: 1, bonus: 3 }
    }
  },
  {
    id: "priest_base",
    name: "賽菲雅·潮汐 (Sefia)",
    className: "Priest",
    title: "微光祈唱者",
    hp: 260,
    maxHp: 260,
    mp: 140,
    maxMp: 140,
    atk: 25,
    def: 18,
    lv: 1,
    exp: 0,
    maxExp: 100,
    element: "Water",
    activeSkill: {
      name: "海洋潮汐治癒",
      mpCost: 18,
      multiplier: 1.8, // 1.8x ATK heal to all
      description: "祈引太空中微量水能量，將治癒之水灌注給隊伍裡所有存活夥伴。",
      effect: "heal"
    },
    equipment: {
      weapon: { name: "重力誘導權杖", level: 1, bonus: 3 },
      armor: { name: "海洋離子防護袍", level: 1, bonus: 4 }
    }
  },
  {
    id: "assassin_base",
    name: "加洛·毒刺 (Kael)",
    className: "Assassin",
    title: "暗影刺客",
    hp: 200,
    maxHp: 200,
    mp: 80,
    maxMp: 80,
    atk: 52,
    def: 10,
    lv: 1,
    exp: 0,
    maxExp: 100,
    element: "Plant",
    activeSkill: {
      name: "致命荊棘影襲",
      mpCost: 15,
      multiplier: 2.6,
      description: "以影匿方式繞至敵後突襲爆發，利用荊棘毒素造成絕大傷害。",
      effect: "damage"
    },
    equipment: {
      weapon: { name: "暗物質雙匕首", level: 1, bonus: 6 },
      armor: { name: "折射匿光黑夾克", level: 1, bonus: 2 }
    }
  },
  {
    id: "paladin_base",
    name: "羅蘭·鐵誓 (Roland)",
    className: "Paladin",
    title: "引力聖騎士",
    hp: 340,
    maxHp: 340,
    mp: 70,
    maxMp: 70,
    atk: 32,
    def: 25,
    lv: 1,
    exp: 0,
    maxExp: 100,
    element: "Earth",
    activeSkill: {
      name: "重粒子神聖護壁",
      mpCost: 12,
      multiplier: 1.2,
      description: "釋放土屬性抗阻重力波。使所有夥伴獲得護甲增幅 (回復全體 100 HP，傷害輕微輸出)",
      effect: "shield"
    },
    equipment: {
      weapon: { name: "固化合金重盾槌", level: 1, bonus: 4 },
      armor: { name: "真空高壓重型裝甲", level: 1, bonus: 6 }
    }
  }
];

export const HERO_INITIAL: Character = {
  id: "hero",
  name: "艾倫 (Alan) [玩家]",
  className: "Hero",
  title: "晨曦開拓先鋒",
  hp: 300,
  maxHp: 300,
  mp: 90,
  maxMp: 90,
  atk: 38,
  def: 16,
  lv: 1,
  exp: 0,
  maxExp: 100,
  element: "Fire",
  activeSkill: {
    name: "高溫熱能巨劍斬",
    mpCost: 12,
    multiplier: 1.8,
    description: "以熱能在劍刃凝聚離子高溫，重重斬擊敵人！火剋草！",
    effect: "damage"
  },
  equipment: {
    weapon: { name: "超熱能粒子合金大劍", level: 1, bonus: 5 },
    armor: { name: "深藍開拓者護身甲", level: 1, bonus: 4 }
  }
};

// Monsters by zone. tier weights spawning (normal 70 / elite 25 / boss 5);
// timeAvailability gates by time-of-day; dropTable drives randomized loot.
const ALL_DAY: TimeOfDay[] = ["morning", "noon", "night"];
const NIGHT_ONLY: TimeOfDay[] = ["night"];

export const MONSTER_TEMPLATES: Record<string, MonsterTemplate> = {
  // ===== Zone 1: Grasslands (Plant) =====
  slime_plant: {
    name: "微風草苔黏液怪",
    baseHp: 120, baseAtk: 18, baseDef: 5,
    element: "Plant", rewardExp: 25, rewardGold: 15,
    description: "體內含有微風與葉片汁液的半透明膠狀黏液怪，在微風中蹦跳。",
    emoji: "🦠", tier: "normal", timeAvailability: ALL_DAY,
    dropTable: [
      { kind: "material", id: "stardust_shard", chance: 0.55, min: 1, max: 2 },
      { kind: "item", id: "potion_hp", chance: 0.15, min: 1, max: 1 },
      { kind: "gear", id: "gear_plasma_blade", chance: 0.05, min: 1, max: 1 }
    ]
  },
  thorny_vine: {
    name: "活性雷射尖刺藤蔓",
    baseHp: 185, baseAtk: 24, baseDef: 8,
    element: "Plant", rewardExp: 40, rewardGold: 25,
    description: "具備感應體溫、自衛射擊尖刺的軌道能量藤蔓。",
    emoji: "🌿", tier: "normal", timeAvailability: ALL_DAY,
    dropTable: [
      { kind: "material", id: "stardust_shard", chance: 0.55, min: 1, max: 2 },
      { kind: "item", id: "potion_mp", chance: 0.15, min: 1, max: 1 },
      { kind: "gear", id: "gear_alloy_plate", chance: 0.06, min: 1, max: 1 }
    ]
  },
  vine_strangler: {
    name: "鋼藤纏絞甲蟲",
    baseHp: 300, baseAtk: 30, baseDef: 16,
    element: "Plant", rewardExp: 60, rewardGold: 40,
    description: "披著木質化金屬甲殼的巨型甲蟲，纏繞獵物直至能量榨乾。",
    emoji: "🪲", tier: "elite", timeAvailability: ALL_DAY,
    dropTable: [
      { kind: "material", id: "stardust_shard", chance: 0.6, min: 1, max: 3 },
      { kind: "item", id: "potion_hp", chance: 0.3, min: 1, max: 2 },
      { kind: "gear", id: "gear_plasma_blade", chance: 0.14, min: 1, max: 1 },
      { kind: "gear", id: "gear_alloy_plate", chance: 0.1, min: 1, max: 1 }
    ]
  },
  spore_moth_night: {
    name: "夜光孢子幽蛾",
    baseHp: 260, baseAtk: 34, baseDef: 10,
    element: "Plant", rewardExp: 75, rewardGold: 55,
    description: "只在星區深夜現身的螢光巨蛾，鱗粉散落致幻孢子。",
    emoji: "🦋", tier: "elite", timeAvailability: NIGHT_ONLY,
    dropTable: [
      { kind: "material", id: "stardust_shard", chance: 0.7, min: 2, max: 3 },
      { kind: "item", id: "tonic_atk", chance: 0.2, min: 1, max: 1 },
      { kind: "gear", id: "gear_ion_lance", chance: 0.12, min: 1, max: 1 }
    ]
  },

  // ===== Zone 2: Frozen Cave (Water) =====
  ice_shard: {
    name: "低溫重氫凝水結晶",
    baseHp: 240, baseAtk: 28, baseDef: 12,
    element: "Water", rewardExp: 45, rewardGold: 30,
    description: "飄浮在冰凍洞穴內部的低溫晶體，自體高速旋轉，寒意逼人。",
    emoji: "❄️", tier: "normal", timeAvailability: ALL_DAY,
    dropTable: [
      { kind: "material", id: "heavy_water_crystal", chance: 0.5, min: 1, max: 2 },
      { kind: "material", id: "stardust_shard", chance: 0.25, min: 1, max: 1 },
      { kind: "item", id: "potion_mp", chance: 0.15, min: 1, max: 1 },
      { kind: "gear", id: "gear_alloy_plate", chance: 0.06, min: 1, max: 1 }
    ]
  },
  crawler_crust: {
    name: "極寒深水重力鱟",
    baseHp: 320, baseAtk: 34, baseDef: 22,
    element: "Water", rewardExp: 65, rewardGold: 45,
    description: "硬殼能隔絕恆星輻射的史前重裝甲生物，水屬性吐息極具威脅。",
    emoji: "🦂", tier: "normal", timeAvailability: ALL_DAY,
    dropTable: [
      { kind: "material", id: "heavy_water_crystal", chance: 0.55, min: 1, max: 2 },
      { kind: "item", id: "potion_hp_large", chance: 0.12, min: 1, max: 1 },
      { kind: "gear", id: "gear_aegis_weave", chance: 0.06, min: 1, max: 1 }
    ]
  },
  abyss_finbeast: {
    name: "深寒巨鰭潛獸",
    baseHp: 430, baseAtk: 42, baseDef: 26,
    element: "Water", rewardExp: 90, rewardGold: 60,
    description: "潛伏冰湖底層的龐然巨獸，鰭刃可撕裂裝甲艙壁。",
    emoji: "🐋", tier: "elite", timeAvailability: ALL_DAY,
    dropTable: [
      { kind: "material", id: "heavy_water_crystal", chance: 0.65, min: 1, max: 3 },
      { kind: "item", id: "potion_mp_large", chance: 0.2, min: 1, max: 1 },
      { kind: "gear", id: "gear_aegis_weave", chance: 0.14, min: 1, max: 1 }
    ]
  },
  frost_wisp_night: {
    name: "霜息夜遊水靈",
    baseHp: 360, baseAtk: 48, baseDef: 18,
    element: "Water", rewardExp: 110, rewardGold: 80,
    description: "夜半凝結的寒霜遊魂，呼吸能瞬間凍結金屬。",
    emoji: "🌀", tier: "elite", timeAvailability: NIGHT_ONLY,
    dropTable: [
      { kind: "material", id: "heavy_water_crystal", chance: 0.75, min: 2, max: 3 },
      { kind: "item", id: "elixir_full", chance: 0.08, min: 1, max: 1 },
      { kind: "gear", id: "gear_aegis_weave", chance: 0.16, min: 1, max: 1 }
    ]
  },

  // ===== Zone 3: Volcano (Fire) =====
  magma_crab: {
    name: "過熱高溫熔岩能量蟹",
    baseHp: 400, baseAtk: 45, baseDef: 28,
    element: "Fire", rewardExp: 75, rewardGold: 55,
    description: "棲息在熔岩核心中的重粒子甲殼類生物，渾身燃燒著 1500°C 熱流。",
    emoji: "🦀", tier: "normal", timeAvailability: ALL_DAY,
    dropTable: [
      { kind: "material", id: "plasma_battery", chance: 0.45, min: 1, max: 2 },
      { kind: "material", id: "heavy_water_crystal", chance: 0.2, min: 1, max: 1 },
      { kind: "item", id: "potion_hp_large", chance: 0.15, min: 1, max: 1 },
      { kind: "gear", id: "gear_nova_cannon", chance: 0.05, min: 1, max: 1 }
    ]
  },
  fire_drake: {
    name: "狂暴核裂融核噴噴犬",
    baseHp: 520, baseAtk: 58, baseDef: 25,
    element: "Fire", rewardExp: 100, rewardGold: 80,
    description: "熔岩帶的高危掠食者，喉中燃燒著重核聚變的餘火。",
    emoji: "🐕", tier: "elite", timeAvailability: ALL_DAY,
    dropTable: [
      { kind: "material", id: "plasma_battery", chance: 0.55, min: 1, max: 2 },
      { kind: "item", id: "tonic_atk", chance: 0.2, min: 1, max: 1 },
      { kind: "gear", id: "gear_nova_cannon", chance: 0.12, min: 1, max: 1 }
    ]
  },
  cinder_hound_night: {
    name: "熔燼夜行炎犬",
    baseHp: 560, baseAtk: 70, baseDef: 30,
    element: "Fire", rewardExp: 140, rewardGold: 110,
    description: "夜幕降臨才出沒的灰燼獵犬群，爪痕殘留高溫餘燼。",
    emoji: "🔥", tier: "elite", timeAvailability: NIGHT_ONLY,
    dropTable: [
      { kind: "material", id: "plasma_battery", chance: 0.7, min: 1, max: 3 },
      { kind: "item", id: "tonic_atk", chance: 0.25, min: 1, max: 1 },
      { kind: "gear", id: "gear_nova_cannon", chance: 0.18, min: 1, max: 1 }
    ]
  },
  starcore_devourer_night: {
    name: "【夜域主】熔核噬星魔",
    baseHp: 1400, baseAtk: 95, baseDef: 48,
    element: "Fire", rewardExp: 350, rewardGold: 300,
    description: "只在最深的星夜甦醒的熔核領主，曾吞噬整座恆星熔爐。",
    emoji: "👹", tier: "boss", timeAvailability: NIGHT_ONLY,
    dropTable: [
      { kind: "material", id: "nebula_core", chance: 0.8, min: 1, max: 2 },
      { kind: "material", id: "plasma_battery", chance: 0.9, min: 2, max: 4 },
      { kind: "item", id: "elixir_full", chance: 0.4, min: 1, max: 1 },
      { kind: "gear", id: "gear_nova_cannon", chance: 0.5, min: 1, max: 1 },
      { kind: "gear", id: "gear_void_carapace", chance: 0.3, min: 1, max: 1 }
    ]
  },

  // ===== Zone 4: Power Plant (Electric) =====
  pulse_mine: {
    name: "主動防禦超高壓懸浮雷",
    baseHp: 480, baseAtk: 55, baseDef: 35,
    element: "Electric", rewardExp: 110, rewardGold: 95,
    description: "前文明遺留的自控電子雷暴炸彈，外殼不斷冒出高壓電弧。",
    emoji: "⚙️", tier: "normal", timeAvailability: ALL_DAY,
    dropTable: [
      { kind: "material", id: "plasma_battery", chance: 0.55, min: 1, max: 2 },
      { kind: "material", id: "nebula_core", chance: 0.12, min: 1, max: 1 },
      { kind: "item", id: "potion_mp_large", chance: 0.15, min: 1, max: 1 },
      { kind: "gear", id: "gear_ion_lance", chance: 0.08, min: 1, max: 1 }
    ]
  },
  electro_wraith: {
    name: "星野幽藍雷電死灵",
    baseHp: 650, baseAtk: 72, baseDef: 30,
    element: "Electric", rewardExp: 150, rewardGold: 120,
    description: "因超巨大電站融毀而意志等離子化的遺骸幽魂，掌握致命落雷技能。",
    emoji: "👻", tier: "elite", timeAvailability: ALL_DAY,
    dropTable: [
      { kind: "material", id: "plasma_battery", chance: 0.6, min: 1, max: 3 },
      { kind: "material", id: "nebula_core", chance: 0.18, min: 1, max: 1 },
      { kind: "gear", id: "gear_void_carapace", chance: 0.1, min: 1, max: 1 }
    ]
  },
  silent_storm_night: {
    name: "靜默雷暴遊魂",
    baseHp: 720, baseAtk: 88, baseDef: 34,
    element: "Electric", rewardExp: 190, rewardGold: 150,
    description: "深夜電網裡無聲滑行的雷暴幽影，落雷之前毫無預兆。",
    emoji: "🌩️", tier: "elite", timeAvailability: NIGHT_ONLY,
    dropTable: [
      { kind: "material", id: "nebula_core", chance: 0.3, min: 1, max: 2 },
      { kind: "item", id: "tonic_atk", chance: 0.25, min: 1, max: 1 },
      { kind: "gear", id: "gear_void_carapace", chance: 0.16, min: 1, max: 1 }
    ]
  },
  thunder_collapse_night: {
    name: "【夜域主】雷霆崩潰主宰",
    baseHp: 1700, baseAtk: 118, baseDef: 52,
    element: "Electric", rewardExp: 420, rewardGold: 360,
    description: "電站核心崩潰時誕生的雷霆領主，每次脈動都撼動整片星軌。",
    emoji: "⚡", tier: "boss", timeAvailability: NIGHT_ONLY,
    dropTable: [
      { kind: "material", id: "nebula_core", chance: 0.85, min: 1, max: 3 },
      { kind: "material", id: "plasma_battery", chance: 0.9, min: 2, max: 5 },
      { kind: "item", id: "elixir_full", chance: 0.45, min: 1, max: 1 },
      { kind: "gear", id: "gear_ion_lance", chance: 0.5, min: 1, max: 1 },
      { kind: "gear", id: "gear_void_carapace", chance: 0.35, min: 1, max: 1 }
    ]
  },

  // ===== Zone 5: Gravity Rocks (Earth) =====
  heavy_stone_beast: {
    name: "富含稀土重粒子晶礦石精",
    baseHp: 800, baseAtk: 84, baseDef: 50,
    element: "Earth", rewardExp: 220, rewardGold: 180,
    description: "具有超大密度的磁力浮空岩石巨人。堅硬的岩體可以偏折大部分射線。",
    emoji: "⛰️", tier: "elite", timeAvailability: ALL_DAY,
    dropTable: [
      { kind: "material", id: "nebula_core", chance: 0.5, min: 1, max: 2 },
      { kind: "material", id: "plasma_battery", chance: 0.4, min: 1, max: 2 },
      { kind: "item", id: "potion_hp_large", chance: 0.2, min: 1, max: 2 },
      { kind: "gear", id: "gear_titan_bulwark", chance: 0.06, min: 1, max: 1 }
    ]
  },
  gravity_phantom_night: {
    name: "重力幽影石魅",
    baseHp: 950, baseAtk: 100, baseDef: 46,
    element: "Earth", rewardExp: 260, rewardGold: 210,
    description: "夜色中扭曲重力的岩影精怪，能讓接近者陷入沉重的引力泥沼。",
    emoji: "🌑", tier: "elite", timeAvailability: NIGHT_ONLY,
    dropTable: [
      { kind: "material", id: "nebula_core", chance: 0.6, min: 1, max: 2 },
      { kind: "item", id: "tonic_atk", chance: 0.25, min: 1, max: 1 },
      { kind: "gear", id: "gear_singularity_edge", chance: 0.1, min: 1, max: 1 }
    ]
  },
  gravity_sentinel: {
    name: "【域主】引力崩塌終型巨神兵",
    baseHp: 1200, baseAtk: 110, baseDef: 65,
    element: "Earth", rewardExp: 400, rewardGold: 350,
    description: "控制周遭引力場的終極機械神兵！其巨劍可引發局域空間塌陷。",
    emoji: "🤖", tier: "boss", timeAvailability: ALL_DAY,
    dropTable: [
      { kind: "material", id: "nebula_core", chance: 0.8, min: 1, max: 3 },
      { kind: "item", id: "elixir_full", chance: 0.35, min: 1, max: 1 },
      { kind: "gear", id: "gear_singularity_edge", chance: 0.4, min: 1, max: 1 },
      { kind: "gear", id: "gear_titan_bulwark", chance: 0.3, min: 1, max: 1 }
    ]
  },
  stellar_tomb_colossus_night: {
    name: "【夜域主】星墓終焉巨像",
    baseHp: 2200, baseAtk: 140, baseDef: 78,
    element: "Earth", rewardExp: 600, rewardGold: 520,
    description: "埋葬於星墓的終焉巨像，唯有最深的星夜才會睜開那雙坍縮的眼。",
    emoji: "🗿", tier: "boss", timeAvailability: NIGHT_ONLY,
    dropTable: [
      { kind: "material", id: "nebula_core", chance: 0.95, min: 2, max: 4 },
      { kind: "item", id: "elixir_full", chance: 0.5, min: 1, max: 2 },
      { kind: "gear", id: "gear_singularity_edge", chance: 0.6, min: 1, max: 1 },
      { kind: "gear", id: "gear_titan_bulwark", chance: 0.45, min: 1, max: 1 }
    ]
  }
};

export const ZONES: Zone[] = [
  {
    id: "zone_1",
    name: "風草神殿祕境 (Plant 🌿)",
    description: "被厚厚的太空地衣與帶電草葉覆蓋的遺跡。適合新手拓荒。",
    minLevel: 1,
    element: "Plant",
    monsters: ["slime_plant", "thorny_vine", "vine_strangler", "spore_moth_night"],
    iconName: "Trees",
    bgGradient: "from-emerald-950/80 to-slate-950",
    colorHex: "emerald-400"
  },
  {
    id: "zone_2",
    name: "星夜冰封洞穴 (Water 💧)",
    description: "深藏地底的高能冰晶洞。洞內水汽皆由重水凝結，極度寒冷。",
    minLevel: 2,
    element: "Water",
    monsters: ["ice_shard", "crawler_crust", "abyss_finbeast", "frost_wisp_night"],
    iconName: "CloudSnow",
    bgGradient: "from-blue-950/80 to-slate-950",
    colorHex: "blue-400"
  },
  {
    id: "zone_3",
    name: "熔岩熱能之核 (Fire 🔥)",
    description: "地表裂開的巨大岩漿帶。熱浪滾滾，蘊生著狂暴至極的核能魔物。",
    minLevel: 4,
    element: "Fire",
    monsters: ["magma_crab", "fire_drake", "cinder_hound_night", "starcore_devourer_night"],
    iconName: "Flame",
    bgGradient: "from-orange-950/80 to-slate-950",
    colorHex: "orange-400"
  },
  {
    id: "zone_4",
    name: "雷爆廢棄電網 (Electric ⚡)",
    description: "前文明的大型星軌供電信標遺跡。電網失控，雷獸環伺。",
    minLevel: 6,
    element: "Electric",
    monsters: ["pulse_mine", "electro_wraith", "silent_storm_night", "thunder_collapse_night"],
    iconName: "Zap",
    bgGradient: "from-cyan-950/80 to-slate-950",
    colorHex: "cyan-400"
  },
  {
    id: "zone_5",
    name: "失落引力岩洲 (Earth ⛰️)",
    description: "磁力異常扭曲的重岩浮島群。終型神兵巨獸在此沉眠，實力恐怖。",
    minLevel: 8,
    element: "Earth",
    monsters: ["heavy_stone_beast", "gravity_phantom_night", "gravity_sentinel", "stellar_tomb_colossus_night"],
    iconName: "Mountain",
    bgGradient: "from-amber-950/80 to-slate-950",
    colorHex: "amber-400"
  }
];

// --- MATERIALS TEMPLATES ---
export const MATERIALS: Record<string, { name: string; description: string; emoji: string; rarity: "common" | "rare" | "epic" }> = {
  stardust_shard: {
    name: "星塵發光碎片",
    description: "風草神殿與低溫洞穴內散落的宇宙塵埃結晶，蘊含基礎時空微能。",
    emoji: "✨",
    rarity: "common"
  },
  heavy_water_crystal: {
    name: "超導重水結晶",
    description: "低溫重氣體凝聚的水成結晶體，低溫蓄冷性極佳，是調研合成必備配料。",
    emoji: "💎",
    rarity: "common"
  },
  plasma_battery: {
    name: "等離子聚能電池",
    description: "帶有脈衝能量的電能核心元件，主要掉落於熔岩带與廢棄電網。",
    emoji: "🔋",
    rarity: "rare"
  },
  nebula_core: {
    name: "星雲熔熱核心",
    description: "極其珍稀的重粒子聚合能量精粹，一般寄存在巨型神兵或極炎融核獸體內。",
    emoji: "🔮",
    rarity: "epic"
  }
};

// --- ARTIFACTS TEMPLATES ---
export const ARTIFACTS: Record<string, Artifact> = {
  artifact_gravity: {
    id: "artifact_gravity",
    name: "超引力重粒子徽章",
    description: "操控引力偏振係數。將引力分子分佈在血肉鋼鐵上，從而大幅提升小隊強度性能。",
    emoji: "🎖️",
    effectText: "🌌 小隊全員最大生命值上限（MAX HP）永久提升 15%",
    recipe: {
      gold: 150,
      materials: { stardust_shard: 2, heavy_water_crystal: 2 }
    }
  },
  artifact_booster: {
    id: "artifact_booster",
    name: "星河離子熱核推進器",
    description: "搭載小隊微推進陣列，大幅強化近戰揮砍與異能詠唱的爆發動能。",
    emoji: "🚀",
    effectText: "⚔️ 小隊全員基礎物理/異能攻擊力（ATK）永久提升 15%",
    recipe: {
      gold: 200,
      materials: { plasma_battery: 2, nebula_core: 2 }
    }
  },
  artifact_attractor: {
    id: "artifact_attractor",
    name: "超維度重力引金磁針",
    description: "逆轉量子微振幅，干擾宇宙虛無中的信用金卷波形，在取得勝利後抓取更多殘留金券。",
    emoji: "🧭",
    effectText: "🪙 冒險刷本戰鬥勝利後，結算的 Credits 獎勵提升 25%",
    recipe: {
      gold: 120,
      materials: { stardust_shard: 3, plasma_battery: 1 }
    }
  },
  artifact_phoenix_lens: {
    id: "artifact_phoenix_lens",
    name: "量子複活偏振透鏡",
    description: "常駐型逆時程式安全鎖，一旦偵測到隊友死機，將激活機率返航復原波。",
    emoji: "🔘",
    effectText: "🩹 戰鬥中當隊員不幸死機（0 HP）時，有 15% 機率自動觸發極限重啟（以 25% HP 復甦）",
    recipe: {
      gold: 250,
      materials: { heavy_water_crystal: 2, nebula_core: 2 }
    }
  }
};

// --- ACHIEVEMENTS TEMPLATES ---
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "ach_monsters",
    title: "🎖️ 極境除害大師",
    description: "在群群星野外狩獵中，累積消滅 10 隻深空威脅魔物。",
    targetType: "slay",
    targetValue: 10,
    rewardGold: 150,
    rewardText: "獎勵 150 Credits 金券"
  },
  {
    id: "ach_gold",
    title: "🎖️ 星空億萬富豪",
    description: "小隊獲得的累計 Credits 信用點數突破 1000 點里程碑。",
    targetType: "gold_total",
    targetValue: 1000,
    rewardGold: 200,
    rewardText: "獎勵 200 Credits 金券 + 「星區淘金先鋒」稱號"
  },
  {
    id: "ach_gear",
    title: "🎖️ 極化匠心科技",
    description: "小隊將任何武裝武器或防具提升到 Lv.5 甚至更高等級（解鎖極化極限）。",
    targetType: "upgrade_max",
    targetValue: 5,
    rewardGold: 250,
    rewardText: "獎勵 250 Credits 金券 + 「神兵鍛造大師」稱號"
  },
  {
    id: "ach_awake",
    title: "🎖️ 超限覺醒者",
    description: "完成 2 次角色高階職涯轉職覺醒（將其淬鍊為高階稱號形態）。",
    targetType: "awake_count",
    targetValue: 2,
    rewardGold: 300,
    rewardText: "獎勵 300 Credits 金券"
  }
];

// --- SPACE RANDOM EVENTS TEMPLATES ---
export const RANDOM_EVENTS: SpaceEvent[] = [
  {
    id: "event_shipwreck",
    title: "🚨 遺留的星際貨船骸骨",
    description: "一艘嚴重遭微隕石損毀的無人量子貨運艦正在太空中飄浮，其感應反應爐仍在微幅放電。通訊天線已撕裂，探測雷達偵測到強烈的艙內物資磁信号。",
    illustration: "🛸",
    choices: [
      {
        text: "嘗試強制破解防火牆 (Hacking)",
        actionId: "hack_ship",
        description: "50% 概率解析成功獲得大量金幣，50% 概率觸發靜電防衛陷阱（全員扣除 20 HP）"
      },
      {
        text: "粗暴拆卸防溢集裝箱 (Scrap Outer Cladding)",
        actionId: "scrap_ship",
        description: "穩定拆解，獲取 2-3 個隨機宇宙合成材料（不需承擔陷阱風險）"
      },
      {
        text: "略過此處，繼續規避航行",
        actionId: "ignore",
        description: "不承擔任何代價與收益"
      }
    ]
  },
  {
    id: "event_crystal_monolith",
    title: "💎 異星高能水晶碑體",
    description: "在折射的群星光華下，一尊閃耀著低溫晶體波的幾何方碑在星野間默默旋轉，表面正流動著未知智慧文明雕刻的能量符文，使隊員的武器核心產生共鳴！",
    illustration: "🔮",
    choices: [
      {
        text: "將現有武器貼合方碑注入晶能",
        actionId: "monolith_infuse",
        description: "小隊一名隊員隨機武裝，免費獲得 +1 武器強化等級 (不需要金幣)！"
      },
      {
        text: "小心鑿取外飾碎屑水晶",
        actionId: "monolith_mine",
        description: "必得 2 個 [超導重水結晶] 與 2 個 [星塵發光碎片]"
      },
      {
        text: "默默地致敬並退後",
        actionId: "ignore",
        description: "安然退避，保持內心敬畏"
      }
    ]
  },
  {
    id: "event_rogue_merchant",
    title: "🧑‍🚀 流浪星區的走私行商",
    description: "一個穿著加壓防護重甲的太空商人在小型梭船上向你們發送通訊波。他狡黠地眨著眼睛：「喔唷！開拓者們！來點被黑市回收的軍規超限裝備不？保證正品！」",
    illustration: "🎪",
    choices: [
      {
        text: "低價兜售背包中的舊材料與垃圾",
        actionId: "merchant_sell",
        description: "對方極其大方，用 120 回收金券買斷你的多餘重元素"
      },
      {
        text: "以 80 Credits 購買黑市量子羽毛",
        actionId: "merchant_buy_feather",
        description: "用近乎半價的優惠強行購入 [鳳凰量子甦生羽 x1] (原價 150 金幣)"
      },
      {
        text: "禮貌謝絕，終止通訊連接",
        actionId: "ignore",
        description: "禮貌告別，繼續開航"
      }
    ]
  },
  {
    id: "event_stellar_storm",
    title: "☀️ 重粒子恆星磁暴超載",
    description: "警告！周邊雙星系統突發磁極大偏轉，高能太陽風席捲太空！炫暴的粉色粒子射線正在瘋狂衝擊隊友的核心護盾。危急时刻，你的雷達正發出電離警告！",
    illustration: "⚡",
    choices: [
      {
        text: "展開過載防禦護罩抵擋",
        actionId: "storm_shield",
        description: "小隊成員在消耗戰備核心後完美阻隔，全體扣除 20% 當前 HP，但全隊獲得 100 點 EXP 作為科研數據補償！"
      },
      {
        text: "引導高聚能等離子超溫吸收",
        actionId: "storm_absorb",
        description: "富貴險中求！全隊成員法力儲值（MP）直接補滿，但會隨機使一名隊友因高燒短暫休眠 (受到 45 點傷害)"
      }
    ]
  }
];

// ===== Stage 4: Story — Main quest line, side & daily pools, chapter gating =====

// Main quest line: a chapter chain uncovering why the前文明 "崩塌", each unlocking the next.
export const MAIN_QUESTS: Quest[] = [
  {
    id: "mq_ch1", kind: "main", chapter: 1,
    title: "【主線 Ch.1】甦醒的開拓信標",
    description: "前往「風草神殿祕境」掃蕩 5 隻魔物，喚醒沉睡的前哨站信標，接收第一道殘缺的崩塌訊息。",
    targetType: "slay", targetValue: 5, currentValue: 0, rewardGold: 120, rewardExp: 150, status: "active",
    isUnlocked: true,
    storyBefore: "信標自崩塌之夜便沉默至今。雷達捕捉到風草神殿深處有微弱的求救波形……",
    storyAfter: "信標重啟，吐出一段加密日誌：『Demeter-9 播種引擎失控，是崩塌的起點之一。』線索指向冰封深淵。"
  },
  {
    id: "mq_ch2", kind: "main", chapter: 2, prerequisiteQuestId: "mq_ch1",
    title: "【主線 Ch.2】重水深淵的低語",
    description: "深入「星夜冰封洞穴」，採集 3 枚超導重水結晶，重建 Aegir 聯合體的冷卻數據。",
    targetType: "collect", targetMaterialId: "heavy_water_crystal", targetValue: 3, currentValue: 0,
    rewardGold: 180, rewardExp: 220, status: "active", isUnlocked: false,
    storyBefore: "Aegir 重工業聯合體的冷卻基地在崩塌中急凍封存，唯有重水結晶能解讀其最後的運算。",
    storyAfter: "結晶重組出一句警告：『熱核裂變爐將再臨界。』熔岩之核正在甦醒。"
  },
  {
    id: "mq_ch3", kind: "main", chapter: 3, prerequisiteQuestId: "mq_ch2",
    title: "【主線 Ch.3】沸騰核心的試煉",
    description: "在「熔岩熱能之核」討伐 3 隻過熱熔岩能量蟹，為失控的裂變爐降溫。",
    targetType: "slay_specific", targetMonsterId: "magma_crab", targetValue: 3, currentValue: 0,
    rewardGold: 240, rewardExp: 300, status: "active", isUnlocked: false,
    storyBefore: "爐芯燃燒百年不滅，熔岩生物吸收其能量再生。必須先肅清牠們才能接近核心。",
    storyAfter: "爐溫漸降，控制台浮現坐標——指向廢棄電網中樞的雷霆遺骸。"
  },
  {
    id: "mq_ch4", kind: "main", chapter: 4, prerequisiteQuestId: "mq_ch3",
    title: "【主線 Ch.4】雷網中的亡魂",
    description: "於「雷爆廢棄電網」殲滅 3 隻星野幽藍雷電死靈，奪回失控電站的主控權。",
    targetType: "slay_specific", targetMonsterId: "electro_wraith", targetValue: 3, currentValue: 0,
    rewardGold: 320, rewardExp: 400, status: "active", isUnlocked: false,
    storyBefore: "電站融毀後，工程師的意志等離子化為幽魂，死守著崩塌真相的最後一塊拼圖。",
    storyAfter: "幽魂消散前留下殘響：『鑰匙，在引力岩洲的奇點之中。』"
  },
  {
    id: "mq_ch5", kind: "main", chapter: 5, prerequisiteQuestId: "mq_ch4",
    title: "【主線 Ch.5】奇點的鑰匙",
    description: "在「失落引力岩洲」收集 3 枚星雲熔熱核心，組裝開啟奇點封印的鑰匙。",
    targetType: "collect", targetMaterialId: "nebula_core", targetValue: 3, currentValue: 0,
    rewardGold: 420, rewardExp: 520, status: "active", isUnlocked: false,
    storyBefore: "星雲核心是平衡這片星軌的能量錨，集齊三枚方能撬動沉睡的終型神兵。",
    storyAfter: "鑰匙成形，封印鬆動——終型巨神兵睜開了那雙古老的雙眼。"
  },
  {
    id: "mq_ch6", kind: "main", chapter: 6, prerequisiteQuestId: "mq_ch5",
    title: "【主線 Ch.6】引力崩塌終型巨神兵",
    description: "擊敗「失落引力岩洲」的域主——引力崩塌終型巨神兵，終結這場跨越世代的崩塌。",
    targetType: "slay_specific", targetMonsterId: "gravity_sentinel", targetValue: 1, currentValue: 0,
    rewardGold: 600, rewardExp: 800, status: "active", isUnlocked: false,
    storyBefore: "它將一切外來信號視為入侵。要終結崩塌，必先擊碎這台失控的平衡錨。",
    storyAfter: "巨神兵停止運轉，但崩塌的真正主謀仍潛伏於最深的星夜……"
  },
  {
    id: "mq_ch7", kind: "main", chapter: 7, prerequisiteQuestId: "mq_ch6",
    title: "【主線 終章】星墓終焉",
    description: "在最深的星夜，於「失落引力岩洲」討伐夜域主——星墓終焉巨像，揭開崩塌的最終真相。",
    targetType: "slay_specific", targetMonsterId: "stellar_tomb_colossus_night", targetValue: 1, currentValue: 0,
    rewardGold: 1000, rewardExp: 1500, status: "active", isUnlocked: false,
    storyBefore: "唯有星夜，巨像才會甦醒。它埋葬著前文明的全部記憶與罪責。",
    storyAfter: "巨像崩解的剎那，星空重新流轉。開拓者終於明白：崩塌並非終點，而是新紀元的序章。🌌"
  }
];

// Side quests: unlocked by reaching a chapter; varied target types incl collect / slay-specific.
export const SIDE_QUEST_POOL: Quest[] = [
  {
    id: "sq_upgrade_gears", kind: "side", chapter: 1,
    title: "【支線】工欲善其事",
    description: "在鐵匠鋪對武器或防具累計成功強化 5 次。",
    targetType: "upgrade", targetValue: 5, currentValue: 0, rewardGold: 140, rewardExp: 120, status: "active"
  },
  {
    id: "sq_gold_rush", kind: "side", chapter: 1,
    title: "【支線】淘金計畫",
    description: "累積獲得 500 金幣，厚實的錢包是冷酷星空中最溫暖的靠山。",
    targetType: "gold", targetValue: 500, currentValue: 0, rewardGold: 200, rewardExp: 150, status: "active"
  },
  {
    id: "sq_collect_plasma", kind: "side", chapter: 3,
    title: "【支線】等離子囤積商",
    description: "收集 5 枚等離子聚能電池，黑市行商開出了好價錢。",
    targetType: "collect", targetMaterialId: "plasma_battery", targetValue: 5, currentValue: 0,
    rewardGold: 260, rewardExp: 200, status: "active"
  },
  {
    id: "sq_slay_drake", kind: "side", chapter: 3,
    title: "【支線】獵犬剋星",
    description: "討伐 3 隻狂暴核裂融核噴噴犬，清掃熔岩帶的高危掠食者。",
    targetType: "slay_specific", targetMonsterId: "fire_drake", targetValue: 3, currentValue: 0,
    rewardGold: 300, rewardExp: 260, status: "active"
  },
  {
    id: "sq_reach_exp", kind: "side", chapter: 4,
    title: "【支線】千錘百鍊",
    description: "累計贏得 1200 點戰鬥經驗值 (EXP)，磨礪隊伍的戰術適應性。",
    targetType: "experience", targetValue: 1200, currentValue: 0, rewardGold: 350, rewardExp: 300, status: "active"
  }
];

// Daily pool: small slay/collect tasks; 2-3 refresh per in-game day with progress reset.
export const DAILY_QUEST_POOL: Quest[] = [
  {
    id: "dq_slay", kind: "daily",
    title: "【每日】例行清剿",
    description: "今日討伐任意 4 隻深空魔物。",
    targetType: "slay", targetValue: 4, currentValue: 0, rewardGold: 90, rewardExp: 80, status: "active"
  },
  {
    id: "dq_collect_stardust", kind: "daily",
    title: "【每日】星塵收集",
    description: "今日收集 2 枚星塵發光碎片。",
    targetType: "collect", targetMaterialId: "stardust_shard", targetValue: 2, currentValue: 0,
    rewardGold: 80, rewardExp: 70, status: "active"
  },
  {
    id: "dq_gold", kind: "daily",
    title: "【每日】小額創收",
    description: "今日累積獲得 150 金幣。",
    targetType: "gold", targetValue: 150, currentValue: 0, rewardGold: 110, rewardExp: 60, status: "active"
  },
  {
    id: "dq_exp", kind: "daily",
    title: "【每日】實戰訓練",
    description: "今日累積獲得 200 點戰鬥經驗值 (EXP)。",
    targetType: "experience", targetValue: 200, currentValue: 0, rewardGold: 100, rewardExp: 90, status: "active"
  }
];

// Decide which quests are unlocked given main-line progress.
export function unlockEligibleQuests(list: Quest[], currentChapter: number, completedIds: string[]): Quest[] {
  return list.map((q) => {
    if (q.status === "completed") return q;
    let unlocked = true;
    if (q.kind === "main") {
      unlocked = !q.prerequisiteQuestId || completedIds.includes(q.prerequisiteQuestId);
    } else if (q.kind === "side") {
      unlocked = currentChapter >= (q.chapter ?? 1);
    }
    return { ...q, isUnlocked: unlocked };
  });
}

// Pick fresh daily quest instances for a given day (progress reset, unique per-day id suffix).
export function refreshDailyQuests(day: number, count = 3): Quest[] {
  const shuffled = [...DAILY_QUEST_POOL].sort(() => Math.random() - 0.5).slice(0, count);
  return shuffled.map((q) => ({ ...q, id: `${q.id}_d${day}`, currentValue: 0, status: "active" as const, isUnlocked: true }));
}

// Build the starting quest set: all main + side (gated to ch.1) + today's dailies.
export function buildInitialQuests(day: number): Quest[] {
  const base = unlockEligibleQuests([...MAIN_QUESTS, ...SIDE_QUEST_POOL], 1, []);
  return [...base, ...refreshDailyQuests(day)];
}

// Backward-compat export (old code imported INITIAL_QUESTS).
export const INITIAL_QUESTS: Quest[] = buildInitialQuests(1);
