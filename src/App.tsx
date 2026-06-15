import React, { useState, useEffect, useRef } from "react";
import {
  Flame,
  Trees,
  CloudSnow,
  Zap,
  Mountain,
  Shield,
  Sword,
  Coins,
  UserPlus,
  Hammer,
  Compass,
  Scroll,
  FileText,
  ShoppingBag,
  Heart,
  Sparkles,
  ChevronRight,
  ArrowRight,
  RotateCcw,
  Play,
  CheckCircle2,
  AlertTriangle,
  Trophy,
  Users,
  Coffee,
  HelpCircle,
  Eye,
  Activity,
  Award,
  BookOpen,
  Bot,
  Crown
} from "lucide-react";

import {
  ElementType,
  Skill,
  Equipment,
  EquipmentSet,
  Character,
  MonsterTemplate,
  Monster,
  Quest,
  Zone,
  Item,
  BattleLog,
  GameSave,
  Material,
  Artifact,
  SpaceEvent,
  Achievement
} from "./types";

import {
  getElementRelation,
  getElementEmoji,
  getElementLabel,
  getElementColorClass,
  SHOP_ITEMS,
  RECRUITABLE_COMPANIONS,
  HERO_INITIAL,
  MONSTER_TEMPLATES,
  ZONES,
  INITIAL_QUESTS,
  MATERIALS,
  ARTIFACTS,
  ACHIEVEMENTS,
  RANDOM_EVENTS
} from "./data";

import ElementChart from "./components/ElementChart";

interface LoreRecord {
  id: string;
  title: string;
  codename: string;
  unlockedAtLv: number;
  rewardText: string;
  description: string;
  secretReveal: string;
  getReward: (
    setGold: React.Dispatch<React.SetStateAction<number>>,
    setMaterials: React.Dispatch<React.SetStateAction<Record<string, number>>>
  ) => void;
}

const LORE_RECORDS: LoreRecord[] = [
  {
    id: "lore_wind_temple",
    title: "【星野軌跡：風草神殿之謎】",
    codename: "SIGNAL-TR-019",
    unlockedAtLv: 1,
    rewardText: "星塵碎片 x3 & 100 能量金券",
    description: "風草地衣與異形黏液怪原本非原生星區生物，而是前文明生態播種引擎「Demeter-9」在大崩塌前的試驗殘存物。這些植株與孢子感應過往船隻的熱量波動與重力，進化出了高頻自衛射擊尖刺藤蔓。它們形成的生長晶能，在屬性循環中呈現完美的草屬性特徵，被高溫離子熱能（Fire）天然剋制。",
    secretReveal: "💡 戰術揭秘：使用「火 (Fire)」（如艾倫的超熱能離子大劍斬）攻擊「草 (Plant)」屬性魔物，可爆發 1.5 倍臨界暴擊傷害！",
    getReward: (setGold, setMaterials) => {
      setGold(g => g + 100);
      setMaterials(m => ({ ...m, stardust_shard: (m.stardust_shard || 0) + 3 }));
    }
  },
  {
    id: "lore_frost_cave",
    title: "【超導超臨界：重水深淵】",
    codename: "SIGNAL-TR-042",
    unlockedAtLv: 2,
    rewardText: "超導重水結晶 x2 & 150 能量金券",
    description: "星夜冰封洞穴曾是前星際文明「Aegir」重工業聯合體的量子冷卻基地。在恆星重核聚變失衡爆發後，急速冷卻的冷阱使得重氫與重水汽瞬間凝結成硬度超越鈦合金的超導重水。深水鱟吞噬了這些超導重水微粒，外殼發生量子畸變，對常規高熱不著痕跡，唯有對離子強電（Electric）毫受抵抗力。",
    secretReveal: "💡 戰術揭秘：冰洞的水屬性魔物最畏懼「電 (Electric)」能量。派遣雷爆巫師麗娜（Lina）釋放「超離子風暴」可造成毀滅性雙倍打擊！",
    getReward: (setGold, setMaterials) => {
      setGold(g => g + 150);
      setMaterials(m => ({ ...m, heavy_water_crystal: (m.heavy_water_crystal || 0) + 2 }));
    }
  },
  {
    id: "lore_volcano_core",
    title: "【重核裂變：沸騰熔岩】",
    codename: "SIGNAL-TR-108",
    unlockedAtLv: 4,
    rewardText: "等離子聚能電池 x2 & 200 能量金券",
    description: "熔岩熱能之核並非天然火山，而是前哨航站墜毀的核聚變熱核裂變爐。爐芯燃燒百年不滅，高能矽酸鹽和熔化的超導離子形成了流動熔岩。高危熱熔岩蟹體背高溫極化核心，在極炎中反而獲取源源不斷的聚變再生盾。唯有使用低溫重水或冰霜能量（Water）才能讓其分子結構硬化皸裂。",
    secretReveal: "💡 戰術揭秘：火屬性魔物擁有瘋狂的爆發性破壞力，但遇到「水 (Water)」屬性的潮汐治癒或水之防護時會遭到 0.75x 傷害削弱，且水屬性能造成極限高傷！",
    getReward: (setGold, setMaterials) => {
      setGold(g => g + 200);
      setMaterials(m => ({ ...m, plasma_battery: (m.plasma_battery || 0) + 2 }));
    }
  },
  {
    id: "lore_gravity_collapse",
    title: "【主宰黃昏：終型巨神兵】",
    codename: "SIGNAL-TR-843",
    unlockedAtLv: 6,
    rewardText: "星雲熔熱核心 x1 & 300 能量金券",
    description: "失落引力岩洲的碎石懸浮機制源自「引力崩塌終型巨神兵」體內的主動重粒子奇點。此奇點是古文明用來固定這片重星軌道的平衡錨。由於控制程序混亂，巨神兵將一切外來信號視為入侵威脅。其磁場密度極大、堅如鐵石（Earth），然而生命藤蔓與孢子根系（Plant）的有機纖維能透過其磁隙深入其核心回路，造成瓦解。",
    secretReveal: "💡 戰術揭秘：土（Earth）屬性魔物擁有極高的防禦係數。在小隊中安排「草 (Plant)」屬性隊友（如加洛 Kael）釋放致命荊棘，能穿透其厚重鐵甲！",
    getReward: (setGold, setMaterials) => {
      setGold(g => g + 300);
      setMaterials(m => ({ ...m, nebula_core: (m.nebula_core || 0) + 1 }));
    }
  }
];

