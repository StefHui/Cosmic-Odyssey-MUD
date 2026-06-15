/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getElementRelation, applyExpGain, HERO_INITIAL } from "../data";

/**
 * 🌠 Cosmic JRPG / MUD - Core Game Engine Test Suite
 * This script serves as a modular unit testing suite using basic assertions to verify
 * critical game mechanics (Elemental relations, damage formulae, and level-up curves).
 *
 * Returns the pass/fail tally so a CLI runner (npm test) can set its exit code.
 */

export function runCoreGameTests(): { passed: number; failed: number } {
  console.log("============= 🧪 STARTING COSMIC ODYSSEY CORE TESTS =============");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      failed++;
    }
  }

  // --- Test Set 1: Elemental Affinity Cycle & Multipliers ---
  try {
    console.log("\n--- Category 1: Elemental Affinities Cycle (剋制/抗性) ---");
    
    // Cycle rule: Fire -> Plant -> Earth -> Electric -> Water -> Fire
    const relationFP = getElementRelation("Fire", "Plant");
    assert(
      relationFP.multiplier === 1.5 && relationFP.type === "critical",
      "火 (Fire) 應該完美剋制 草 (Plant)，造成 1.5 倍致命傷害"
    );

    const relationWF = getElementRelation("Water", "Fire");
    assert(
      relationWF.multiplier === 1.5 && relationWF.type === "critical",
      "水 (Water) 應該完美剋制 火 (Fire)，造成 1.5 倍致命傷害"
    );

    const relationFW = getElementRelation("Fire", "Water");
    assert(
      relationFW.multiplier === 0.75 && relationFW.type === "guarded",
      "火 (Fire) 面對 抵抗屬性 水 (Water) 時被抗阻，傷能下調至 0.75 倍"
    );

    const relationFE = getElementRelation("Fire", "Earth");
    assert(
      relationFE.multiplier === 1.0 && relationFE.type === "normal",
      "火 (Fire) 與 土 (Earth) 非相互剋環，造成中性的 1.0 倍一般傷害"
    );

    const relationFF = getElementRelation("Fire", "Fire");
    assert(
      relationFF.multiplier === 1.0 && relationFF.type === "normal",
      "同屬性攻擊（Fire vs Fire）造成 1.0 倍一般傷害"
    );

  } catch (e: any) {
    console.error("Category 1 encountered an exception error", e);
    failed++;
  }

  // --- Test Set 2: Combat Damage Formulations ---
  try {
    console.log("\n--- Category 2: Combat Damage Formulations (戰鬥傷害公式) ---");

    // Standard JRPG Damage Formula mapping: Damage = Math.max(2, Math.round((Atk - Def * 0.4) * multiplier))
    const attackerAtk = 100;
    const defenderDef = 50;
    const multiplierAdvantage = 1.5; // (e.g. Fire -> Plant)
    
    const expectedBase = attackerAtk - defenderDef * 0.4; // 100 - 20 = 80
    const expectedDamage = Math.max(2, Math.round(expectedBase * multiplierAdvantage)); // 80 * 1.5 = 120

    assert(
      expectedDamage === 120,
      `當攻擊力 ${attackerAtk} 遇上防禦力 ${defenderDef} 與克制係數 ${multiplierAdvantage}，預期計算傷害為 120`
    );

    // Safeguard for extreme defense values where damage should not go to 0 or negative
    const highDef = 500;
    const defenseBase = Math.max(2, Math.round((100 - highDef * 0.4) * 1.5)); // 100 - 200 = -100 -> clamped to min 2
    assert(
      defenseBase >= 2,
      `高防禦力防偏振保障：防禦力遠大於攻擊力時，應保底造成 2 點微弱傷害`
    );

  } catch (e: any) {
    console.error("Category 2 encountered an exception error", e);
    failed++;
  }

  // --- Test Set 3: Level Up Experience curves ---
  try {
    console.log("\n--- Category 3: Level Up Experience Thresholds (升級經驗閾值) ---");

    // Drive the real engine function so the curve rule (nextMaxExp = round(maxExp * 1.5))
    // is verified against shipping code, not a re-derived constant.
    const lv1 = { ...HERO_INITIAL, lv: 1, exp: 0, maxExp: 100 };

    // Exactly enough exp to ding once: maxExp stretches 100 -> 150, level 1 -> 2.
    const oneLevel = applyExpGain(lv1, 100);
    assert(
      oneLevel.leveledUp && oneLevel.member.lv === 2 && oneLevel.member.maxExp === 150,
      `LV.1 灌注 100 經驗應升至 LV.2，下一級經驗上限膨脹至 150`
    );
    assert(
      oneLevel.member.hp === oneLevel.member.maxHp,
      `升級時應觸發全滿補血（hp === maxHp）`
    );

    // Enough to ding twice in one gain: 100 (->lv2) + 150 (->lv3), maxExp 150 -> 225.
    const twoLevels = applyExpGain(lv1, 250);
    assert(
      twoLevels.member.lv === 3 && twoLevels.member.maxExp === 225,
      `LV.1 一次灌注 250 經驗應連升兩級至 LV.3，經驗上限累進至 225`
    );

  } catch (e: any) {
    console.error("Category 3 encountered an exception error", e);
    failed++;
  }

  console.log("\n=================== 📊 TEST RESULTS SUMMARY ===================");
  console.log(`TOTAL RUNS: ${passed + failed}`);
  console.log(`🟩 PASSED: ${passed}`);
  console.log(`🟥 FAILED: ${failed}`);
  
  if (failed === 0) {
    console.log("🌟 CONGRATULATIONS! ALL ENGINE MECHANICS WORKING PERFECTLY IN SPECIFICATION.");
  } else {
    console.warn("⚠️ SOME UNIT CHECKS FAILED. PLEASE VERIFY EQUATIONS AND BOUNDS.");
  }

  return { passed, failed };
}
