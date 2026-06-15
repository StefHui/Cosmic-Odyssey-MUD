import { Character, MonsterTemplate, Zone, Quest, Item, ElementType, Material, Artifact, Achievement, SpaceEvent, TimeOfDay } from "./types";

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
  }
];

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

// Monsters by zone
export const MONSTER_TEMPLATES: Record<string, MonsterTemplate> = {
  // Zone 1: Grasslands
  slime_plant: {
    name: "微風草苔黏液怪",
    baseHp: 120,
    baseAtk: 18,
    baseDef: 5,
    element: "Plant",
    rewardExp: 25,
    rewardGold: 15,
    description: "體內含有微風與葉片汁液的半透明膠狀黏液怪，在微風中蹦跳。",
    emoji: "🦠"
  },
  thorny_vine: {
    name: "活性雷射尖刺藤蔓",
    baseHp: 185,
    baseAtk: 24,
    baseDef: 8,
    element: "Plant",
    rewardExp: 40,
    rewardGold: 25,
    description: "具備感應體溫、自衛射擊尖刺的軌道能量藤蔓。",
    emoji: "🌿"
  },
  // Zone 2: Frozen Cave
  ice_shard: {
    name: "低溫重氫凝水結晶",
    baseHp: 240,
    baseAtk: 28,
    baseDef: 12,
    element: "Water",
    rewardExp: 45,
    rewardGold: 30,
    description: "飄浮在冰凍洞穴內部的低溫晶體，自體高速旋轉，寒意逼人。",
    emoji: "❄️"
  },
  crawler_crust: {
    name: "極寒深水重力鱟",
    baseHp: 320,
    baseAtk: 34,
    baseDef: 22,
    element: "Water",
    rewardExp: 65,
    rewardGold: 45,
    description: "硬殼能隔絕恆星輻射的史前重裝甲生物，水屬性吐息極具威脅。",
    emoji: "🦂"
  },
  // Zone 3: Volcano
  magma_crab: {
    name: "過熱高溫熔岩能量蟹",
    baseHp: 400,
    baseAtk: 45,
    baseDef: 28,
    element: "Fire",
    rewardExp: 75,
    rewardGold: 55,
    description: "棲息在熔岩核心中的重粒子甲殼類生物，渾身燃燒著 1500°C 熱流。",
    emoji: "🦀"
  },
  fire_drake: {
    name: "狂暴核裂融核噴噴犬",
    baseHp: 520,
    baseAtk: 58,
    baseDef: 25,
    element: "Fire",
    rewardExp: 100,
    rewardGold: 80,
    description: "熔岩帶的高危掠食者，喉中燃燒著重核聚變的餘火。",
    emoji: "🐕"
  },
  // Zone 4: Power Plant
  pulse_mine: {
    name: "主動防禦超高壓懸浮雷",
    baseHp: 480,
    baseAtk: 55,
    baseDef: 35,
    element: "Electric",
    rewardExp: 110,
    rewardGold: 95,
    description: "前文明遺留的自控電子雷暴炸彈，外殼不斷冒出高壓電弧。",
    emoji: "⚙️"
  },
  electro_wraith: {
    name: "星野幽藍雷電死灵",
    baseHp: 650,
    baseAtk: 72,
    baseDef: 30,
    element: "Electric",
    rewardExp: 150,
    rewardGold: 120,
    description: "因超巨大電站融毀而意志等離子化的遺骸幽魂，掌握致命落雷技能。",
    emoji: "👻"
  },
  // Zone 5: Gravity Rocks
  heavy_stone_beast: {
    name: "富含稀土重粒子晶礦石精",
    baseHp: 800,
    baseAtk: 84,
    baseDef: 50,
    element: "Earth",
    rewardExp: 220,
    rewardGold: 180,
    description: "具有超大密度的磁力浮空岩石巨人。堅硬的岩體可以偏折大部分射線。",
    emoji: "⛰️"
  },
  gravity_sentinel: {
    name: "【域主】引力崩塌終型巨神兵",
    baseHp: 1200,
    baseAtk: 110,
    baseDef: 65,
    element: "Earth",
    rewardExp: 400,
    rewardGold: 350,
    description: "控制周遭引力場的終極機械神兵！其巨劍可引發局域空間塌陷。",
    emoji: "🤖"
  }
};

export const ZONES: Zone[] = [
  {
    id: "zone_1",
    name: "風草神殿祕境 (Plant 🌿)",
    description: "被厚厚的太空地衣與帶電草葉覆蓋的遺跡。適合新手拓荒。",
    minLevel: 1,
    element: "Plant",
    monsters: ["slime_plant", "thorny_vine"],
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
    monsters: ["ice_shard", "crawler_crust"],
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
    monsters: ["magma_crab", "fire_drake"],
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
    monsters: ["pulse_mine", "electro_wraith"],
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
    monsters: ["heavy_stone_beast", "gravity_sentinel"],
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

export const INITIAL_QUESTS: Quest[] = [
  {
    id: "quest_slay_slimes",
    title: "風草地皮清掃專案",
    description: "前往「風草神殿祕境」消滅黏液怪 5 隻，清除覆蓋在前哨站艙門的太空雜草菌體。",
    targetType: "slay",
    targetValue: 5,
    currentValue: 0,
    rewardGold: 100,
    rewardExp: 100,
    status: "active"
  },
  {
    id: "quest_upgrade_gears",
    title: "工欲善其事",
    description: "科技是第一生產力！在旺角鐵匠鋪對任何出戰隊伍的「武器」或「防具」進行累計 5 次強化升級。",
    targetType: "upgrade",
    targetValue: 5,
    currentValue: 0,
    rewardGold: 140,
    rewardExp: 120,
    status: "active"
  },
  {
    id: "quest_gold_rush",
    title: "淘金計畫",
    description: "累積獲得 500 金幣。在這個冷酷的星空中，厚實的錢包將是你最溫暖的靠山。",
    targetType: "gold",
    targetValue: 500,
    currentValue: 0,
    rewardGold: 200,
    rewardExp: 150,
    status: "active"
  },
  {
    id: "quest_reach_exp",
    title: "實化跃升：千錘百鍊",
    description: "累計在群星冒險中，贏得 600 點戰鬥經驗值 (EXP) 以證明隊伍的戰術適應性。",
    targetType: "experience",
    targetValue: 600,
    currentValue: 0,
    rewardGold: 250,
    rewardExp: 200,
    status: "active"
  }
];