export default function App() {
  // --- Game Core States ---
  const [gold, setGold] = useState<number>(150);
  const [daysPassed, setDaysPassed] = useState<number>(1);
  const [party, setParty] = useState<Character[]>([HERO_INITIAL]);
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  const [items, setItems] = useState<Item[]>(SHOP_ITEMS);
  const [activeZoneId, setActiveZoneId] = useState<string>("zone_1");
  const [statistics, setStatistics] = useState({
    totalGoldGained: 150,
    totalMonstersSlain: 0,
    totalUpgradesDone: 0
  });

  // --- 🌟 New Game Core States for Proposed 4 Features ---
  const [materials, setMaterials] = useState<Record<string, number>>({
    stardust_shard: 0,
    heavy_water_crystal: 0,
    plasma_battery: 0,
    nebula_core: 0
  });
  const [craftedArtifactIds, setCraftedArtifactIds] = useState<string[]>([]);
  const [claimedAchievementIds, setClaimedAchievementIds] = useState<string[]>([]);
  const [activeSpaceEvent, setActiveSpaceEvent] = useState<SpaceEvent | null>(null);

  // --- UI/UX Navigation ---
  const [activeTab, setActiveTab] = useState<"explore" | "tavern" | "blacksmith" | "quests">("explore");
  const [questsSubTab, setQuestsSubTab] = useState<"board" | "achievements">("board");
  const [smithySubTab, setSmithySubTab] = useState<"forge" | "alchemy" | "awaken">("forge");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);
  const [itemUsageTargetSelector, setItemUsageTargetSelector] = useState<{ isOpen: boolean; item: Item | null }>({
    isOpen: false,
    item: null
  });

  // --- Start Screen & Animation Feedback States ---
  const [showStartScreen, setShowStartScreen] = useState<boolean>(true);
  const [hasSave, setHasSave] = useState<boolean>(false);
  const [isNewGameConfirmOpen, setIsNewGameConfirmOpen] = useState<boolean>(false);
  const [isManualOpen, setIsManualOpen] = useState<boolean>(false);

  // --- Expanded Story/Lore Decyption States ---
  const [decryptedLogIds, setDecryptedLogIds] = useState<string[]>([]);
  const [activeLoreDetail, setActiveLoreDetail] = useState<any | null>(null);
  const [isLoreTerminalOpen, setIsLoreTerminalOpen] = useState<boolean>(false);

  // --- Helper to check if an entity was recently hit or healed to trigger shake/glow animations ---
  const isRecentlyAttacked = (idx: number, isMonster: boolean) => {
    if (!combat) return false;
    const now = Date.now();
    const list = combat.damageNumbers.filter(num => {
      if (isMonster) {
        return num.isMonsterTarget && (num.type === "critical" || num.type === "normal" || num.type === "guarded");
      } else {
        return !num.isMonsterTarget && num.targetIndex === idx && (num.type === "critical" || num.type === "normal" || num.type === "guarded");
      }
    });
    if (list.length === 0) return false;
    const latest = list[list.length - 1];
    const parts = latest.id.split("_");
    const ts = parseInt(parts[parts.length - 1], 10);
    return !isNaN(ts) && (now - ts < 600);
  };

  const isRecentlyHealed = (idx: number, isMonster: boolean) => {
    if (!combat) return false;
    const now = Date.now();
    const list = combat.damageNumbers.filter(num => {
      if (isMonster) return false;
      return !num.isMonsterTarget && num.targetIndex === idx && num.type === "heal";
    });
    if (list.length === 0) return false;
    const latest = list[list.length - 1];
    const parts = latest.id.split("_");
    const ts = parseInt(parts[parts.length - 1], 10);
    return !isNaN(ts) && (now - ts < 600);
  };

  // --- Combat States ---
  const [combat, setCombat] = useState<{
    zoneId: string;
    monster: Monster;
    round: number;
    activePartyTurnIndex: number; // 0..3 index of party member currently acting
    isAutoCombat: boolean;
    damageNumbers: Array<{
      id: string;
      text: string;
      isMonsterTarget: boolean;
      targetIndex?: number; // if colleague target
      type: "critical" | "guarded" | "normal" | "heal" | "revive";
    }>;
  } | null>(null);

  // --- Battle & Town Narrative Log ---
  const [narrativeLogs, setNarrativeLogs] = useState<BattleLog[]>([
    {
      id: "init_1",
      text: "🌌 星空深邃，開拓者的雷達正嗡嗡作響。指令控制中心已初始化完畢。",
      type: "system"
    },
    {
      id: "init_2",
      text: "📢 提示：前往【公會公告板】接取日常開拓指令。前往【太空酒館】可招募強力戰友搭檔！",
      type: "system"
    }
  ]);

  const logConsoleRef = useRef<HTMLDivElement>(null);

  // --- Loading Saved Data from localStorage ---
  useEffect(() => {
    try {
      const saved = localStorage.getItem("COSMIC_ODYSSEY_SAVE_STATE");
      if (saved) {
        setHasSave(true);
        const parsed: GameSave = JSON.parse(saved);
        if (parsed.gold !== undefined) setGold(parsed.gold);
        if (parsed.daysPassed !== undefined) setDaysPassed(parsed.daysPassed);
        if (parsed.party && parsed.party.length > 0) setParty(parsed.party);
        if (parsed.quests) setQuests(parsed.quests);
        if (parsed.items) {
          // Sync quantities with existing templates to match fresh names/descriptions
          const updatedItems = SHOP_ITEMS.map(template => {
            const savedItem = parsed.items.find(i => i.id === template.id);
            return {
              ...template,
              count: savedItem ? savedItem.count : 0
            };
          });
          setItems(updatedItems);
        }
        if (parsed.activeZoneId) setActiveZoneId(parsed.activeZoneId);
        if (parsed.statistics) setStatistics(parsed.statistics);

        // Hydrate materials, artifacts, achievements
        if (parsed.materials) {
          setMaterials(parsed.materials);
        }
        if (parsed.craftedArtifactIds) {
          setCraftedArtifactIds(parsed.craftedArtifactIds);
        }
        if (parsed.claimedAchievementIds) {
          setClaimedAchievementIds(parsed.claimedAchievementIds);
        }
        if (parsed.decryptedLogIds) {
          setDecryptedLogIds(parsed.decryptedLogIds);
        }

        addLog("📂 檢測到已存檔的高能程式波形，已成功逆向載入隊伍進度！", "system");
      }
    } catch (e) {
      console.error("Failed to restore save data", e);
    }
  }, []);

  // --- Scroll Logs automatically ---
  useEffect(() => {
    if (logConsoleRef.current) {
      logConsoleRef.current.scrollTop = logConsoleRef.current.scrollHeight;
    }
  }, [narrativeLogs, combat?.round, combat?.activePartyTurnIndex]);

  // --- Safe Saving Function (Autosave Toast) ---
  const triggerAutosave = (
    currentGold: number,
    currentParty: Character[],
    currentQuests: Quest[],
    currentItems: Item[],
    currentZoneId: string,
    currentStats: any,
    currentMaterials?: Record<string, number>,
    currentArtifacts?: string[],
    currentAchievements?: string[],
    currentDecryptedLogs?: string[]
  ) => {
    const data: GameSave = {
      gold: currentGold,
      daysPassed,
      party: currentParty,
      quests: currentQuests,
      items: currentItems,
      activeZoneId: currentZoneId,
      materials: currentMaterials || materials,
      craftedArtifactIds: currentArtifacts || craftedArtifactIds,
      claimedAchievementIds: currentAchievements || claimedAchievementIds,
      decryptedLogIds: currentDecryptedLogs || decryptedLogIds,
      unlockedCompanions: [],
      statistics: currentStats
    };
    localStorage.setItem("COSMIC_ODYSSEY_SAVE_STATE", JSON.stringify(data));
    setHasSave(true);
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };

  const addLog = (text: string, type: BattleLog["type"]) => {
    setNarrativeLogs((prev) => [
      ...prev,
      {
        id: `log_${Date.now()}_${Math.random()}`,
        text,
        type
      }
    ]);
  };

  // --- Reset Game Flow ---
  const resetGame = () => {
    localStorage.removeItem("COSMIC_ODYSSEY_SAVE_STATE");
    setHasSave(false);
    setGold(150);
    setDaysPassed(1);
    setParty([HERO_INITIAL]);
    setQuests(INITIAL_QUESTS);
    setItems(SHOP_ITEMS.map(i => ({ ...i, count: 0 })));
    setMaterials({
      stardust_shard: 0,
      heavy_water_crystal: 0,
      plasma_battery: 0,
      nebula_core: 0
    });
    setCraftedArtifactIds([]);
    setClaimedAchievementIds([]);
    setDecryptedLogIds([]);
    setActiveZoneId("zone_1");
    setStatistics({
      totalGoldGained: 150,
      totalMonstersSlain: 0,
      totalUpgradesDone: 0
    });
    setCombat(null);
    setNarrativeLogs([
      { id: "reset_log", text: "🧯 時空重置信號發射！探險日誌清空，隊伍回到最初的航程起點。", type: "system" }
    ]);
    setIsResetConfirmOpen(false);
  };

  // --- Check and progress Quests ---
  const checkQuestMilestone = (
    type: "experience" | "slay" | "gold" | "upgrade",
    valueToAdd: number,
    updatedQuestsState?: Quest[]
  ) => {
    const activeQuests = updatedQuestsState || quests;
    let modified = false;

    const newQuests = activeQuests.map((q) => {
      if (q.status === "active" && q.targetType === type) {
        const nextValue = Math.min(q.targetValue, q.currentValue + valueToAdd);
        if (nextValue !== q.currentValue) {
          modified = true;
          const status = nextValue >= q.targetValue ? "ready" : "active";
          if (status === "ready") {
            addLog(`🎖️ 任務達成回報：託管指令【${q.title}】已完成！隨時可至公會面板領取報酬。`, "system");
          }
          return { ...q, currentValue: nextValue, status };
        }
      }
      return q;
    });

    if (modified) {
      setQuests(newQuests);
      return newQuests;
    }
    return activeQuests;
  };

  // Claim Quest rewards
  const claimQuestReward = (questId: string) => {
    const quest = quests.find((q) => q.id === questId);
    if (!quest || quest.status !== "ready") return;

    const nextQuests = quests.map((q) => {
      if (q.id === questId) {
        return { ...q, status: "completed" as const };
      }
      return q;
    });

    const nextGold = gold + quest.rewardGold;
    setGold(nextGold);
    addLog(`🎁 成功領取公會獎勵：金幣 +${quest.rewardGold} ✨，隊伍共享經驗值 +${quest.rewardExp}！`, "victory");

    // Distribute EXP to all party members
    const nextParty = party.map(member => {
      let currentExp = member.exp + quest.rewardExp;
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
        // Upgrades
        nextMaxHp = Math.round(nextMaxHp * 1.15) + 15;
        nextMaxMp = Math.round(nextMaxMp * 1.15) + 8;
        nextAtk = nextAtk + 4;
        nextDef = nextDef + 2;
        nextHp = nextMaxHp; // Fully heal on level up
        nextMp = nextMaxMp;
        leveledUp = true;
      }

      if (leveledUp) {
        addLog(`💫 ✨ 飛躍成長！隊員【${member.name}】晉升至 LV.${nextLv}！基礎戰力大幅攀升！`, "victory");
      }

      return {
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
      };
    });

    setParty(nextParty);
    setQuests(nextQuests);

    const nextStats = {
      ...statistics,
      totalGoldGained: statistics.totalGoldGained + quest.rewardGold
    };
    setStatistics(nextStats);

    triggerAutosave(nextGold, nextParty, nextQuests, items, activeZoneId, nextStats);
  };

  // --- Town Actions ---

  // Blacksmith Upgrade Gear
  const upgradeGear = (charId: string, type: "weapon" | "armor") => {
    const member = party.find((m) => m.id === charId);
    if (!member) return;

    const currentLevel = type === "weapon" ? member.equipment.weapon.level : member.equipment.armor.level;
    const goldCost = currentLevel * 25;

    if (gold < goldCost) {
      addLog(`❌ 金幣不足！強化此裝備需要 ${goldCost} 金幣。`, "system");
      return;
    }

    const nextGold = gold - goldCost;
    setGold(nextGold);

    const nextParty = party.map((m) => {
      if (m.id === charId) {
        if (type === "weapon") {
          const nextWType = {
            ...m.equipment.weapon,
            level: currentLevel + 1,
            bonus: m.equipment.weapon.bonus + 5
          };
          addLog(`🔨 鐵匠敲打聲響起！【${m.name}】的武器「${nextWType.name}」已強化至 Lv.${nextWType.level}！(攻擊力 +5)`, "player_action");
          return {
            ...m,
            atk: m.atk + 5,
            equipment: { ...m.equipment, weapon: nextWType }
          };
        } else {
          const nextAType = {
            ...m.equipment.armor,
            level: currentLevel + 1,
            bonus: m.equipment.armor.bonus + 4
          };
          addLog(`🔨 火花四濺！【${m.name}】的防具「${nextAType.name}」已強化至 Lv.${nextAType.level}！(防禦力 +3，最大生命 +15)`, "player_action");
          return {
            ...m,
            def: m.def + 3,
            maxHp: m.maxHp + 15,
            hp: m.hp + 15,
            equipment: { ...m.equipment, armor: nextAType }
          };
        }
      }
      return m;
    });

    setParty(nextParty);

    const nextStats = {
      ...statistics,
      totalUpgradesDone: statistics.totalUpgradesDone + 1
    };
    setStatistics(nextStats);

    // Progress Upgrade quest
    const nextQuests = checkQuestMilestone("upgrade", 1, quests);

    triggerAutosave(nextGold, nextParty, nextQuests, items, activeZoneId, nextStats);
  };

  // 🌟 [Feature 1] Awaken Character (職業晉階 / 轉職覺醒)
  const awakenCharacter = (charId: string) => {
    const member = party.find((m) => m.id === charId);
    if (!member) return;

    if (member.lv < 5) {
      addLog(`❌ 等級不足！角色需要達到 LV.5 或以上才能解鎖高階轉職覺醒。`, "system");
      return;
    }

    const goldCost = 250;
    if (gold < goldCost) {
      addLog(`❌ 金幣不足！轉職覺醒需要消耗 ${goldCost} 金幣以構築重粒子儀軌。`, "system");
      return;
    }

    // Check if already awakened
    const isAlreadyAwakened = member.title.includes("🌟");
    if (isAlreadyAwakened) {
      addLog(`❌ 已然覺醒！隊員【${member.name}】已經在神聖階位，無法重複覺醒。`, "system");
      return;
    }

    const nextGold = gold - goldCost;
    setGold(nextGold);

    let advancedTitle = member.title + " 🌟";

    if (member.className === "Hero") {
      advancedTitle = "銀河先鋒主宰官 🌟";
    } else if (member.className === "Wizard") {
      advancedTitle = "超中子等離子使徒 🌟";
    } else if (member.className === "Priest") {
      advancedTitle = "太空中微子神諭使 🌟";
    } else if (member.className === "Assassin") {
      advancedTitle = "影蝕暗物質收割者 🌟";
    } else if (member.className === "Paladin") {
      advancedTitle = "重力超斥力星防者 🌟";
    }

    const nextParty = party.map((m) => {
      if (m.id === charId) {
        return {
          ...m,
          title: advancedTitle,
          atk: m.atk + 35,
          def: m.def + 15,
          maxHp: m.maxHp + 200,
          hp: m.maxHp + 200, // full heal
          maxMp: m.maxMp + 50,
          mp: m.maxMp + 50, // full mp restore
          activeSkill: {
            ...m.activeSkill,
            name: `真奧義·${m.activeSkill.name}`,
            multiplier: Number((m.activeSkill.multiplier * 1.5).toFixed(1)),
            mpCost: m.activeSkill.mpCost + 5,
            description: `經受超新星共振，其威力倍增並昇載為真神話奧義！`
          }
        };
      }
      return m;
    });

    setParty(nextParty);
    addLog(`☀️ ⚡ 職業轉職：隊員【${member.name}】順利引導超核感應，成功階級覺醒為「${advancedTitle}」！全屬性永久爆發性成長！`, "achievement");

    // Save
    triggerAutosave(nextGold, nextParty, quests, items, activeZoneId, statistics);
  };

  // 🌟 [Feature 2] Craft Passive Artifact (鍊金術合成)
  const craftArtifact = (artifactId: string) => {
    const artifact = ARTIFACTS[artifactId];
    if (!artifact) return;

    if (craftedArtifactIds.includes(artifactId)) {
      addLog(`❌ 已擁有該神器！小隊無法重複裝填相同的星空神器。`, "system");
      return;
    }

    // Check ingredients
    if (gold < artifact.recipe.gold) {
      addLog(`❌ 金幣不夠！合成此神器法陣需要消耗 ${artifact.recipe.gold} 金幣。`, "system");
      return;
    }

    // Check materials
    const recipeKeys = Object.keys(artifact.recipe.materials);
    for (const key of recipeKeys) {
      const requiredAmount = artifact.recipe.materials[key];
      const availableAmount = materials[key] || 0;
      if (availableAmount < requiredAmount) {
        addLog(`❌ 鍊金材料不足！需要【${MATERIALS[key]?.name || key}】x${requiredAmount}，但太空貨艙中僅有 x${availableAmount}。`, "system");
        return;
      }
    }

    // Deduct Gold and Materials
    const nextGold = gold - artifact.recipe.gold;
    setGold(nextGold);

    const nextMaterials = { ...materials };
    for (const key of recipeKeys) {
      nextMaterials[key] -= artifact.recipe.materials[key];
    }
    setMaterials(nextMaterials);

    const nextArtifacts = [...craftedArtifactIds, artifactId];
    setCraftedArtifactIds(nextArtifacts);

    addLog(`🧪 ⚙️ 鍊金合成：成功將太空微塵配方重熔！你獲得了傳奇神器——【${artifact.emoji} ${artifact.name}】！Passive 特性已全體激活。`, "crafting");

    let nextParty = party;
    if (artifactId === "artifact_gravity") {
      nextParty = party.map(m => {
        const nextMax = Math.round(m.maxHp * 1.15);
        return {
          ...m,
          maxHp: nextMax,
          hp: Math.min(nextMax, m.hp + Math.round(m.maxHp * 0.15))
        };
      });
      setParty(nextParty);
      addLog(`🌌 「超引力重粒子徽章」激發重力偏置，我方所有戰友最大生命上限已永久提升 15%！`, "crafting");
    } else if (artifactId === "artifact_booster") {
      nextParty = party.map(m => ({
        ...m,
        atk: m.atk + Math.round(m.atk * 0.15)
      }));
      setParty(nextParty);
      addLog(`⚔️ 「星河離子熱核推進器」陣列開火，我方所有戰友基礎物理攻擊力 ATK 已永久提升 15%！`, "crafting");
    }

    triggerAutosave(nextGold, nextParty, quests, items, activeZoneId, statistics, nextMaterials, nextArtifacts);
  };

  // 🌟 [Feature 4] Claim Achievement (成就授章)
  const claimAchievement = (achId: string) => {
    const ach = ACHIEVEMENTS.find(a => a.id === achId);
    if (!ach || claimedAchievementIds.includes(achId)) return;

    // Verify requirements
    let earned = false;
    if (ach.targetType === "slay") {
      earned = statistics.totalMonstersSlain >= ach.targetValue;
    } else if (ach.targetType === "gold_total") {
      earned = statistics.totalGoldGained >= ach.targetValue;
    } else if (ach.targetType === "upgrade_max") {
      const maxLvl = Math.max(...party.flatMap(m => [m.equipment.weapon.level, m.equipment.armor.level]));
      earned = maxLvl >= ach.targetValue;
    } else if (ach.targetType === "awake_count") {
      const awakeCount = party.filter(m => m.title.includes("🌟")).length;
      earned = awakeCount >= ach.targetValue;
    }

    if (!earned) {
      addLog(`❌ 指標未達標！您尚未符合「${ach.title}」所規範的量子數據指標要求！`, "system");
      return;
    }

    const nextGold = gold + ach.rewardGold;
    setGold(nextGold);

    const nextClaims = [...claimedAchievementIds, achId];
    setClaimedAchievementIds(nextClaims);

    addLog(`🎖️ 🏅 榮譽授給：成功申領群星成就「${ach.title}」！注入開拓資助 +${ach.rewardGold} Credits 金券！`, "achievement");

    triggerAutosave(nextGold, party, quests, items, activeZoneId, statistics, materials, craftedArtifactIds, nextClaims);
  };

  // Buy Shop consumables
  const buyConsumable = (itemId: string) => {
    const itemTemplate = items.find((i) => i.id === itemId);
    if (!itemTemplate) return;

    if (gold < itemTemplate.price) {
      addLog(`❌ 信用資產不足！無法購買 「${itemTemplate.name}」。`, "system");
      return;
    }

    const nextGold = gold - itemTemplate.price;
    setGold(nextGold);

    const nextItems = items.map((i) => {
      if (i.id === itemId) {
        return { ...i, count: i.count + 1 };
      }
      return i;
    });
    setItems(nextItems);

    addLog(`🧪 購入【${itemTemplate.name}】x 1。扣除 ${itemTemplate.price} 能源金幣。`, "player_action");

    triggerAutosave(nextGold, party, quests, nextItems, activeZoneId, statistics);
  };

  // Sell Consumable
  const sellConsumable = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item || item.count <= 0) return;

    const sellPrice = Math.round(item.price * 0.5);
    const nextGold = gold + sellPrice;
    setGold(nextGold);

    const nextItems = items.map((i) => {
      if (i.id === itemId) {
        return { ...i, count: i.count - 1 };
      }
      return i;
    });
    setItems(nextItems);

    addLog(`🧪 賣出【${item.name}】x 1。獲得 ${sellPrice} 能源金幣。`, "player_action");

    triggerAutosave(nextGold, party, quests, nextItems, activeZoneId, statistics);
  };

  // Tavern Rest (Heal all)
  const restAtTavern = () => {
    const cost = party.length * 15;
    if (gold < cost) {
      addLog(`❌ 金幣不夠！全員修繕保養共需 ${cost} 能源金幣。`, "system");
      return;
    }

    const nextGold = gold - cost;
    setGold(nextGold);
    setDaysPassed((d) => d + 1);

    const nextParty = party.map((m) => ({
      ...m,
      hp: m.maxHp,
      mp: m.maxMp,
      isDead: false
    }));
    setParty(nextParty);

    addLog(`🛌 隊伍集體下線，在太空旅店休眠艙進行了深度保養與充能。全員生命值 (HP) 與法力值 (MP) 充能完畢！(天數 +1, 花費 ${cost} 金幣)`, "player_action");

    triggerAutosave(nextGold, nextParty, quests, items, activeZoneId, statistics);
  };

  // Recruit companion from Tavern
  const recruitCompanion = (templateId: string) => {
    const template = RECRUITABLE_COMPANIONS.find((c) => c.id === templateId);
    if (!template) return;

    // Check if duplicate className already in party
    const isAlreadyRecruited = party.some((m) => m.className === template.className);
    if (isAlreadyRecruited) {
      addLog(`❌ 【${template.title}】的同類職業波形已在您的出戰編制中。`, "system");
      return;
    }

    if (party.length >= 4) {
      addLog("❌ 出戰隊伍員額已滿 (最多 4 人)。無法再容納新隊友搭擋！", "system");
      return;
    }

    if (gold < 100) {
      addLog("❌ 聘書資金不足！招募夥伴需要 100 能源金幣。", "system");
      return;
    }

    const nextGold = gold - 100;
    setGold(nextGold);

    // Create unique instance of candidate companion
    const newMember: Character = {
      ...template,
      id: `partner_${Date.now()}_${Math.random()}`
    };

    // Apply already-crafted squad-wide artifact passives so late recruits are not left behind
    if (craftedArtifactIds.includes("artifact_gravity")) {
      const boostedMaxHp = Math.round(newMember.maxHp * 1.15);
      newMember.maxHp = boostedMaxHp;
      newMember.hp = boostedMaxHp;
    }
    if (craftedArtifactIds.includes("artifact_booster")) {
      newMember.atk = newMember.atk + Math.round(newMember.atk * 0.15);
    }

    const nextParty = [...party, newMember];
    setParty(nextParty);

    addLog(`🤝 成功聘請強力夥伴【${newMember.name} (${newMember.title})】！出戰組隊編組規模提升至 ${nextParty.length} 人。`, "victory");

    triggerAutosave(nextGold, nextParty, quests, items, activeZoneId, statistics);
  };

  // --- Combat Engine Logic ---

  // Trigger Combat Start
  const startCombat = (zoneId: string) => {
    const zone = ZONES.find((z) => z.id === zoneId);
    if (!zone) return;

    // Check min level
    const heroLevel = party[0].lv;
    if (heroLevel < zone.minLevel) {
      addLog(`⚠️ 預警！您的開拓者等級 (LV.${heroLevel}) 低於該祕境所需能量門檻水準 (LV.${zone.minLevel})。冒然進入極易損毀！`, "system");
      return;
    }

    // Check if at least one character is alive
    const hasAlive = party.some((m) => m.hp > 0 && !m.isDead);
    if (!hasAlive) {
      addLog(`❌ 全員陣亡死機中！請先前往【太空酒館】休息恢復。`, "system");
      return;
    }

    // Roll for Random Space Event (20% chance)
    if (Math.random() < 0.20 && RANDOM_EVENTS.length > 0) {
      const selectedEvent = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
      setActiveSpaceEvent(selectedEvent);
      addLog(`📡 嗶嗶！高敏探測雷達鎖定未知頻率：遭遇「${selectedEvent.title}」！進入奇遇決策態。`, "event");
      return;
    }

    // Select random monster template
    const randTmpName = zone.monsters[Math.floor(Math.random() * zone.monsters.length)];
    const template = MONSTER_TEMPLATES[randTmpName] || MONSTER_TEMPLATES.slime_plant;

    const spawnMonster: Monster = {
      id: `monster_${Date.now()}`,
      name: template.name,
      hp: template.baseHp,
      maxHp: template.baseHp,
      atk: template.baseAtk,
      def: template.baseDef,
      element: template.element,
      rewardExp: template.rewardExp,
      rewardGold: template.rewardGold,
      description: template.description,
      emoji: template.emoji,
      isDead: false
    };

    // Find first alive party member index to serve as active combat turn
    let firstAliveIdx = party.findIndex((m) => m.hp > 0 && !m.isDead);
    if (firstAliveIdx === -1) firstAliveIdx = 0;

    setCombat({
      zoneId,
      monster: spawnMonster,
      round: 1,
      activePartyTurnIndex: firstAliveIdx,
      isAutoCombat: false,
      damageNumbers: []
    });

    addLog(`⚔️ 隊伍進入「${zone.name}」，偵測到了強烈生命信號！遭遇了 【${spawnMonster.name} (${getElementEmoji(spawnMonster.element)})】！戰鬥開始！`, "system");
  };

  // Handle random space event choices
  const handleSpaceEventChoice = (choiceActionId: string) => {
    if (!activeSpaceEvent) return;

    let localGold = gold;
    const localParty = [...party];
    const localMaterials = { ...materials };
    const localItems = [...items];

    let outcomeLog = "";

    if (choiceActionId === "hack_ship") {
      if (Math.random() < 0.5) {
        const bonus = 150;
        localGold += bonus;
        outcomeLog = `🎉 破解成功！你成功逆向了主晶片數據鎖，開拓賬號充值得到 +${bonus} Credits！`;
      } else {
        // static damage to characters
        localParty.forEach((m, idx) => {
          if (m.hp > 0 && !m.isDead) {
            localParty[idx] = { ...m, hp: Math.max(1, m.hp - 20) };
          }
        });
        outcomeLog = `🚨 防火牆反噬超載！星艦防衛靜電陷阱被引爆，全隊成員安全護盾均受到 20 點高能電擊傷害！`;
      }
    } else if (choiceActionId === "scrap_ship") {
      // Pick 2 random materials
      const allMats = Object.keys(MATERIALS);
      const m1 = allMats[Math.floor(Math.random() * allMats.length)];
      const m2 = allMats[Math.floor(Math.random() * allMats.length)];
      localMaterials[m1] = (localMaterials[m1] || 0) + 1;
      localMaterials[m2] = (localMaterials[m2] || 0) + 1;
      outcomeLog = `📦 拆解完畢。成功獲得了宇宙材料：【${MATERIALS[m1].emoji} ${MATERIALS[m1].name} x1】與【${MATERIALS[m2].emoji} ${MATERIALS[m2].name} x1】！`;
    } else if (choiceActionId === "monolith_infuse") {
      // Free +1 weapon upgrade level for a random alive companion
      const aliveIndexes = localParty.map((m, i) => (m.hp > 0 && !m.isDead ? i : -1)).filter(i => i !== -1);
      if (aliveIndexes.length > 0) {
        const targetIdx = aliveIndexes[Math.floor(Math.random() * aliveIndexes.length)];
        const targetMem = localParty[targetIdx];
        const nextWpLvl = targetMem.equipment.weapon.level + 1;
        const nextBonus = targetMem.equipment.weapon.bonus + 5;
        localParty[targetIdx] = {
          ...targetMem,
          atk: targetMem.atk + 5,
          equipment: {
            ...targetMem.equipment,
            weapon: {
              ...targetMem.equipment.weapon,
              level: nextWpLvl,
              bonus: nextBonus
            }
          }
        };
        outcomeLog = `🔮 晶能注入！隊員【${targetMem.name}】的武器「${targetMem.equipment.weapon.name}」吸收了高維光華，免費強化至 Lvl.${nextWpLvl} (+${nextBonus} ATK)！`;
      } else {
        outcomeLog = `🔮 方碑磁場共鸣，但隊伍中所有人均屬於死機狀態，因沒有活性體溫感應而默默消散了。`;
      }
    } else if (choiceActionId === "monolith_mine") {
      localMaterials.heavy_water_crystal = (localMaterials.heavy_water_crystal || 0) + 2;
      localMaterials.stardust_shard = (localMaterials.stardust_shard || 0) + 2;
      outcomeLog = `⛏️ 鑿取成功！背包加入了【💎 超導重水結晶 x2】與【✨ 星塵發光碎片 x2】！`;
    } else if (choiceActionId === "merchant_sell") {
      const bonus = 120;
      localGold += bonus;
      outcomeLog = `🪙 交易完畢。走私商人用帶有微核印記的黑市金券 +${bonus} Credits 收購了你的飛船剩餘壓載配重。`;
    } else if (choiceActionId === "merchant_buy_feather") {
      if (localGold >= 80) {
        localGold -= 80;
        const updatedItems = localItems.map(i => {
          if (i.id === "phoenix_feather") return { ...i, count: i.count + 1 };
          return i;
        });
        setItems(updatedItems);
        outcomeLog = `🪶 交易成功！花費 80 Credits 強行買入【🪶 鳳凰量子甦生羽 x1】(立省 70 金幣)！`;
      } else {
        outcomeLog = `❌ 餘額不足！走私行家鄙視地看了你一眼，並一腳踢開了通訊：「這年頭窮鬼別來逛黑市！」`;
      }
    } else if (choiceActionId === "storm_shield") {
      localParty.forEach((m, idx) => {
        if (m.hp > 0 && !m.isDead) {
          const dmg = Math.round(m.hp * 0.2);
          localParty[idx] = { ...m, hp: Math.max(1, m.hp - dmg) };
        }
      });
      // Add exp to all
      localParty.forEach((m, idx) => {
        let currentExp = m.exp + 100;
        let nextLv = m.lv;
        let nextMaxExp = m.maxExp;
        let nextHp = m.hp;
        let nextMaxHp = m.maxHp;
        let nextMp = m.mp;
        let nextMaxMp = m.maxMp;
        let nextAtk = m.atk;
        let nextDef = m.def;
        let leveledUp = false;

        while (currentExp >= nextMaxExp) {
          currentExp -= nextMaxExp;
          nextLv += 1;
          nextMaxExp = Math.round(nextMaxExp * 1.5);
          nextMaxHp = Math.round(nextMaxHp * 1.15) + 15;
          nextMaxMp = Math.round(nextMaxMp * 1.15) + 8;
          nextAtk = nextAtk + 4;
          nextDef = nextDef + 2;
          nextHp = nextMaxHp;
          nextMp = nextMaxMp;
          leveledUp = true;
        }
        localParty[idx] = {
          ...m,
          lv: nextLv,
          exp: currentExp,
          maxExp: nextMaxExp,
          hp: nextHp,
          maxHp: nextMaxHp,
          mp: nextMp,
          maxMp: nextMaxMp,
          atk: nextAtk,
          def: nextDef
        };
        if (leveledUp) {
          addLog(`☄️ 磁暴突破！【${m.name}】在恆星微波感應中突破至 LV.${nextLv}！`, "victory");
        }
      });
      outcomeLog = `🛡️ 護盾抗阻！雖然隊伍遭受了 20% 當前生命值的重力亂流衝擊，但在科研感應器記錄下，小隊全體成員共享了 +100 點粒子經驗值 (EXP)！`;
    } else if (choiceActionId === "storm_absorb") {
      // refill MP, random member taking damage
      localParty.forEach((m, idx) => {
        localParty[idx] = { ...m, mp: m.maxMp };
      });
      const targetIdx = Math.floor(Math.random() * localParty.length);
      const targetMem = localParty[targetIdx];
      localParty[targetIdx] = { ...targetMem, hp: Math.max(1, targetMem.hp - 45) };
      outcomeLog = `⚡ 雷暴充能！小隊所有人 MP 被迫超速充值滿格！但代價是隊員【${targetMem.name}】不幸引雷燒傷，生命值扣除 45 點。`;
    } else {
      outcomeLog = `🌌 你選擇了安全規避策略，安靜地調整星軌航向、繞過了引力漩渦。`;
    }

    addLog(`📢 奇遇事件回報：${outcomeLog}`, "event");
    setGold(localGold);
    setParty(localParty);
    setMaterials(localMaterials);

    // Save and close
    setActiveSpaceEvent(null);
    triggerAutosave(localGold, localParty, quests, items, activeZoneId, statistics, localMaterials);
  };

  // Apply ally actions (Attack, Skill, Use Item)
  const executeAllyAction = (actionType: "attack" | "skill" | "item", selectedItemId?: string) => {
    if (!combat) return;

    const { monster, activePartyTurnIndex, round } = combat;
    const actor = party[activePartyTurnIndex];

    if (!actor || actor.hp <= 0 || actor.isDead) {
      // Actor is dead, auto jump next
      passTurnToNextColleague();
      return;
    }

    // 1. Calculate base parameters
    let damage = 0;
    let text = "";
    let costMp = 0;
    let actionAnimType: "critical" | "guarded" | "normal" | "heal" | "revive" = "normal";

    if (actionType === "attack") {
      // Normal attack
      const relation = getElementRelation(actor.element, monster.element);
      const baseDmg = actor.atk;
      damage = Math.max(2, Math.round((baseDmg - monster.def * 0.4) * relation.multiplier));
      actionAnimType = relation.type;

      // Update monster HP
      const nextHp = Math.max(0, monster.hp - damage);
      const isMonsterDead = nextHp <= 0;

      const damageLogSymbol = relation.symbol;
      text = `⚔️ 【${actor.name}】使出一記蓄力普通攻擊！對【${monster.name}】斬擊造成 ${damage} 點傷害！ ${damageLogSymbol}`;

      updateMonsterHpAndLogs(nextHp, text, damage, actionAnimType, isMonsterDead);

    } else if (actionType === "skill") {
      const skill = actor.activeSkill;
      if (actor.mp < skill.mpCost) {
        addLog(`⚠️ 法力不足！【${actor.name}】需要 ${skill.mpCost} MP 才能施展「${skill.name}」！`, "system");
        return;
      }

      costMp = skill.mpCost;

      // Deduct MP for actor
      const nextParty = party.map((m, idx) => {
        if (idx === activePartyTurnIndex) {
          return { ...m, mp: Math.max(0, m.mp - costMp) };
        }
        return m;
      });
      setParty(nextParty);

      if (skill.effect === "damage") {
        const relation = getElementRelation(actor.element, monster.element);
        const baseDmg = actor.atk * skill.multiplier;
        damage = Math.max(5, Math.round((baseDmg - monster.def * 0.45) * relation.multiplier));
        actionAnimType = relation.type;

        const nextHp = Math.max(0, monster.hp - damage);
        const isMonsterDead = nextHp <= 0;

        const damageLogSymbol = relation.symbol;
        text = `🔮 【${actor.name}】釋放星塵大招「${skill.name} (${getElementEmoji(actor.element)})」！${relation.text} 造成 ${damage} 點爆炸傷害！ ${damageLogSymbol}`;

        updateMonsterHpAndLogs(nextHp, text, damage, actionAnimType, isMonsterDead, nextParty);

      } else if (skill.effect === "heal") {
        // Priest Heal
        const healValue = Math.round(actor.atk * skill.multiplier);
        actionAnimType = "heal";

        // Heal ALL living party members
        const healedParty = nextParty.map((m) => {
          if (m.hp > 0 && !m.isDead) {
            return { ...m, hp: Math.min(m.maxHp, m.hp + healValue) };
          }
          return m;
        });
        setParty(healedParty);

        text = `🌀 【${actor.name}】激盪「${skill.name}」！海洋離子巨浪覆蓋整備艙，使我方全員存活者獲得 +${healValue} 生命注能！`;
        addLog(text, "victory");

        // Flash heal numbers on colleagues
        const anims = healedParty.map((m, idx) => ({
          id: `heal_anim_${idx}_${Date.now()}`,
          text: `+${healValue} HP 💧`,
          isMonsterTarget: false,
          targetIndex: idx,
          type: "heal" as const
        }));

        setCombat((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            damageNumbers: [...prev.damageNumbers, ...anims]
          };
        });

        // Advance turn
        setTimeout(() => {
          passTurnToNextColleague();
        }, 600);

      } else if (skill.effect === "shield") {
        // Paladin Sacred Aegis Shield / Minor area damage + heal allies
        const healAmt = 100;
        const baseDmg = actor.atk * 1.2;
        const relation = getElementRelation(actor.element, monster.element);
        damage = Math.max(2, Math.round((baseDmg - monster.def * 0.4) * relation.multiplier));
        actionAnimType = relation.type;

        // Heal allies
        const shieldedParty = nextParty.map((m) => {
          if (m.hp > 0 && !m.isDead) {
            return { ...m, hp: Math.min(m.maxHp, m.hp + healAmt) };
          }
          return m;
        });
        setParty(shieldedParty);

        const nextHp = Math.max(0, monster.hp - damage);
        const isMonsterDead = nextHp <= 0;

        text = `🛡️ 【${actor.name}】撐開重粒子磁盾「${skill.name} (${getElementEmoji(actor.element)})」！重擊狂砸魔物造成 ${damage} 傷害，並分流能磁為隊友回復 +${healAmt} HP！`;

        updateMonsterHpAndLogs(nextHp, text, damage, actionAnimType, isMonsterDead, shieldedParty);
      }
    } else if (actionType === "item" && selectedItemId) {
      // Use inventory consumable in combat
      const targetItem = items.find((i) => i.id === selectedItemId);
      if (!targetItem || targetItem.count <= 0) return;

      // Handle direct item usage targeting active companion on turn
      let countAlteredItems = items.map((i) => {
        if (i.id === selectedItemId) return { ...i, count: i.count - 1 };
        return i;
      });
      setItems(countAlteredItems);

      let targetText = "";
      const updatedParty = party.map((m, idx) => {
        if (idx === activePartyTurnIndex) {
          if (targetItem.type === "healing") {
            const nextHp = Math.min(m.maxHp, m.hp + targetItem.effectValue);
            targetText = `給【${m.name}】灌注了 ${targetItem.name}，微觀奈米機器人瘋狂復原 +${targetItem.effectValue} HP！`;
            return { ...m, hp: nextHp, isDead: false };
          } else if (targetItem.type === "mana") {
            const nextMp = Math.min(m.maxMp, m.mp + targetItem.effectValue);
            targetText = `給【${m.name}】接入了 ${targetItem.name}，能量魔能儲存腔快速補充 +${targetItem.effectValue} MP！`;
            return { ...m, mp: nextMp };
          } else if (targetItem.type === "revive") {
            if (m.hp <= 0 || m.isDead) {
              const revivedHp = Math.round(m.maxHp * 0.5);
              targetText = `向【${m.name}】投射 ${targetItem.name}！強制倒帶生命程式，逆時復活成功並回復 +${revivedHp} HP！`;
              return { ...m, hp: revivedHp, isDead: false };
            } else {
              targetText = `對【${m.name}】使用了甦生羽，但其心跳信號良好，僅提供少量高階淨化效果。`;
            }
          }
        }
        return m;
      });

      setParty(updatedParty);
      addLog(`🧪 背包補給！${targetText}`, "player_action");

      // Add healing damage numbers animation
      const itemAnim = {
        id: `item_anim_${Date.now()}`,
        text: `+${targetItem.effectValue} ${targetItem.type === "healing" ? "HP 🧪" : "MP 🌀"}`,
        isMonsterTarget: false,
        targetIndex: activePartyTurnIndex,
        type: "heal" as const
      };

      setCombat((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          damageNumbers: [...prev.damageNumbers, itemAnim]
        };
      });

      setTimeout(() => {
        passTurnToNextColleague();
      }, 600);
    }
  };

  // Intermediate step to update monster health
  const updateMonsterHpAndLogs = (
    nextHp: number,
    logText: string,
    dmg: number,
    animType: "critical" | "guarded" | "normal" | "heal" | "revive",
    isMonsterDead: boolean,
    updatedPartyState?: Character[]
  ) => {
    if (!combat) return;

    addLog(logText, animType === "critical" ? "critical" : "player_action");

    // Spawn damage number overlay on monster
    const dmgAnim = {
      id: `dmg_anim_m_${Date.now()}`,
      text: `${dmg} ${animType === "critical" ? "💥" : animType === "guarded" ? "🛡️" : ""}`,
      isMonsterTarget: true,
      type: animType
    };

    setCombat((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        monster: { ...prev.monster, hp: nextHp, isDead: isMonsterDead },
        damageNumbers: [...prev.damageNumbers, dmgAnim]
      };
    });

    if (isMonsterDead) {
      setTimeout(() => {
        winBattle(updatedPartyState || party);
      }, 700);
    } else {
      setTimeout(() => {
        passTurnToNextColleague();
      }, 700);
    }
  };

  // Loop turn order
  const passTurnToNextColleague = () => {
    if (!combat) return;

    const { activePartyTurnIndex } = combat;
    const nextIdx = activePartyTurnIndex + 1;

    if (nextIdx >= party.length) {
      // End player phase, trigger monster play phase
      executeMonsterTurn();
    } else {
      // Switch next colleague turn
      const nextMember = party[nextIdx];
      if (nextMember && (nextMember.hp <= 0 || nextMember.isDead)) {
        // Skip dead teammate
        setCombat((prev) => {
          if (!prev) return null;
          return { ...prev, activePartyTurnIndex: nextIdx };
        });
        // Run skip checks on next rendering cycle
      } else {
        setCombat((prev) => {
          if (!prev) return null;
          return { ...prev, activePartyTurnIndex: nextIdx };
        });
      }
    }
  };

  // Run skip check automatically when index updates to dead actors
  useEffect(() => {
    if (!combat) return;
    const { activePartyTurnIndex } = combat;
    if (activePartyTurnIndex < party.length) {
      const activeChar = party[activePartyTurnIndex];
      if (activeChar && (activeChar.hp <= 0 || activeChar.isDead)) {
        passTurnToNextColleague();
      }
    }
  }, [combat?.activePartyTurnIndex]);

  // Monster action sequence
  const executeMonsterTurn = () => {
    if (!combat) return;

    const { monster } = combat;

    // Filter living comrades
    const aliveIndices = party
      .map((m, idx) => ({ m, idx }))
      .filter((pair) => pair.m.hp > 0 && !pair.m.isDead);

    if (aliveIndices.length === 0) {
      loseBattle();
      return;
    }

    // Direct targeted strike
    const targetPair = aliveIndices[Math.floor(Math.random() * aliveIndices.length)];
    const targetIdx = targetPair.idx;
    const target = targetPair.m;

    const relation = getElementRelation(monster.element, target.element);
    const dmgInflicted = Math.max(1, Math.round((monster.atk - target.def * 0.4) * relation.multiplier));

    const rawNextHp = Math.max(0, target.hp - dmgInflicted);
    let targetFell = rawNextHp <= 0;
    let finalHp = rawNextHp;

    // 🔘 Phoenix Lens passive: 15% chance to auto-revive a fallen ally at 25% HP
    let phoenixRevivedHp = 0;
    const hasPhoenixLens = craftedArtifactIds.includes("artifact_phoenix_lens");
    if (targetFell && hasPhoenixLens && Math.random() < 0.15) {
      phoenixRevivedHp = Math.max(1, Math.round(target.maxHp * 0.25));
      finalHp = phoenixRevivedHp;
      targetFell = false;
    }

    const nextParty = party.map((m, idx) => {
      if (idx === targetIdx) {
        return { ...m, hp: finalHp, isDead: targetFell };
      }
      return m;
    });
    setParty(nextParty);

    const strikeSymbol = relation.symbol;
    const monsterText = `👾 【${monster.name} (${getElementEmoji(monster.element)})】展開反撲狂抓！${relation.text}，對我方【${target.name}】砸出 ${dmgInflicted} 點震盪傷害！ ${strikeSymbol}`;
    addLog(monsterText, relation.type === "critical" ? "critical" : "monster_action");

    if (phoenixRevivedHp > 0) {
      addLog(`🔘 「量子複活偏振透鏡」逆時程式啟動！偵測到【${target.name}】死機瞬間觸發極限重啟，以 ${phoenixRevivedHp} HP (25%) 強制復甦！`, "victory");
    } else if (targetFell) {
      addLog(`💀 戰報警告：我方戰友【${target.name}】能量艙載荷崩塌，身受重傷強制斷線離線！`, "gameover");
    }

    // Add overlay damage text to ally card
    const allyDmgOverlay = {
      id: `dmg_anim_a_${Date.now()}`,
      text: `-${dmgInflicted} ${relation.symbol}`,
      isMonsterTarget: false,
      targetIndex: targetIdx,
      type: relation.type
    };

    setCombat((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        damageNumbers: [...prev.damageNumbers, allyDmgOverlay]
      };
    });

    // Check if whole party is completely wiped
    const stillAlive = nextParty.some((m) => m.hp > 0 && !m.isDead);

    setTimeout(() => {
      if (!stillAlive) {
        loseBattle();
      } else {
        // Reset player turns for next round
        let firstAlive = nextParty.findIndex((m) => m.hp > 0 && !m.isDead);
        if (firstAlive === -1) firstAlive = 0;

        setCombat((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            round: prev.round + 1,
            activePartyTurnIndex: firstAlive
          };
        });
        addLog(`⏳ 回合 RND.${combat.round + 1} 戰況刷新，能量核心冷卻流重置完畢！`, "system");
      }
    }, 850);
  };

  // Player Victory Flow
  const winBattle = (finalPartyState: Character[]) => {
    if (!combat) return;

    const { monster } = combat;

    addLog(`🎉 🏆 戰鬥勝出！成功殲滅太空魔物 【${monster.name}】！`, "victory");

    // Earn EXP and Gold
    const rewardExp = monster.rewardExp;
    const rewardGold = monster.rewardGold;

    // Apply Gold Attractor passive blessing
    const hasGoldAttractor = craftedArtifactIds.includes("artifact_attractor");
    const actualRewardGold = hasGoldAttractor ? Math.round(rewardGold * 1.25) : rewardGold;

    const nextGold = gold + actualRewardGold;
    setGold(nextGold);

    if (hasGoldAttractor) {
      addLog(`💰 冒險核對：開拓帳戶新增能源金幣 +${actualRewardGold} ✨！(包含「超維度重力引金磁針」額外 25% 充值)`, "victory");
    } else {
      addLog(`💰 冒險核對：開拓帳戶新增能源金幣 +${actualRewardGold} ✨！`, "victory");
    }

    // Material rewards drop mechanics
    let droppedMatId = "";
    const rand = Math.random();
    if (activeZoneId === "zone_1") {
      if (rand < 0.65) droppedMatId = "stardust_shard";
    } else if (activeZoneId === "zone_2") {
      if (rand < 0.55) droppedMatId = "heavy_water_crystal";
      else if (rand < 0.75) droppedMatId = "stardust_shard";
    } else if (activeZoneId === "zone_3") {
      if (rand < 0.50) droppedMatId = "plasma_battery";
      else if (rand < 0.70) droppedMatId = "heavy_water_crystal";
    } else if (activeZoneId === "zone_4") {
      if (rand < 0.45) droppedMatId = "plasma_battery";
      else if (rand < 0.65) droppedMatId = "nebula_core";
    } else if (activeZoneId === "zone_5") {
      if (rand < 0.60) droppedMatId = "nebula_core";
    }

    const nextMaterials = { ...materials };
    if (droppedMatId && MATERIALS[droppedMatId]) {
      nextMaterials[droppedMatId] = (nextMaterials[droppedMatId] || 0) + 1;
      setMaterials(nextMaterials);
      addLog(`📦 戰場廢墟物資回收：拾獲【${MATERIALS[droppedMatId].emoji} ${MATERIALS[droppedMatId].name} x1】已納入小隊貨艙！`, "crafting");
    }

    // Distribute EXP
    const expHealedParty = finalPartyState.map((member) => {
      if (member.hp <= 0 || member.isDead) return member; // Dead companions do not earn active combat EXP!

      let currentExp = member.exp + rewardExp;
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
        // Stats scaling
        nextMaxHp = Math.round(nextMaxHp * 1.15) + 15;
        nextMaxMp = Math.round(nextMaxMp * 1.15) + 8;
        nextAtk = nextAtk + 4;
        nextDef = nextDef + 2;
        nextHp = nextMaxHp; // Refill HP entirely on level up!
        nextMp = nextMaxMp;
        leveledUp = true;
      }

      if (leveledUp) {
        addLog(`✨ 💫 突破極限！我方隊員【${member.name}】晉階提升至 LV.${nextLv}！攻擊/防禦特性全方位升載！`, "victory");
      } else {
        addLog(`🧪 【${member.name}】汲取戰場數據能量 EXP +${rewardExp}。`, "victory");
      }

      return {
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
      };
    });

    setParty(expHealedParty);

    // Update statistics
    const nextStats = {
      ...statistics,
      totalMonstersSlain: statistics.totalMonstersSlain + 1,
      totalGoldGained: statistics.totalGoldGained + actualRewardGold
    };
    setStatistics(nextStats);

    // Progress Quests
    let updatedQuests = checkQuestMilestone("slay", 1, quests);
    updatedQuests = checkQuestMilestone("gold", actualRewardGold, updatedQuests);
    updatedQuests = checkQuestMilestone("experience", rewardExp, updatedQuests);

    setCombat(null);
    triggerAutosave(nextGold, expHealedParty, updatedQuests, items, activeZoneId, nextStats, nextMaterials);
  };

  // Player Defeat Flow (Soft game over, recovery back in town with slight fee)
  const loseBattle = () => {
    addLog("🚨 🚨 Critical Defeat: 警告！開拓隊伍健康指數全面崩潰，全體隊員斷線休克入死機睡眠狀態...", "gameover");

    // Restores default hero to 10% hp, others remain fainted. Recoveries back to town. Deducts 15% gold shield penalty.
    const penaltyFee = Math.round(gold * 0.15);
    const nextGold = Math.max(0, gold - penaltyFee);
    setGold(nextGold);

    const recoveredParty = party.map((member, idx) => {
      if (idx === 0) {
        // Hero is revived at 50% max HP
        return {
          ...member,
          hp: Math.round(member.maxHp * 0.5),
          mp: Math.round(member.maxMp * 0.3),
          isDead: false
        };
      }
      return member; // Companions remain knocked out (0 HP), requiring Tavern Sleep or Phoenix feathers!
    });

    setParty(recoveredParty);
    setCombat(null);

    addLog(`🛰️ 軌道救援艙迅速投射，已成功將隊伍拖回安全區。扣除 15% 搶修保障金卷 (-${penaltyFee} 金幣)。主角已被極限重啟復甦 (50% HP)，請妥善修補防線！`, "system");

    triggerAutosave(nextGold, recoveredParty, quests, items, activeZoneId, statistics);
  };

  // Escape combat safely
  const escapeCombat = () => {
    if (!combat) return;
    addLog(`🏃 警告！隊員釋放高頻擾空干擾，慌忙地在傳送覆蓋超載中逃離了與【${combat.monster.name}】的戰鬥。`, "system");
    setCombat(null);
  };

  // --- Auto-combat engine processor ---
  useEffect(() => {
    let timerId: NodeJS.Timeout;

    if (combat && combat.isAutoCombat) {
      const { monster, activePartyTurnIndex } = combat;
      const actor = party[activePartyTurnIndex];

      if (!actor || actor.hp <= 0 || actor.isDead) {
        // Skip dead teammate turn in next loop
        timerId = setTimeout(() => {
          passTurnToNextColleague();
        }, 250);
        return;
      }

      timerId = setTimeout(() => {
        // Deciding moves for AI
        const hasSkill = actor.activeSkill && actor.mp >= actor.activeSkill.mpCost;
        const skillProbability = Math.random() < 0.45; // 45% chance to cast elemental active skill

        if (hasSkill && skillProbability) {
          executeAllyAction("skill");
        } else {
          executeAllyAction("attack");
        }
      }, 900);
    }

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [combat?.activePartyTurnIndex, combat?.isAutoCombat, combat?.monster?.hp]);

  // Handle outside items target assignment inside Town panels
  const useItemOutOfCombat = (itemId: string, colleagueIndex: number) => {
    const item = items.find((i) => i.id === itemId);
    if (!item || item.count <= 0) return;

    const companion = party[colleagueIndex];
    if (!companion) return;

    // Apply outcomes
    let adjustedItems = items.map((i) => {
      if (i.id === itemId) return { ...i, count: i.count - 1 };
      return i;
    });
    setItems(adjustedItems);

    let logsText = "";
    const adjustedParty = party.map((m, idx) => {
      if (idx === colleagueIndex) {
        if (item.type === "healing") {
          const nextHp = Math.min(m.maxHp, m.hp + item.effectValue);
          logsText = `⚙️ 整備施效：【${m.name}】吸入奈米微觀治療素，恢復了 ${item.effectValue} HP。(HP: ${nextHp}/${m.maxHp})`;
          return { ...m, hp: nextHp, isDead: false };
        } else if (item.type === "mana") {
          const nextMp = Math.min(m.maxMp, m.mp + item.effectValue);
          logsText = `⚙️ 整備施效：【${m.name}】核心儲能格充盈其間，回復了 ${item.effectValue} MP。(MP: ${nextMp}/${m.maxMp})`;
          return { ...m, mp: nextMp };
        } else if (item.type === "revive") {
          if (m.hp <= 0 || m.isDead) {
            const revivedHp = Math.round(m.maxHp * 0.5);
            logsText = `⚙️ 程式逆重構成效：【${m.name}】原位啟動，注入 50% 核心生命波 (+${revivedHp} HP) 解除死機態！`;
            return { ...m, hp: revivedHp, isDead: false };
          } else {
            logsText = `⚠️ 施效偏振：【${m.name}】不處於死機態，量子羽毛注入僅溢出微弱的戰備抗磨抗性。`;
            return m;
          }
        }
      }
      return m;
    });

    setParty(adjustedParty);
    addLog(logsText, "player_action");
    setItemUsageTargetSelector({ isOpen: false, item: null });

    triggerAutosave(gold, adjustedParty, quests, adjustedItems, activeZoneId, statistics);
  };

  // --- Active Zone selection mapping ---
  const currentActiveZone = ZONES.find((z) => z.id === activeZoneId) || ZONES[0];

  return (
    <div className="w-full min-h-screen bg-[#070b13] text-[#cfd8e3] selection:bg-cyan-500 selection:text-slate-950 flex flex-col items-center justify-center py-0 md:py-6 px-0 sm:px-4 font-sans antialiased relative">
      
      {/* Background starry neon aesthetic mask */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-950/20 via-[#070b13] to-[#070b13] pointer-events-none z-0" />

      {/* Main retro future cabinet frame */}
      <div 
        id="mud-cabinet-viewport" 
        className="w-full max-w-6xl h-screen md:h-[82vh] md:max-h-[768px] xl:md:max-h-[820px] bg-slate-950/80 backdrop-blur-md rounded-none md:rounded-2xl border border-slate-800 shadow-2px shadow-cyan-950/50 flex flex-col overflow-hidden z-10 md:my-auto"
      >
        {showStartScreen ? (
          <div className="flex-grow flex flex-col items-center justify-center p-4 md:p-8 bg-[#090e18] font-mono relative overflow-y-auto select-none">
            {/* Ambient visual backdrops */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-950/20 via-[#090e18] to-[#090e18] pointer-events-none z-0" />
            <div className="absolute inset-x-0 top-1/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-1/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent pointer-events-none" />

            <div className="text-center relative z-10 max-w-lg mb-8 md:mb-10 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/20 text-cyan-400 text-[10px] uppercase font-bold tracking-widest animate-pulse">
                🌌 Cosmic Exploration Protocol Active
              </div>

              <h1 className="text-4xl md:text-5xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-200 to-amber-300 drop-shadow-md font-mono select-none">
                COSMIC ODYSSEY
              </h1>

              <p className="text-xs md:text-sm text-slate-405 font-sans tracking-wide">
                星區軌道臨界點開拓日誌 & 戰術控制終端 MUD
              </p>

              <div className="h-[2px] w-32 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent mx-auto mt-2" />
            </div>

            <div className="w-full max-w-xs relative z-10 space-y-3">
              {/* Load Save option */}
              <button
                id="btn-load-game"
                onClick={() => {
                  if (hasSave) {
                    setShowStartScreen(false);
                    addLog("📂 磁偏載入：玩家繼續了上次的宇宙探險波形！", "system");
                  }
                }}
                disabled={!hasSave}
                className={`w-full py-3.5 px-6 rounded-xl border text-xs font-bold font-mono tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  hasSave
                    ? "bg-cyan-500 text-slate-950 border-cyan-600 hover:bg-cyan-400 hover:scale-[1.02] shadow-lg shadow-cyan-950/45"
                    : "bg-slate-900 border-slate-850 text-slate-500 cursor-not-allowed opacity-40"
                }`}
              >
                📂 {hasSave ? "繼續/載入歷史波形" : "無本地存檔磁軌資訊"}
              </button>

              {/* Reset/New Game option */}
              <button
                id="btn-new-game"
                onClick={() => {
                  if (hasSave) {
                    setIsNewGameConfirmOpen(true);
                  } else {
                    resetGame();
                    setShowStartScreen(false);
                    addLog("🚀 開拓啟程：檢測到全新的空白宇宙信號，探險開始！", "system");
                  }
                }}
                className="w-full py-3.5 px-6 bg-slate-950 hover:bg-slate-900 text-slate-100 border border-slate-800 hover:border-cyan-500/30 rounded-xl text-xs font-bold font-mono tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02]"
              >
                🚀 建立全新探險 (New Odyssey)
              </button>

              {/* Show tutorial option */}
              <button
                id="btn-manual-toggle"
                onClick={() => setIsManualOpen(!isManualOpen)}
                className="w-full py-2.5 px-6 bg-slate-900/40 hover:bg-slate-850 text-slate-450 hover:text-slate-200 border border-slate-900 rounded-lg text-xs font-semibold font-mono tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                🛡️ 系統開拓指南 (Manual)
              </button>
            </div>

            {/* Manual block */}
            {isManualOpen && (
              <div 
                id="station-manual-panel"
                className="w-full max-w-lg mt-6 bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-xs space-y-2.5 relative z-10 text-slate-400 font-sans leading-relaxed text-left"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-1">
                  <span className="font-bold text-slate-200 font-mono flex items-center gap-1">⚔️ 星際拓荒指南 (Odyssey Manual)</span>
                  <button onClick={() => setIsManualOpen(false)} className="text-[10px] text-cyan-400 hover:underline">關閉</button>
                </div>
                <p>
                  1. <strong className="text-cyan-400">副本祕境</strong>：不同區域各具特色，包含<span className="text-orange-400">火</span>、<span className="text-emerald-400">草</span>、<span className="text-amber-500">土</span>、<span className="text-cyan-400">電</span>、<span className="text-blue-400">水</span>等相剋元素。弱點屬性反複克制可激發 200% 的 <strong className="text-orange-400">Critical 雙倍傷害</strong>！而被克制時則會觸發 <span className="text-blue-300">Guarded 減半</span> 機制。
                </p>
                <p>
                  2. <strong className="text-cyan-400">招募隊友</strong>：前往酒館招募更多不同元素親和的戰友（戰士、巫師、牧師、刺客等），配合戰局隨時切換。
                </p>
                <p>
                  3. <strong className="text-cyan-400">聖格覺醒</strong>：隊友達達 5 級後，可在鐵匠鋪奧義終端進行「聖格覺醒」，獲取全新強力覺醒奧義！
                </p>
              </div>
            )}

            {/* Confirm New Game Dialog */}
            {isNewGameConfirmOpen && (
              <div 
                id="new-game-confirm-modal"
                className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
              >
                <div className="w-full max-w-sm bg-slate-900 border border-red-900/50 rounded-xl p-5 md:p-6 space-y-4 text-center font-mono">
                  <h3 className="text-sm font-bold text-red-500 flex items-center justify-center gap-2">
                    ⚠️ 偵測到已有歷史進度！
                  </h3>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    確定要建立全新宇宙進度嗎？這將會<strong className="text-red-400 font-mono">徹底抹除並清除</strong>您當前所有的 credits、熔煉神器、與小隊等級！
                  </p>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => {
                        resetGame();
                        setShowStartScreen(false);
                        setIsNewGameConfirmOpen(false);
                        addLog("🚀 開拓重置：舊進度已清除，全新的宇宙之行已開啟！", "system");
                      }}
                      className="flex-1 py-2 px-3 bg-red-600 hover:bg-red-500 text-slate-950 font-bold rounded-lg text-xs cursor-pointer transition-colors"
                    >
                      確認覆寫
                    </button>
                    <button
                      onClick={() => setIsNewGameConfirmOpen(false)}
                      className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-755 text-slate-300 font-bold rounded-lg text-xs cursor-pointer transition-colors"
                    >
                      不，不重置
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom note */}
            <div className="mt-8 text-[9px] text-slate-600 font-mono uppercase tracking-widest text-center">
              🌌 COSMIC ODYSSEY retro mud engine v2.84 • all telemetry secure
            </div>
          </div>
        ) : (
          <>
            {/* TOP STATUS BAR Hailing Panel */}
            <header className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-500/15 animate-pulse">
                  <Activity className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h1 className="text-sm font-bold text-slate-100 uppercase tracking-widest font-mono flex items-center gap-1">
                    Cosmic Odyssey MUD <span className="text-[10px] text-cyan-400 font-normal px-1.5 py-0.5 rounded bg-cyan-950/50 border border-cyan-800/20">RETRO-JRPG</span>
                  </h1>
                  <p className="text-[10px] text-slate-500 font-mono tracking-tight">STATION ORBITAL TRANSCEIVER v2.84</p>
                </div>
              </div>

              {/* Quick Metrics */}
              <div className="flex items-center gap-3 sm:gap-6 text-xs font-mono">
                <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 shadow-inner">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span className="text-slate-500">CREDITS:</span>
                  <span className="text-amber-400 font-bold">{gold} <span className="text-[10px] text-amber-500/80">✨</span></span>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
                  <Activity className="w-3.5 h-3.5 text-rose-500" />
                  <span className="text-slate-500">PARTY:</span>
                  <span className="text-rose-400 font-bold">{party.length}/4</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[#3a4e69]">STATION CLOCK:</span>
                  <span className="text-emerald-400 font-semibold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-990/30 font-mono">
                    DAY {daysPassed}
                  </span>
                </div>
              </div>
            </header>

            <main id="station-cabinet-main-scroller" className={`flex-grow flex flex-col min-h-0 bg-[#080d16] ${combat ? "overflow-hidden" : "overflow-y-auto"}`}>
            {/* 🌟 RANDOM SPACE ENCOUNTER EVENT VIEW MODE ACTIVE (Full screen lockout style focus mode) */}
            {activeSpaceEvent ? (
              <div 
                id="space-event-workspace" 
                className="flex-1 p-4 md:p-8 bg-[#090e18] flex flex-col items-center justify-center font-mono relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-950/15 via-[#090e18] to-[#090e18] pointer-events-none" />
                
                {/* Pulsing retro laser grid line */}
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-cyan-500 via-indigo-500 to-cyan-500 animate-pulse z-20" />

                <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6 shadow-2xl relative z-10 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                      <Compass className="w-4 h-4 text-cyan-400 animate-spin" />
                    </div>
                    <div>
                      <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest block font-mono animate-pulse">📡 UNKNOWN RADIO CONTACT ANOMALY</span>
                      <h3 className="text-sm font-bold text-slate-100 font-mono tracking-tight">{activeSpaceEvent.title}</h3>
                    </div>
                  </div>

                  <div className="text-slate-300 text-xs md:text-sm leading-relaxed font-sans bg-slate-950/70 border border-slate-900 p-4 rounded-lg">
                    {activeSpaceEvent.description}
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-850">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">星軌指揮決策 (Choose your path):</div>
                    
                    {activeSpaceEvent.choices.map((choice) => {
                      const matchesBuyFeather = choice.actionId === "merchant_buy_feather" && gold < 80;
                      const isButtonDisabled = matchesBuyFeather;

                      return (
                        <button
                          key={choice.actionId}
                          onClick={() => handleSpaceEventChoice(choice.actionId)}
                          disabled={isButtonDisabled}
                          className={`w-full text-left p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                            isButtonDisabled
                              ? "bg-slate-950/50 border-slate-900/60 text-slate-600 cursor-not-allowed opacity-40"
                              : "bg-slate-950 border-slate-850 hover:bg-slate-900 hover:border-cyan-500/40 text-slate-200"
                          }`}
                        >
                          <div className="font-bold flex items-center justify-between text-cyan-400">
                            <span>{choice.text}</span>
                            {choice.actionId === "merchant_buy_feather" && <span className="text-amber-500 text-[10px] font-bold">費額: 80 ✨</span>}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-1 font-sans font-normal leading-relaxed">
                            {choice.hint}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : combat ? (
              <div 
                id="combat-workspace" 
                className="flex-grow flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-800 bg-[#0b101b] relative overflow-hidden"
              >
                {/* Danger indicator glow line */}
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-red-600 via-orange-500 to-red-600 animate-pulse z-20" />

            {/* Left side: Combat Screen Display Area */}
            <div className="flex-grow md:flex-1 p-2 sm:p-4 md:p-5 flex flex-col justify-between overflow-y-auto min-h-0">
              
              {/* Battle Header */}
              <div className="flex items-center justify-between mb-2 bg-slate-900/60 py-1.5 px-3 rounded-lg border border-slate-800/40 font-mono text-[10px] sm:text-xs shrink-0">
                <span className="text-red-400 font-bold tracking-widest flex items-center gap-1 uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                  🚨 ACTIVE THREAT
                </span>
                <span className="text-slate-400 flex items-center gap-1 text-[10px] sm:text-xs">
                  ROUND {combat.round} <ArrowRight className="w-3 h-3 text-slate-600" /> SEQUENCE PHASE
                </span>
                <div className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  <Compass className="w-3 h-3 text-cyan-400" />
                  <span className="text-[9px] sm:text-[10px] text-cyan-400 uppercase font-semibold">{ZONES.find(z => z.id === combat.zoneId)?.name.split(" ")[0]}</span>
                </div>
              </div>

              {/* MONSTER ACTIVE OPPONENT CARD */}
              <div className="w-full max-w-xl mx-auto py-1 sm:py-2">
                <div className={`bg-slate-900 border border-red-950/60 rounded-xl p-3 sm:p-4 shadow-xl relative overflow-hidden transition-all ${
                  isRecentlyAttacked(0, true) ? "animate-shake-hurt" : ""
                }`}>
                  {/* Elemental badge background radial light */}
                  <div className={`absolute -right-8 -bottom-8 w-24 h-24 opacity-10 rounded-full blur-xl ${
                    combat.monster.element === "Fire" ? "bg-orange-500" :
                    combat.monster.element === "Plant" ? "bg-emerald-500" :
                    combat.monster.element === "Earth" ? "bg-amber-500" :
                    combat.monster.element === "Electric" ? "bg-cyan-500" : "bg-blue-500"
                  }`} />

                  {/* Threat level stats label */}
                  <div className="flex items-start justify-between relative z-10 gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-950 border border-red-500/20 flex items-center justify-center text-2xl sm:text-3xl shadow-inner relative shrink-0">
                        {combat.monster.emoji}
                        {/* Monster active elemental tag badge */}
                        <span className="absolute -bottom-1 -right-1 text-[10px] sm:text-xs">{getElementEmoji(combat.monster.element)}</span>
                      </div>
                      <div>
                        <h2 className="text-slate-100 font-bold text-xs sm:text-sm tracking-wide font-mono flex items-center gap-1">
                          {combat.monster.name}
                        </h2>
                        <span className={`text-[9px] sm:text-[10px] font-mono px-1.5 py-0.2 rounded border ${getElementColorClass(combat.monster.element)}`}>
                          AFFINITY: {getElementLabel(combat.monster.element)}
                        </span>
                      </div>
                    </div>

                    <div className="text-right font-mono text-[10px] sm:text-xs shrink-0">
                      <p className="text-amber-400 font-semibold">{combat.monster.rewardGold} ✨ CREDITS</p>
                      <p className="text-violet-400">+{combat.monster.rewardExp} EXP</p>
                    </div>
                  </div>

                  {/* Monster HP visual bar (neon styled) */}
                  <div className="mt-2.5 sm:mt-4">
                    <div className="flex items-center justify-between text-[10px] sm:text-xs font-mono text-slate-400 mb-0.5 sm:mb-1">
                      <span>MONSTER BARRIER (HP)</span>
                      <span className="font-bold text-red-400">{combat.monster.hp} / {combat.monster.maxHp}</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-950 border border-slate-800 rounded-full overflow-hidden p-0.5">
                      <div 
                        className="h-full bg-gradient-to-r from-red-600 to-rose-450 rounded-full transition-all duration-300 relative shadow-inner"
                        style={{ width: `${Math.max(0, (combat.monster.hp / combat.monster.maxHp) * 100)}%` }}
                      >
                        {/* Charging neon highlights */}
                        <div className="absolute inset-0 bg-white/10 animate-pulse" />
                      </div>
                    </div>
                  </div>

                  <p className="mt-2 text-slate-400 text-[10px] sm:text-xs italic leading-normal font-sans opacity-95 line-clamp-2 md:line-clamp-none">
                    💬 「{combat.monster.description}」
                  </p>

                  {/* Combat Animated floating numbers overlay layer */}
                  <div className="absolute inset-0 pointer-events-none z-30">
                    {combat.damageNumbers
                      .filter(num => num.isMonsterTarget)
                      .map((num) => (
                        <div
                          key={num.id}
                          className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 text-2xl font-black font-mono tracking-wider float-anime-up"
                        >
                          <span className={`px-2.5 py-1 text-base sm:text-2xl rounded-lg border shadow-2xl ${
                            num.type === "critical"
                              ? "text-orange-400 bg-orange-950/90 border-orange-500 scale-110 text-xl sm:text-3xl font-extrabold"
                              : num.type === "guarded"
                              ? "text-blue-300 bg-slate-900/95 border-slate-700 text-base opacity-80"
                              : "text-red-500 bg-slate-950/90 border-red-500"
                          }`}>
                            {num.text}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* ACTION COMMAND CONTROLLER PANEL FOR PLAYER COHORT */}
              <div className="mt-1.5 sm:mt-2.5 border-t border-slate-850 pt-2 sm:pt-3 max-w-xl mx-auto w-full shrink-0">
                
                {/* Auto combat switch bar */}
                <div className="flex items-center justify-between bg-slate-900/60 px-2 py-1 rounded-lg border border-slate-850 mb-2 text-xs">
                  <span className="font-mono text-slate-400 text-[10px] sm:text-[11px] flex items-center gap-1 pr-2">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-500 shrink-0 hidden sm:inline" />
                    <span className="hidden sm:inline">開荒提示：自動戰鬥由極小核心 AI 託管。</span>
                    <span className="inline sm:hidden">📡 戰術 AI 託管狀態系統</span>
                  </span>

                  <button
                    onClick={() => {
                      setCombat((prev) => {
                        if (!prev) return null;
                        return { ...prev, isAutoCombat: !prev.isAutoCombat };
                      });
                      addLog(`⚙️ 戰術信號：${!combat.isAutoCombat ? "【開啟自動戰鬥】AI 現已接管當前回合指令代行！" : "【關閉自動戰鬥】返回手動排兵布陣面板。"}`, "system");
                    }}
                    className={`px-2.5 py-1 rounded font-mono font-bold text-[10px] sm:text-xs transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                      combat.isAutoCombat
                        ? "bg-amber-500 text-slate-950 shadow-lg hover:bg-amber-400"
                        : "bg-slate-850 hover:bg-slate-800 text-slate-300"
                    }`}
                  >
                    <Bot className="w-3 h-3" />
                    {combat.isAutoCombat ? "AI ON" : "AI OFF"}
                  </button>
                </div>

                {/* Main operational panel commands */}
                {party[combat.activePartyTurnIndex] && !combat.isAutoCombat ? (
                  (() => {
                    const activeHero = party[combat.activePartyTurnIndex];
                    return (
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 sm:p-3 shadow-lg shadow-inner">
                        <div className="flex items-center justify-between mb-1.5 sm:mb-2 border-b border-slate-800 pb-1.5">
                          <div className="flex items-center gap-1">
                            <span className="text-xs sm:text-sm">{getElementEmoji(activeHero.element)}</span>
                            <span className="font-bold text-slate-100 font-mono text-xs sm:text-sm">{activeHero.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">({activeHero.title})</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono">
                            <span className="text-emerald-400 font-semibold">HP {activeHero.hp}/{activeHero.maxHp}</span>
                            <span className="text-slate-600">|</span>
                            <span className="text-cyan-400 font-semibold">MP {activeHero.mp}/{activeHero.maxMp}</span>
                          </div>
                        </div>

                        {/* Interactive Combat action grid */}
                        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                          
                          <button
                            id="btn-action-attack"
                            onClick={() => executeAllyAction("attack")}
                            className="bg-slate-950 hover:bg-slate-850 text-rose-400 border border-rose-950 py-2 sm:py-2.5 rounded-lg flex items-center justify-center gap-1 hover:border-rose-700/60 font-semibold cursor-pointer transition-all"
                          >
                            <Sword className="w-3.5 h-3.5 text-rose-500" />
                            🗡️ 普攻 (Physical)
                          </button>

                          <button
                            id="btn-action-skill"
                            onClick={() => executeAllyAction("skill")}
                            disabled={activeHero.mp < activeHero.activeSkill.mpCost}
                            className={`py-2 sm:py-2.5 rounded-lg border flex flex-col items-center justify-center cursor-pointer transition-all ${
                              activeHero.mp >= activeHero.activeSkill.mpCost
                                ? "bg-cyan-950/40 text-cyan-400 hover:bg-cyan-900/50 border-cyan-800/60"
                                : "bg-slate-950 text-slate-600 border-slate-900 cursor-not-allowed"
                            }`}
                          >
                            <span className="font-semibold flex items-center gap-1 text-[11px] sm:text-xs">
                              <Sparkles className="w-3 h-3 text-cyan-400" />
                              🔮 {activeHero.activeSkill.name} (MP: {activeHero.activeSkill.mpCost})
                            </span>
                          </button>

                          {/* Inventory Consumables quick tray inside combat */}
                          <div className="col-span-2 mt-0.5">
                            <p className="text-[9px] text-slate-500 mb-0.5 font-mono uppercase tracking-wider">戰備應急背包藥水 (Consumables)</p>
                            <div className="grid grid-cols-3 gap-1.5">
                              {items.map((it) => {
                                const hasQuantity = it.count > 0;
                                return (
                                  <button
                                    key={it.id}
                                    onClick={() => executeAllyAction("item", it.id)}
                                    disabled={!hasQuantity}
                                    className={`py-1 sm:py-1.5 px-2 rounded-lg border text-left flex items-center gap-1 justify-between transition-all ${
                                      hasQuantity
                                        ? "bg-slate-950 border-slate-800 text-slate-200 hover:bg-slate-850 hover:border-slate-700 cursor-pointer"
                                        : "bg-slate-950/40 border-slate-900/60 text-slate-600 cursor-not-allowed"
                                    }`}
                                  >
                                    <span className="truncate flex items-center gap-1 text-[10px] sm:text-xs">
                                      <span>{it.emoji}</span>
                                      <span className="truncate">{it.name.substring(4)}</span>
                                    </span>
                                    <span className={`px-1 rounded font-bold text-[9px] sm:text-[10px] shrink-0 ${
                                      hasQuantity ? "bg-cyan-950 text-cyan-400 border border-cyan-900" : "bg-slate-900 text-slate-500"
                                    }`}>
                                      x{it.count}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                        </div>
                      </div>
                    );
                  })()
                ) : (
                  combat.isAutoCombat ? (
                    <div className="bg-amber-950/20 border border-amber-900/40 rounded-xl p-3 sm:p-4 text-center font-mono text-amber-400 text-xs shadow-inner animate-pulse">
                      ⏳ 自動戰術處理中 (AUTO COMBAT ENGAGED) - AI 正在演算並代行戰魂卡牌...
                    </div>
                  ) : (
                    <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 text-center text-slate-500 font-mono text-xs">
                      ⚡ 角色正在調度，請稍候下一位夥伴回合
                    </div>
                  )
                )}

                {/* Back to orbital / safety button */}
                <div className="mt-2 flex justify-center">
                  <button
                    onClick={escapeCombat}
                    className="text-[10px] sm:text-[11px] font-mono text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer py-1 px-2.5 border border-slate-900 hover:border-red-950/60 rounded bg-slate-950/40"
                  >
                    <AlertTriangle className="w-3 h-3 text-orange-500" />
                    🚨 逃離並撤銷副本通道 (Flee Combat)
                  </button>
                </div>

              </div>
            </div>

            {/* Right side: Combat Logs & party status */}
            <div className="w-full md:w-[360px] p-3 sm:p-4 flex flex-col justify-between shrink-0 h-[220px] md:h-full bg-slate-950 relative overflow-y-auto min-h-0">
              
              {/* Dynamic list of fighting party members (cards side by side or list) */}
              <div className="space-y-2 mb-4">
                <h3 className="text-xs font-semibold text-slate-400 font-mono uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  我方出戰戰術縱隊成員
                </h3>

                {party.map((colle, idx) => {
                  const isActiveTurn = combat.activePartyTurnIndex === idx && !combat.isAutoCombat;
                  const isKnockedOut = colle.hp <= 0 || colle.isDead;

                  return (
                    <div
                      key={colle.id}
                      className={`p-2.5 rounded-lg border transition-all relative ${
                        isRecentlyAttacked(idx, false)
                          ? "animate-shake-hurt"
                          : isRecentlyHealed(idx, false)
                          ? "animate-shake-heal"
                          : ""
                      } ${
                        isActiveTurn
                          ? "bg-cyan-950/30 border-cyan-500 shadow-lg shadow-cyan-950"
                          : isKnockedOut
                          ? "bg-red-950/10 border-red-950/60 opacity-60"
                          : "bg-slate-900/80 border-slate-800"
                      }`}
                    >
                      {/* Active green arrow breathing glow */}
                      {isActiveTurn && (
                        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      )}

                      <div className="flex items-center justify-between font-mono text-xs mb-1.5">
                        <div className="flex items-center gap-1">
                          <span>{getElementEmoji(colle.element)}</span>
                          <span className={`font-bold ${isKnockedOut ? "text-slate-500 line-through" : "text-slate-200"}`}>
                            {colle.name.split(" ")[0]} 
                          </span>
                          <span className="text-[10px] text-slate-500 font-normal">LV.{colle.lv}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 bg-slate-950 px-1 rounded border border-slate-850">
                          {colle.className}
                        </span>
                      </div>

                      {/* HP Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-mono leading-none">
                          <span className="text-slate-500">HEALTH HP</span>
                          <span className={isKnockedOut ? "text-red-500" : "text-emerald-400 font-semibold"}>
                            {colle.hp} / {colle.maxHp}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isKnockedOut ? "bg-slate-800" : colle.hp / colle.maxHp < 0.3 ? "bg-rose-500" : "bg-emerald-500"
                            }`}
                            style={{ width: `${Math.max(0, (colle.hp / colle.maxHp) * 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* MP Bar */}
                      <div className="space-y-1 mt-1.5">
                        <div className="flex items-center justify-between text-[10px] font-mono leading-none">
                          <span className="text-slate-500">ENERGY MP</span>
                          <span className="text-cyan-400 font-semibold">
                            {colle.mp} / {colle.maxMp}
                          </span>
                        </div>
                        <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                            style={{ width: `${Math.max(0, (colle.mp / colle.maxMp) * 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Overlay damage text animation container on ally */}
                      {combat.damageNumbers
                        .filter(num => !num.isMonsterTarget && num.targetIndex === idx)
                        .map((num) => (
                          <div
                            key={num.id}
                            className="absolute inset-0 bg-slate-950/90 flex items-center justify-center rounded-lg font-mono font-black border border-red-500 text-lg text-rose-500 z-20 animate-pulse duration-150"
                          >
                            {num.text}
                          </div>
                        ))}
                    </div>
                  );
                })}
              </div>

              {/* LIVE ACTION REAL-TIME SCROLLING LOGS SCREEN */}
              <div className="flex-1 flex flex-col justify-end min-h-[140px] bg-slate-900/60 rounded-xl border border-slate-850 p-3 overflow-hidden">
                <p className="text-[10px] text-slate-500 font-mono mb-2 uppercase tracking-wide flex items-center gap-1 border-b border-slate-850 pb-1">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  戰場瞬時日誌數據流 (NARRATIVE FLOW)
                </p>
                
                <div 
                  ref={logConsoleRef}
                  className="flex-1 overflow-y-auto space-y-1.5 max-h-[160px] text-[11px] font-mono leading-relaxed text-slate-300 pr-1 select-none"
                >
                  {narrativeLogs.slice(-15).map((log) => {
                    let textTheme = "text-slate-400";
                    if (log.type === "critical") textTheme = "text-orange-400 font-bold bg-orange-950/20 px-1 py-0.5 rounded border border-orange-900/10";
                    if (log.type === "player_action") textTheme = "text-[#88b0eb]";
                    if (log.type === "monster_action") textTheme = "text-rose-400";
                    if (log.type === "victory") textTheme = "text-emerald-400 font-semibold";
                    if (log.type === "gameover") textTheme = "text-red-400 font-semibold";
                    if (log.type === "system") textTheme = "text-cyan-400";

                    return (
                      <div key={log.id} className={`${textTheme} break-words`}>
                        {log.text}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        ) : (
          
          /* =========================================================================
             TOWN VIEW MODE ACTIVE (Tavern, Shop, Exploration Setup, Quest Board)
             ======================================================================== */
          <div className="flex-1 flex flex-col md:flex-row min-h-0 bg-[#080d16] divide-y md:divide-y-0 md:divide-x divide-slate-800">
            
            {/* Left Column Navigation command panels */}
            <div className="w-full md:w-[35%] p-4 flex flex-col justify-between shrink-0 bg-slate-900/40 overflow-y-auto min-h-0">
              
              <div className="space-y-4">
                
                {/* Visual command selection tab group */}
                <div className="grid grid-cols-4 gap-1.5 font-mono text-center">
                  
                  <button
                    id="btn-tab-explore"
                    onClick={() => { setActiveTab("explore"); setItemUsageTargetSelector({ isOpen: false, item: null }); }}
                    className={`py-3.5 rounded-lg border text-xs flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      activeTab === "explore"
                        ? "bg-cyan-950/40 border-cyan-500 text-cyan-400 font-bold shadow-lg shadow-cyan-950"
                        : "bg-slate-950 border-slate-850 hover:bg-slate-900 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Compass className="w-4 h-4" />
                    <span>祕境探索</span>
                  </button>

                  <button
                    id="btn-tab-tavern"
                    onClick={() => { setActiveTab("tavern"); setItemUsageTargetSelector({ isOpen: false, item: null }); }}
                    className={`py-3.5 rounded-lg border text-xs flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      activeTab === "tavern"
                        ? "bg-purple-950/40 border-purple-500 text-purple-400 font-bold shadow-lg shadow-purple-950"
                        : "bg-slate-950 border-slate-850 hover:bg-slate-900 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>太空酒館</span>
                  </button>

                  <button
                    id="btn-tab-blacksmith"
                    onClick={() => { setActiveTab("blacksmith"); setItemUsageTargetSelector({ isOpen: false, item: null }); }}
                    className={`py-3.5 rounded-lg border text-xs flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      activeTab === "blacksmith"
                        ? "bg-amber-950/45 border-amber-500 text-amber-500 font-bold shadow-lg shadow-amber-950"
                        : "bg-slate-950 border-slate-850 hover:bg-slate-900 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Hammer className="w-4 h-4" />
                    <span>鍛造商店</span>
                  </button>

                  <button
                    id="btn-tab-quests"
                    onClick={() => { setActiveTab("quests"); setItemUsageTargetSelector({ isOpen: false, item: null }); }}
                    className={`py-3.5 rounded-lg border text-xs flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      activeTab === "quests"
                        ? "bg-emerald-950/40 border-emerald-500 text-emerald-400 font-bold shadow-lg shadow-emerald-950"
                        : "bg-slate-950 border-slate-850 hover:bg-slate-900 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Scroll className="w-4 h-4" />
                    <span>公會公告</span>
                  </button>

                </div>

                <hr className="border-slate-850 my-1" />

                {/* TAB WINDOW COMPONENT 1: EXPLORE PLACES */}
                {activeTab === "explore" && (
                  <div className="space-y-3 font-mono">
                    <div className="bg-slate-950 border border-slate-850 px-3 py-2 rounded-lg text-xs leading-relaxed text-slate-400">
                      <p className="font-semibold text-slate-200 mb-1">🧭 副本祕境探索部署 (Deploy Radar)</p>
                      選擇下方深空座標信號，點選「出戰群體打怪」隨即切換重整進攻面板。注意等級限制！
                    </div>

                    {/* NEW: Stellar Signal Decryption Widget */}
                    <div className="p-3 bg-slate-900 border border-cyan-500/20 rounded-xl space-y-2 shadow-inner">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-cyan-400 flex items-center gap-1.5 uppercase font-mono">
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                          📡 宇宙黑匣子信號解碼儀 (Cosmic Decrypter)
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-850">
                          DECRYPTED: {decryptedLogIds.length} / {LORE_RECORDS.length}
                        </span>
                      </div>

                      <p className="text-[10px] text-slate-400 leading-normal font-sans">
                        破解古代波形，獲取<strong className="text-amber-400 font-mono">深空祕案與各星區弱點情報</strong>，更可免費解析高額<strong className="text-cyan-400 font-mono">能量券、Stardust shards等戰備資源</strong>！
                      </p>

                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        {LORE_RECORDS.map((log) => {
                          const isDecrypted = decryptedLogIds.includes(log.id);
                          const leaderLevel = party[0]?.lv || 1;
                          const isUnlockable = leaderLevel >= log.unlockedAtLv;

                          if (isDecrypted) {
                            return (
                              <button
                                key={log.id}
                                onClick={() => setActiveLoreDetail(log)}
                                className="p-2 bg-slate-950/80 text-emerald-400 border border-emerald-500/20 rounded-lg hover:border-emerald-500/40 hover:bg-[#070d18] text-left transition-all cursor-pointer flex flex-col justify-between h-[64px]"
                              >
                                <span className="text-[8px] font-bold tracking-wider font-mono opacity-60 flex items-center gap-1">
                                  🟢 {log.codename}
                                </span>
                                <span className="text-[10px] font-bold text-slate-200 truncate w-full">
                                  {log.title.replace(/[【】]/g, "")}
                                </span>
                                <span className="text-[8px] text-emerald-500 mt-1 hover:underline self-end">
                                  📖 讀取資訊
                                </span>
                              </button>
                            );
                          } else if (isUnlockable) {
                            return (
                              <button
                                key={log.id}
                                onClick={() => {
                                  const updated = [...decryptedLogIds, log.id];
                                  setDecryptedLogIds(updated);
                                  log.getReward(setGold, setMaterials);
                                  addLog(`🔓 [星曆破譯] ${log.codename} 成功還原星區背景! 獲得：${log.rewardText}`, "system");
                                  triggerAutosave(gold, party, quests, items, activeZoneId, statistics, materials, craftedArtifactIds, claimedAchievementIds, updated);
                                }}
                                className="p-2 bg-[#091e33]/40 text-cyan-400 border border-cyan-500/40 rounded-lg hover:bg-[#0f2a47] text-left transition-all cursor-pointer flex flex-col justify-between h-[64px] animate-pulse"
                                title="點擊破譯獲取資源"
                              >
                                <span className="text-[8px] font-bold tracking-wider font-mono opacity-80">
                                  📡 {log.codename}
                                </span>
                                <span className="text-[9px] font-semibold text-slate-300 truncate w-full">
                                  可解鎖此頻譜...
                                </span>
                                <span className="text-[8px] text-cyan-300 font-extrabold flex items-center gap-0.5 self-end bg-cyan-950 px-1 py-0.2 rounded border border-cyan-900">
                                  ⚡ 破譯軌道
                                </span>
                              </button>
                            );
                          } else {
                            return (
                              <div
                                key={log.id}
                                className="p-2 bg-slate-950/20 text-slate-500 border border-slate-900 rounded-lg text-left flex flex-col justify-between h-[64px] opacity-50"
                              >
                                <span className="text-[8px] font-bold tracking-wider font-mono opacity-50">
                                  🔒 {log.codename}
                                </span>
                                <span className="text-[9px] text-slate-600 truncate w-full">
                                  信號未解禁
                                </span>
                                <span className="text-[8px] text-red-500/80 font-mono self-end">
                                  先鋒需達 Lv.{log.unlockedAtLv}
                                </span>
                              </div>
                            );
                          }
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {ZONES.map((zone) => {
                        const isUnlocked = party[0].lv >= zone.minLevel;
                        let elementStyle = getElementColorClass(zone.element);

                        return (
                          <div
                            key={zone.id}
                            className={`p-3 rounded-lg border transition-all ${
                              activeZoneId === zone.id
                                ? `bg-slate-900 border-cyan-500/60 shadow-md`
                                : isUnlocked
                                ? "bg-slate-950 border-slate-850 hover:bg-slate-900/60"
                                : "bg-slate-950/30 border-slate-950 opacity-50"
                            }`}
                          >
                            <div className="flex items-start justify-between font-mono text-xs">
                              <div>
                                <h4 className="font-bold text-slate-200 flex items-center gap-1">
                                  <span>{getElementEmoji(zone.element)}</span>
                                  {zone.name}
                                </h4>
                                <span className={`text-[9px] px-1.5 py-0.2 rounded border  inline-block mt-1 ${elementStyle}`}>
                                  ELEMENT: {zone.element.toUpperCase()}
                                </span>
                              </div>

                              <span className={`text-[10px] font-mono font-bold ${isUnlocked ? "text-slate-400" : "text-rose-500"}`}>
                                {isUnlocked ? `REQ.LV ${zone.minLevel}` : `🚨 REQ.LV ${zone.minLevel}`}
                              </span>
                            </div>

                            <p className="mt-1.5 text-[11px] text-slate-450 leading-snug font-sans">
                              {zone.description}
                            </p>

                            {/* Monster species listing */}
                            <div className="mt-2 flex flex-wrap gap-1 items-center text-[10px] text-slate-500 font-mono">
                              <span className="text-[9px] text-[#3e5677] uppercase font-bold pr-1">棲息物種:</span>
                              {zone.monsters.map((key) => {
                                const m = MONSTER_TEMPLATES[key];
                                if (!m) return null;
                                return (
                                  <span key={key} className="bg-slate-900 border border-slate-850 px-1.5 py-0.5 rounded text-slate-300">
                                    {m.emoji} {m.name.substring(0, 4)} ({getElementEmoji(m.element)})
                                  </span>
                                );
                              })}
                            </div>

                            <div className="mt-3 flex items-center justify-between gap-2 pt-2.5 border-t border-slate-900">
                              <button
                                onClick={() => setActiveZoneId(zone.id)}
                                disabled={!isUnlocked}
                                className={`text-[10px] px-2.5 py-1 rounded border font-bold uppercase transition-all cursor-pointer ${
                                  activeZoneId === zone.id
                                    ? "bg-cyan-500 hover:bg-cyan-400 text-slate-950 border-cyan-400 font-black shadow-cyan-950"
                                    : isUnlocked
                                    ? "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                                    : "bg-slate-950 text-slate-600 border-slate-950 cursor-not-allowed"
                                }`}
                              >
                                {activeZoneId === zone.id ? "● 鎖定當前探測" : "設為探索錨點"}
                              </button>

                              <button
                                onClick={() => {
                                  setActiveZoneId(zone.id);
                                  startCombat(zone.id);
                                }}
                                disabled={!isUnlocked}
                                className={`text-[11px] font-bold font-mono px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                                  isUnlocked
                                    ? "bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-950/50"
                                    : "bg-slate-950 text-slate-600 border-slate-950 cursor-not-allowed"
                                }`}
                              >
                                <Play className="w-3 h-3 text-white fill-white" />
                                開始打群架衝等
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* TAB WINDOW COMPONENT 2: TAVERN RECRUITMENT */}
                {activeTab === "tavern" && (
                  <div className="space-y-3 font-mono">
                    <div className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-xs leading-relaxed text-slate-400">
                      <p className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                        <Coffee className="w-3.5 h-3.5 text-[#cfb794]" /> 太空酒館休眠艙 (Tavern Bar)
                      </p>
                      僱用高能克制屬性夥伴。戰死重傷的友軍夥伴，可在此實施「深度能量保養 (休息)」滿血安全甦醒！
                    </div>

                    <button
                      onClick={restAtTavern}
                      className="w-full bg-[#1b2b2b] hover:bg-[#253d3d] text-emerald-400 border border-emerald-900 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold font-mono tracking-wider transition-all cursor-pointer shadow-md shadow-inner"
                    >
                      <Coffee className="w-4 h-4 text-emerald-400" />
                      💤 客棧修整 (Tavern Rest) (花費 {party.length * 15} 金幣)
                    </button>

                    <h4 className="text-xs font-bold text-slate-400 pt-2 flex items-center gap-1 uppercase tracking-wider">
                      <UserPlus className="w-3.5 h-3.5 text-purple-400" /> 招募太空戰備夥伴 (100金幣/名)
                    </h4>

                    {/* Recruitable list */}
                    <div className="space-y-2.5">
                      {RECRUITABLE_COMPANIONS.map((candidate) => {
                        const isEnlisted = party.some((m) => m.className === candidate.className);

                        return (
                          <div
                            key={candidate.id}
                            className={`p-3 rounded-lg border bg-slate-950/80 transition-all ${
                              isEnlisted ? "border-slate-850 opacity-75" : "border-slate-850 hover:border-slate-800"
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h5 className="font-mono font-bold text-slate-100 flex items-center gap-1.5 text-xs">
                                  <span>{getElementEmoji(candidate.element)}</span>
                                  {candidate.name}
                                </h5>
                                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                                  職業：{candidate.className} ({candidate.title})
                                </p>
                              </div>
                              <span className={`text-[10px] font-mono px-1.5 rounded border ${getElementColorClass(candidate.element)}`}>
                                {candidate.element}
                              </span>
                            </div>

                            <p className="mt-1.5 text-[11px] text-slate-450 leading-relaxed font-sans">
                              ⚔️ 技能: <span className="font-bold text-cyan-400">【{candidate.activeSkill.name}】</span>: {candidate.activeSkill.description}
                            </p>

                            <div className="mt-2 flex items-center justify-between font-mono text-[10px] bg-slate-950 p-1.5 rounded border border-slate-900/60 text-slate-400">
                              <span>生命 (HP): {candidate.hp}</span>
                              <span>法術 (MP): {candidate.mp}</span>
                              <span>面板 (ATK): {candidate.atk}</span>
                            </div>

                            <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-900 text-xs">
                              <span className="text-amber-400 font-bold font-mono text-[11px]">聘金: 100 ✨ 金幣</span>

                              <button
                                onClick={() => recruitCompanion(candidate.id)}
                                disabled={isEnlisted || party.length >= 4 || gold < 100}
                                className={`px-3 py-1.5 rounded font-bold transition-all text-[11px] cursor-pointer ${
                                  isEnlisted
                                    ? "bg-slate-900 text-slate-500 border border-slate-850 cursor-not-allowed"
                                    : party.length >= 4
                                    ? "bg-slate-900 text-slate-600 border border-slate-850 cursor-not-allowed"
                                    : "bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-950"
                                }`}
                              >
                                {isEnlisted ? "已在隊伍中" : party.length >= 4 ? "隊伍人數已滿" : "簽訂僱用印信"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* TAB WINDOW COMPONENT 3: BLACKSMITH & SHOP */}
                {activeTab === "blacksmith" && (
                  <div className="space-y-3 font-mono">
                    
                    {/* Smithy Sub-Tabs Navigation */}
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        onClick={() => setSmithySubTab("forge")}
                        className={`py-1.5 px-3 text-xs font-bold rounded-md border text-center transition-all cursor-pointer ${
                          smithySubTab === "forge"
                            ? "bg-amber-500 border-amber-600 text-slate-950"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                        }`}
                      >
                        🏪 戰備物資
                      </button>
                      <button
                        onClick={() => setSmithySubTab("alchemy")}
                        className={`py-1.5 px-3 text-xs font-bold rounded-md border text-center transition-all cursor-pointer ${
                          smithySubTab === "alchemy"
                            ? "bg-amber-500 border-amber-600 text-slate-950"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                        }`}
                      >
                        🧪 鍊金合成
                      </button>
                      <button
                        onClick={() => setSmithySubTab("awaken")}
                        className={`py-1.5 px-3 text-xs font-bold rounded-md border text-center transition-all cursor-pointer ${
                          smithySubTab === "awaken"
                            ? "bg-amber-500 border-amber-600 text-slate-950"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                        }`}
                      >
                        ☀️ 聖格覺醒
                      </button>
                    </div>

                    {smithySubTab === "forge" && (
                      <div className="space-y-3">
                        {/* Gear / blacksmith upgrade tab header */}
                        <div className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-xs leading-relaxed text-slate-400">
                          <p className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                            <Hammer className="w-3.5 h-3.5 text-amber-500" /> 旺角超臨界鐵匠鋪 (Smithy Forge)
                          </p>
                          使用能源金幣，提升武力面板與合金防護強度。等級越高，強化所需金幣費額增加。
                        </div>

                        <div className="space-y-2 bg-slate-900/40 p-2.5 rounded-lg border border-slate-850">
                          <h4 className="text-xs font-bold text-slate-300 pb-1 flex items-center gap-1.5 uppercase tracking-wider">
                            🛡️ 戰略消耗儲備補給 (Blacksmith Store)
                          </h4>

                          {items.map((it) => {
                            return (
                              <div
                                key={it.id}
                                className="p-2 rounded bg-slate-950 border border-slate-900 flex items-center justify-between text-xs font-mono"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-xl shrink-0">{it.emoji}</span>
                                  <div className="truncate">
                                    <h5 className="font-bold text-slate-100 truncate">{it.name}</h5>
                                    <p className="text-[9px] text-slate-550 truncate">{it.description.substring(0, 32)}...</p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 font-bold ml-2">
                                  <div className="text-right">
                                    <span className="text-amber-400 text-[11px] block">{it.price} ✨</span>
                                    <span className="text-[10px] text-slate-500">擁有: x{it.count}</span>
                                  </div>

                                  <div className="flex flex-col gap-1">
                                    <button
                                      onClick={() => buyConsumable(it.id)}
                                      disabled={gold < it.price}
                                      className="px-1.5 py-0.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-400 rounded text-[10px] cursor-pointer"
                                    >
                                      購買
                                    </button>
                                    {it.count > 0 && (
                                      <button
                                        onClick={() => sellConsumable(it.id)}
                                        className="px-1.5 py-0.5 bg-amber-950 hover:bg-amber-900 border border-amber-900 text-amber-400 rounded text-[10px] cursor-pointer"
                                      >
                                        回收
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {smithySubTab === "alchemy" && (
                      <div className="space-y-3">
                        <div className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-xs leading-relaxed text-slate-400">
                          <p className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                            <Compass className="w-3.5 h-3.5 text-amber-500" /> 太空探險殘骸物資儲量 (Cargo Leftovers)
                          </p>
                          可在探險各祕境擊敗怪獸機體、或者在空間亂流隨機奇遇中獲得以下高能殘骸：
                          <div className="grid grid-cols-2 gap-1.5 mt-2.5">
                            {Object.keys(MATERIALS).map(matId => {
                              const mat = MATERIALS[matId];
                              const qty = materials[matId] || 0;
                              return (
                                <div key={matId} className="bg-slate-900 px-2 py-1 border border-slate-800 rounded flex items-center justify-between text-[11px]">
                                  <span className="text-slate-300 flex items-center gap-1">
                                    <span>{mat.emoji}</span>
                                    <span>{mat.name}</span>
                                  </span>
                                  <span className="text-amber-400 font-bold font-mono">x{qty}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="space-y-2.5">
                          <h4 className="text-xs font-bold text-slate-300 pb-1 flex items-center gap-1.5 uppercase tracking-wider">
                            🛡️ 精密星空神器鑄造 (Craft Artifacts)
                          </h4>
                          {Object.keys(ARTIFACTS).map(artId => {
                            const art = ARTIFACTS[artId];
                            const alreadyHave = craftedArtifactIds.includes(artId);
                            const goldMet = gold >= art.recipe.gold;
                            const matsMet = Object.keys(art.recipe.materials).every(matId => (materials[matId] || 0) >= art.recipe.materials[matId]);
                            const canCraft = goldMet && matsMet && !alreadyHave;

                            return (
                              <div key={artId} className={`p-3 rounded-lg border bg-slate-950 text-xs ${alreadyHave ? "border-amber-600/60 bg-amber-950/10" : "border-slate-850"}`}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                                    <span className="text-base">{art.emoji}</span>
                                    <span className="text-amber-400">{art.name}</span>
                                  </span>
                                  {alreadyHave ? (
                                    <span className="text-[10px] bg-amber-950 text-amber-300 px-1.5 py-0.2 rounded border border-amber-805">已生效</span>
                                  ) : (
                                    <span className="text-[10px] bg-slate-900 text-slate-400 px-1.5 py-0.2 rounded">未擁有</span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-400 mb-2 leading-relaxed font-sans">{art.description}</p>
                                
                                <div className="bg-slate-900 border border-slate-850 p-2 rounded-md space-y-1 mb-2.5">
                                  <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">熔煉材料需求:</div>
                                  <div className="grid grid-cols-1 gap-0.5 text-[10px] font-mono leading-none">
                                    <div className={goldMet ? "text-slate-300" : "text-rose-400 font-semibold"}>
                                      • ✨ 能源金幣: {gold} / {art.recipe.gold}
                                    </div>
                                    {Object.keys(art.recipe.materials).map(matId => {
                                      const req = art.recipe.materials[matId];
                                      const av = materials[matId] || 0;
                                      const meets = av >= req;
                                      return (
                                        <div key={matId} className={meets ? "text-slate-300" : "text-rose-400 font-semibold"}>
                                          • {MATERIALS[matId]?.emoji} {MATERIALS[matId]?.name}: {av} / {req}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                {!alreadyHave && (
                                  <button
                                    onClick={() => craftArtifact(artId)}
                                    disabled={!canCraft}
                                    className={`w-full py-1.5 rounded font-bold text-xs cursor-pointer transition-all ${
                                      canCraft 
                                        ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-950" 
                                        : "bg-slate-900 text-slate-600 border border-none cursor-not-allowed"
                                    }`}
                                  >
                                    熔鑄傳奇神器
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {smithySubTab === "awaken" && (
                      <div className="space-y-3">
                        <div className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-xs leading-relaxed text-slate-400">
                          <p className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                            <Crown className="w-3.5 h-3.5 text-yellow-400" /> 微中子聖格轉職覺醒壇 (Awakening Altar)
                          </p>
                          凡是培養至 <span className="text-yellow-400 font-bold">LV.5 或以上</span> 的角色，均可耗費 250 ✨ Credits 強行打破重子屏障、獲得超階位覺醒！
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-slate-300 pb-1 flex items-center gap-1.5 uppercase tracking-wider">
                            🌠 我方戰友轉職覺醒名冊
                          </h4>
                          {party.map((com) => {
                            const isAwakened = com.title.includes("🌟");
                            const canAwake = com.lv >= 5 && !isAwakened && gold >= 250;
                            return (
                              <div key={com.id} className={`p-3 rounded-lg border bg-slate-950 text-xs flex items-center justify-between ${isAwakened ? "border-yellow-600/40 bg-yellow-950/10" : "border-slate-850"}`}>
                                <div>
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <span className="text-sm shrink-0">{com.className === "Hero" ? "🧑‍🚀" : com.className === "Wizard" ? "🧙‍♂️" : com.className === "Priest" ? "👩‍⚕️" : com.className === "Assassin" ? "🥷" : "🛡️"}</span>
                                    <h4 className="font-bold text-slate-200 text-sm">{com.name}</h4>
                                    <span className="text-[10px] text-slate-500">({com.className})</span>
                                  </div>
                                  <p className="text-[10px] text-slate-400">當前職稱: <span className="text-amber-400 font-semibold">{com.title}</span></p>
                                  <p className="text-[10px] text-slate-500">當前等級: <span className={com.lv >= 5 ? "text-emerald-400 font-bold" : "text-slate-400"}>LV.{com.lv}</span> / 5</p>
                                </div>

                                <div>
                                  {isAwakened ? (
                                    <span className="text-[10px] text-yellow-400 font-bold bg-yellow-950/40 px-2 py-1 rounded border border-yellow-800">
                                      ★ 已登峰
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => awakenCharacter(com.id)}
                                      disabled={!canAwake}
                                      className={`py-1 py-2 rounded font-bold text-[10px] cursor-pointer transition-all px-2 md:px-3 ${
                                        canAwake 
                                          ? "bg-yellow-500 hover:bg-yellow-450 text-slate-950 shadow-md shadow-yellow-950" 
                                          : "bg-slate-900 border border-slate-850 text-slate-600 cursor-not-allowed"
                                      }`}
                                    >
                                      覺醒
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* TAB WINDOW COMPONENT 4: QUEST BOARD & ACHIEVEMENTS */}
                {activeTab === "quests" && (
                  <div className="space-y-3 font-mono">
                    
                    {/* Quests Segment Selection Header */}
                    <div className="grid grid-cols-2 gap-1 mb-1">
                      <button
                        onClick={() => setQuestsSubTab("board")}
                        className={`py-1.5 px-3 text-xs font-bold rounded-md border text-center transition-all cursor-pointer ${
                          questsSubTab === "board"
                            ? "bg-emerald-500 border-emerald-600 text-slate-950"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                        }`}
                      >
                        📜 公會佈告欄
                      </button>
                      <button
                        onClick={() => setQuestsSubTab("achievements")}
                        className={`py-1.5 px-3 text-xs font-bold rounded-md border text-center transition-all cursor-pointer ${
                          questsSubTab === "achievements"
                            ? "bg-emerald-500 border-emerald-600 text-slate-950"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                        }`}
                      >
                        🎖️ 群星里程碑
                      </button>
                    </div>

                    {questsSubTab === "board" && (
                      <div className="space-y-3">
                        <div className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-xs leading-relaxed text-slate-400">
                          <p className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                            <Scroll className="w-3.5 h-3.5 text-emerald-400" /> 公會告示任務中心 (Quest Board)
                          </p>
                          接受指令並自動累計進度。凡是達成指標（亮起綠燈），即可隨時秒速回執領取海量金幣與共用經驗！
                        </div>

                        <div className="space-y-2.5">
                          {quests.map((q) => {
                            const isReady = q.status === "ready";
                            const isCompleted = q.status === "completed";
                            const percent = Math.min(100, Math.round((q.currentValue / q.targetValue) * 100));

                            return (
                              <div
                                key={q.id}
                                className={`p-3 rounded-lg border transition-all ${
                                  isCompleted
                                    ? "bg-slate-950/20 border-slate-900/60 opacity-60 text-slate-500"
                                    : isReady
                                    ? "bg-emerald-950/25 border-emerald-600/60 text-emerald-400"
                                    : "bg-slate-950 border-slate-850"
                                }`}
                              >
                                <div className="flex items-start justify-between mb-1 text-xs">
                                  <div>
                                    <h4 className={`font-mono font-bold ${isCompleted ? "line-through text-slate-600" : "text-slate-200"}`}>
                                      {q.title}
                                    </h4>
                                    <span className="text-[10px] text-slate-500 font-normal">指令代碼: {q.id.toUpperCase()}</span>
                                  </div>

                                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono ${
                                    isCompleted
                                      ? "bg-slate-900 border border-slate-850 text-slate-500"
                                      : isReady
                                      ? "bg-emerald-950 text-emerald-400 border border-emerald-800 animate-pulse"
                                      : "bg-slate-900 border border-slate-850 text-slate-400"
                                  }`}>
                                    {isCompleted ? "已完成" : isReady ? "● 待領賞" : "進度中"}
                                  </span>
                                </div>

                                <p className="text-[11px] text-slate-400 leading-snug font-sans mb-2">
                                  {q.description}
                                </p>

                                {/* Live progression tracking */}
                                {!isCompleted && (
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                                      <span>任務指令進度 ({percent}%)</span>
                                      <span className="font-bold text-slate-300">
                                        {q.currentValue} / {q.targetValue}
                                      </span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden p-0.2">
                                      <div
                                        className={`h-full rounded-full transition-all duration-300 ${
                                          isReady ? "bg-emerald-400" : "bg-slate-700"
                                        }`}
                                        style={{ width: `${percent}%` }}
                                      />
                                    </div>
                                  </div>
                                )}

                                {/* Rewards info */}
                                <div className="mt-3 pt-2.5 border-t border-slate-900 flex justify-between items-center text-[10px] font-mono">
                                  <div className="flex items-center gap-3">
                                    <span className="text-amber-500">金幣 +{q.rewardGold} ✨</span>
                                    <span className="text-violet-400">經驗 +{q.rewardExp} EXP</span>
                                  </div>

                                  {isReady && (
                                    <button
                                      onClick={() => claimQuestReward(q.id)}
                                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1 text-[11px] rounded transition-all cursor-pointer flex items-center gap-1"
                                    >
                                      Claim 領獎密鑰
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {questsSubTab === "achievements" && (
                      <div className="space-y-3">
                        <div className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-xs leading-relaxed text-slate-400">
                          <p className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                            <Crown className="w-3.5 h-3.5 text-yellow-400" /> 太空高能冒險成就盤 (Milestones)
                          </p>
                          累計記錄小隊永久探險行為。如若完成高難量子指標，即可申領高額 credits 主網充值金券！
                        </div>

                        <div className="space-y-2.5">
                          {ACHIEVEMENTS.map((ach) => {
                            const isClaimed = claimedAchievementIds.includes(ach.id);
                            
                            // Calculate current progress value
                            let currentVal = 0;
                            if (ach.targetType === "slay") {
                              currentVal = statistics.totalMonstersSlain;
                            } else if (ach.targetType === "gold_total") {
                              currentVal = statistics.totalGoldGained;
                            } else if (ach.targetType === "upgrade_max") {
                              currentVal = Math.max(0, ...party.flatMap(m => [m.equipment.weapon.level, m.equipment.armor.level]));
                            } else if (ach.targetType === "awake_count") {
                              currentVal = party.filter(m => m.title.includes("🌟")).length;
                            }

                            const meetsReq = currentVal >= ach.targetValue;
                            const percent = Math.min(100, Math.round((currentVal / ach.targetValue) * 100));

                            return (
                              <div
                                key={ach.id}
                                className={`p-3 rounded-lg border text-xs font-mono transition-all ${
                                  isClaimed 
                                    ? "bg-slate-950/20 border-slate-900/60 opacity-60" 
                                    : meetsReq 
                                    ? "bg-yellow-950/20 border-yellow-600 text-yellow-400" 
                                    : "bg-slate-950 border-slate-850"
                                }`}
                              >
                                <div className="flex justify-between items-start mb-1">
                                  <div>
                                    <h4 className={`font-bold font-mono text-sm leading-snug ${isClaimed ? "text-slate-500" : "text-amber-400"}`}>
                                      {ach.emoji || "🎖️"} {ach.title}
                                    </h4>
                                    <p className="text-[10px] text-slate-500 mt-0.5">量子成就代號: {ach.id.toUpperCase()}</p>
                                  </div>

                                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                    isClaimed 
                                      ? "bg-slate-900 text-slate-500 border border-slate-850" 
                                      : meetsReq 
                                      ? "bg-yellow-950 text-yellow-400 border border-yellow-800 animate-pulse" 
                                      : "bg-slate-900 text-slate-400"
                                  }`}>
                                    {isClaimed ? "已納入勳徽" : meetsReq ? "🏅 待領獎" : "未達標"}
                                  </span>
                                </div>

                                <p className="text-[11px] text-slate-400 mb-2 leading-relaxed font-sans">{ach.description}</p>

                                {!isClaimed && (
                                  <div className="space-y-1 mb-2.5">
                                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                                      <span>指標進度 ({percent}%)</span>
                                      <span className="font-bold text-slate-300">{currentVal} / {ach.targetValue}</span>
                                    </div>
                                    <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full rounded-full transition-all duration-300 ${meetsReq ? "bg-yellow-400" : "bg-slate-700"}`}
                                        style={{ width: `${percent}%` }}
                                      />
                                    </div>
                                  </div>
                                )}

                                <div className="pt-2 border-t border-slate-900/60 flex justify-between items-center text-[10px]">
                                  <span className="text-amber-500 font-bold">獎勵: 金幣 +{ach.rewardGold} ✨</span>
                                  {meetsReq && !isClaimed && (
                                    <button
                                      onClick={() => claimAchievement(ach.id)}
                                      className="bg-yellow-500 hover:bg-yellow-450 text-slate-950 font-extrabold px-3 py-1 rounded text-[10px] transition-all cursor-pointer shadow-sm shadow-yellow-900"
                                    >
                                      🏅 領取封賞
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  </div>
                )}

              </div>

              {/* OUT OF COMBAT ACTION LOG CENTER */}
              <div className="mt-4 pt-3 border-t border-slate-850 flex flex-col justify-end min-h-[140px] bg-slate-950/80 rounded-xl p-3 overflow-hidden">
                <p className="text-[10px] text-slate-500 font-mono mb-2 uppercase tracking-wide flex items-center gap-1 border-b border-slate-850 pb-1">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  戰備指揮室探測反饋日誌 (Town Logs)
                </p>

                <div
                  ref={logConsoleRef}
                  className="flex-1 overflow-y-auto space-y-1 max-h-[140px] text-[11px] font-mono leading-relaxed text-slate-400 pr-1 select-none"
                >
                  {narrativeLogs.map((log) => {
                    let logStyle = "text-slate-400";
                    if (log.type === "system") logStyle = "text-cyan-400";
                    if (log.type === "player_action") logStyle = "text-[#628dd1]";
                    if (log.type === "victory") logStyle = "text-emerald-400 font-bold";
                    if (log.type === "gameover") logStyle = "text-rose-400";
                    return (
                      <div key={log.id} className={`${logStyle} break-words`}>
                        {log.text}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Right Column: Party and character lists */}
            <div className="flex-1 p-4 md:p-6 overflow-y-auto flex flex-col justify-between space-y-4">
              
              <div>
                
                {/* Active tab summary block */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-cyan-400" />
                    我方出戰戰術機列編隊狀態 (Party Configuration)
                  </h3>

                  {/* Manual Quick Inventory bag panel */}
                  {items.some((i) => i.count > 0) && (
                    <div className="text-xs font-mono bg-slate-900 border border-slate-850 px-2.5 py-1 rounded-md flex items-center gap-2">
                      <span className="text-slate-500 uppercase">隨身整備藥水背包:</span>
                      <div className="flex gap-1.5 items-center">
                        {items.map((i) => {
                          if (i.count === 0) return null;
                          return (
                            <button
                              key={i.id}
                              onClick={() => setItemUsageTargetSelector({ isOpen: true, item: i })}
                              className="bg-slate-950 hover:bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded border border-slate-800 flex items-center gap-0.5 cursor-pointer text-[10px]"
                              title={`點擊對隊友使用 ${i.name}`}
                            >
                              <span>{i.emoji}</span>
                              <span>x{i.count}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sub-window: Out of Combat Item target selector popup drawer */}
                {itemUsageTargetSelector.isOpen && itemUsageTargetSelector.item && (
                  <div className="bg-cyan-950/20 border border-cyan-500/30 p-3 rounded-lg mb-4 text-xs font-mono">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-cyan-400 font-semibold flex items-center gap-1">
                        🧪 部署藥劑道具：【{itemUsageTargetSelector.item.name}】
                      </span>
                      <button
                        onClick={() => setItemUsageTargetSelector({ isOpen: false, item: null })}
                        className="text-slate-500 hover:text-slate-300 cursor-pointer"
                      >
                        [關閉]
                      </button>
                    </div>
                    <p className="text-slate-400 text-[10px] leading-snug mb-3">
                      選取下方一個要施加此補給修護的目標隊員：
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {party.map((memb, idx) => {
                        const canApply = itemUsageTargetSelector.item.type === "revive"
                          ? (memb.hp <= 0 || memb.isDead)
                          : (memb.hp > 0 && !memb.isDead);

                        return (
                          <button
                            key={memb.id}
                            onClick={() => useItemOutOfCombat(itemUsageTargetSelector.item!.id, idx)}
                            className="bg-slate-900 hover:bg-slate-800 text-slate-300 py-2 border border-slate-850 rounded hover:border-cyan-800 text-[11px] cursor-pointer"
                          >
                            <span>{memb.name.split(" ")[0]}</span>
                            <span className="block text-[9px] text-slate-500 mt-0.5 font-mono">
                              (HP: {memb.hp}/{memb.maxHp})
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Detailed column cards for each party companion */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {party.map((com, index) => {
                    const isFainted = com.hp <= 0 || com.isDead;
                    const weaponCost = com.equipment.weapon.level * 25;
                    const armorCost = com.equipment.armor.level * 25;

                    return (
                      <div
                        key={com.id}
                        className={`bg-slate-900/60 border rounded-xl p-4 transition-all relative overflow-hidden flex flex-col justify-between ${
                          isFainted ? "border-red-950/80 bg-red-950/5/30" : "border-slate-850 hover:border-slate-800"
                        }`}
                      >
                        
                        {/* Header class info */}
                        <div>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {/* Glowing circle representation */}
                              <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-center text-xl shadow-inner relative">
                                {com.className === "Hero" ? "👤" : com.className === "Wizard" ? "🧙‍♀️" : com.className === "Priest" ? "🕊️" : com.className === "Assassin" ? "🗡️" : "🛡️"}
                                <span className="absolute -bottom-1 -right-1 text-xs">
                                  {getElementEmoji(com.element)}
                                </span>
                              </div>
                              <div>
                                <h4 className={`text-sm font-bold tracking-wide font-mono ${isFainted ? "text-slate-500 line-through" : "text-slate-100"}`}>
                                  {com.name}
                                  {com.className === "Hero" && <span className="text-[10px] text-amber-500 ml-1">★</span>}
                                </h4>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  LV.{com.lv} {com.className} • {com.title}
                                </span>
                              </div>
                            </div>

                            <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border ${getElementColorClass(com.element)}`}>
                              {com.element.toUpperCase()}
                            </span>
                          </div>

                          {/* Progress Health Bar */}
                          <div className="space-y-1 mb-2">
                            <div className="flex justify-between text-[10px] font-mono leading-none">
                              <span className="text-slate-550 flex items-center gap-0.5"><Heart className="w-3 h-3 text-rose-500" /> HP</span>
                              <span className={isFainted ? "text-rose-500" : "text-emerald-400 font-bold"}>
                                {com.hp} / {com.maxHp} {isFainted && "[ 🚨 已死機 ]"}
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${isFainted ? "bg-slate-800" : "bg-gradient-to-r from-emerald-500 to-teal-400"}`}
                                style={{ width: `${Math.max(0, (com.hp / com.maxHp) * 105)}%` }}
                              />
                            </div>
                          </div>

                          {/* Progress Energy Mana Bar */}
                          <div className="space-y-1 mb-2">
                            <div className="flex justify-between text-[10px] font-mono leading-none">
                              <span className="text-slate-550 flex items-center gap-0.5"><Sparkles className="w-3 h-3 text-cyan-400" /> MP</span>
                              <span className="text-cyan-400 font-bold">{com.mp} / {com.maxMp}</span>
                            </div>
                            <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                                style={{ width: `${Math.max(0, (com.mp / com.maxMp) * 100)}%` }}
                              />
                            </div>
                          </div>

                          {/* Level progression bar */}
                          <div className="space-y-1 mb-3">
                            <div className="flex justify-between text-[9px] font-mono text-slate-500 leading-none">
                              <span>EXP NEXT PHASE</span>
                              <span>{com.exp} / {com.maxExp}</span>
                            </div>
                            <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(100, (com.exp / com.maxExp) * 100)}%` }}
                              />
                            </div>
                          </div>

                          {/* Gear details list or specific upgrades inside forge */}
                          <div className="mt-3 p-2.5 bg-slate-950 rounded-lg border border-slate-900 space-y-2 text-[11px] font-mono">
                            <div className="flex items-center justify-between text-slate-400">
                              <span>🗡️ 武器: {com.equipment.weapon.name}</span>
                              <span className="text-amber-400 text-[10px]">Lvl.{com.equipment.weapon.level} (+{com.equipment.weapon.bonus} ATK)</span>
                            </div>

                            <div className="flex items-center justify-between text-slate-400">
                              <span>🛡️ 防具: {com.equipment.armor.name}</span>
                              <span className="text-amber-400 text-[10px]">Lvl.{com.equipment.armor.level} (+{com.equipment.armor.bonus} DEF)</span>
                            </div>

                            <p className="border-t border-slate-900/60 pt-1.5 text-[10px] text-slate-500 leading-snug font-sans">
                              🔥 專屬奧義術: <span className="font-semibold text-cyan-400">「{com.activeSkill.name}」</span> ({com.activeSkill.multiplier}x) - {com.activeSkill.description}
                            </p>
                          </div>
                        </div>

                        {/* Upgrade commands inside Forge Tab window */}
                        {activeTab === "blacksmith" && (
                          <div className="mt-4 pt-3 border-t border-slate-850/60 grid grid-cols-2 gap-2 text-xs font-mono">
                            <button
                              onClick={() => upgradeGear(com.id, "weapon")}
                              disabled={gold < weaponCost}
                              className={`py-1.5 px-2 rounded-lg border transition-all text-center h-auto flex flex-col justify-center items-center cursor-pointer ${
                                gold >= weaponCost
                                  ? "bg-amber-950/20 border-amber-800 text-amber-400 hover:bg-amber-900/30"
                                  : "bg-slate-950 border-slate-900 text-slate-600 cursor-not-allowed"
                              }`}
                            >
                              <span className="font-semibold text-[11px]">🔨 強化武器</span>
                              <span className="text-[9px] text-slate-500">Lvl.{com.equipment.weapon.level}➔{com.equipment.weapon.level + 1} ({weaponCost}金幣)</span>
                            </button>

                            <button
                              onClick={() => upgradeGear(com.id, "armor")}
                              disabled={gold < armorCost}
                              className={`py-1.5 px-2 rounded-lg border transition-all text-center h-auto flex flex-col justify-center items-center cursor-pointer ${
                                gold >= armorCost
                                  ? "bg-emerald-950/20 border-emerald-800 text-emerald-400 hover:bg-emerald-950/40"
                                  : "bg-slate-950 border-slate-900 text-slate-600 cursor-not-allowed"
                              }`}
                            >
                              <span className="font-semibold text-[11px]">🛡️ 強化護甲</span>
                              <span className="text-[9px] text-slate-500">Lvl.{com.equipment.armor.level}➔{com.equipment.armor.level + 1} ({armorCost}金幣)</span>
                            </button>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>

              </div>

              {/* Element correlation matrix shown out of battle */}
              <div className="mt-4 pt-2">
                <ElementChart />
              </div>

            </div>

          </div>
        )}
        </main>

        {/* BOTTOM AUTOMATICALLY SAVED TOAST & FOOTER STATUS */}
        <footer className="px-4 py-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-500 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-slate-600">STATION ORBIT SIGNALS: SECURE 🟢</span>
            <div className="flex items-center gap-1.5">
              <span>SLAIN MONSTERS: <strong className="text-slate-300">{statistics.totalMonstersSlain}</strong></span>
              <span className="text-slate-700 font-normal">|</span>
              <span>UPGRADES DONE: <strong className="text-slate-300">{statistics.totalUpgradesDone}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Auto Saving light */}
            {isSaving && (
              <span className="text-emerald-400 flex items-center gap-1 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                自動存檔中... 🟢
              </span>
            )}

            {/* Reset progress controls */}
            {isResetConfirmOpen ? (
              <div className="flex items-center gap-2">
                <span className="text-red-400 font-bold">[確定重置?]</span>
                <button
                  onClick={resetGame}
                  className="px-2 py-0.5 bg-red-900 border border-red-700 rounded text-slate-100 hover:bg-red-800 cursor-pointer"
                >
                  是 (確認)
                </button>
                <button
                  onClick={() => setIsResetConfirmOpen(false)}
                  className="px-2 py-0.5 bg-slate-800 rounded text-slate-300 hover:bg-slate-755 cursor-pointer"
                >
                  否 (返回)
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsResetConfirmOpen(true)}
                className="text-slate-600 hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
                title="重新開始，抹除本機儲存資料"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                重置進度
              </button>
            )}
          </div>
        </footer>
          </>
        )}

        {/* Narrative Transmission Overlay Dialog */}
        {activeLoreDetail && (
          <div 
            id="stellar-lore-modal"
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          >
            <div className="w-full max-w-lg bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 space-y-4 font-mono shadow-2xl relative overflow-hidden text-left">
              
              {/* Ambient neon beam decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />

              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest">{activeLoreDetail.codename} 頻道</span>
                  <h3 className="text-sm font-black text-slate-100 tracking-wide flex items-center gap-1.5">
                    🌌 {activeLoreDetail.title}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveLoreDetail(null)}
                  className="w-7 h-7 rounded-full bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-100 flex items-center justify-center transition-colors border border-slate-800 cursor-pointer text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 py-1 text-xs">
                <div className="bg-slate-950/70 border border-slate-850 p-4 rounded-xl leading-relaxed text-slate-300 font-sans whitespace-pre-line relative">
                  <span className="absolute -top-1.5 -left-1 text-[8px] bg-cyan-950 text-cyan-400 border border-cyan-800/20 px-1.5 rounded uppercase font-bold tracking-widest scale-90">
                    星海黑匣子錄入
                  </span>
                  {activeLoreDetail.description}
                </div>

                <div className="bg-cyan-950/25 border border-cyan-500/20 p-3.5 rounded-xl space-y-1">
                  <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider font-mono">
                    🚨 行星防衛與克制方案數據
                  </span>
                  <p className="text-[11px] text-cyan-300/95 font-sans leading-relaxed">
                    {activeLoreDetail.secretReveal}
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-850 p-3 rounded-lg flex items-center justify-between font-mono text-[10px]">
                  <span className="text-slate-500">破譯獲取物資:</span>
                  <span className="text-amber-400 font-bold">{activeLoreDetail.rewardText}</span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActiveLoreDetail(null)}
                  className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-lg shadow-cyan-950/50"
                >
                  已成功匯入戰術雷達
                </button>
              </div>
              
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
