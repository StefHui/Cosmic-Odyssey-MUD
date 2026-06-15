import React, { useState } from "react";
import { getElementEmoji, getElementLabel } from "../data";
import { ElementType } from "../types";
import { Sparkles, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";

export default function ElementChart() {
  const [selectedElement, setSelectedElement] = useState<ElementType>("Fire");

  const elementsList: ElementType[] = ["Fire", "Plant", "Earth", "Electric", "Water"];

  const getAffinities = (elem: ElementType) => {
    switch (elem) {
      case "Fire":
        return { beats: "Plant" as ElementType, weakTo: "Water" as ElementType, desc: "「離子烈焰」能迅速蒸發碳基晶植。高熱能量對草系魔物造成的傷害大幅提速。" };
      case "Plant":
        return { beats: "Earth" as ElementType, weakTo: "Fire" as ElementType, desc: "「軌道荊棘」紮根於磁力重砂，汲取土系能量。對土屬性魔物有極佳克制性。" };
      case "Earth":
        return { beats: "Electric" as ElementType, weakTo: "Plant" as ElementType, desc: "「引力晶砂」能完美引流並屏蔽強電場，對雷系魔物造成強致盲，引導電阻塌陷。" };
      case "Electric":
        return { beats: "Water" as ElementType, weakTo: "Earth" as ElementType, desc: "「超高壓藍電」在液態重水導電係數翻倍，能輕易穿透水系魔物的液化護盾。" };
      case "Water":
        return { beats: "Fire" as ElementType, weakTo: "Electric" as ElementType, desc: "「高密重水」具備極佳比熱容，可輕易澆熄核裂紅火，對火系魔物產生絕對壓制。" };
    }
  };

  const currentAffinity = getAffinities(selectedElement);

  return (
    <div id="element-matrix-card" className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-300 font-mono flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-400" />
          全息屬性相克矩陣 (Affinity Matrix)
        </h3>
        <span className="text-xs text-slate-500 font-mono">1.5x 💥 / 0.75x 🛡️</span>
      </div>

      {/* Circle Elements Selector */}
      <div className="grid grid-cols-5 gap-1.5 mb-4">
        {elementsList.map((elem) => {
          const isSelected = selectedElement === elem;
          let borderTheme = "border-slate-800 hover:border-slate-700 bg-slate-950";
          if (isSelected) {
            if (elem === "Fire") borderTheme = "border-orange-500 text-orange-400 bg-orange-950/20";
            if (elem === "Plant") borderTheme = "border-emerald-500 text-emerald-400 bg-emerald-950/20";
            if (elem === "Earth") borderTheme = "border-amber-500 text-amber-500 bg-amber-950/20";
            if (elem === "Electric") borderTheme = "border-cyan-500 text-cyan-400 bg-cyan-950/20";
            if (elem === "Water") borderTheme = "border-blue-500 text-blue-400 bg-blue-950/20";
          }
          return (
            <button
              key={elem}
              onClick={() => setSelectedElement(elem)}
              className={`py-2 px-1 rounded-lg border text-base flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${borderTheme}`}
            >
              <span className="text-xl">{getElementEmoji(elem)}</span>
              <span className="text-[10px] font-mono leading-none tracking-tight">
                {elem === "Fire" ? "火" : elem === "Plant" ? "草" : elem === "Earth" ? "土" : elem === "Electric" ? "雷" : "水"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Description Panel */}
      <div className="bg-slate-950 border border-slate-850 rounded-lg p-3 text-xs text-slate-350">
        <div className="flex items-center flex-wrap gap-2 mb-2 font-mono">
          <span className="text-slate-400 font-semibold flex items-center gap-1">
            {getElementEmoji(selectedElement)} {getElementLabel(selectedElement)}
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-900/40">
            {getElementEmoji(currentAffinity.beats)} 壓制 1.5x
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-red-400 font-semibold flex items-center gap-1 bg-red-950/20 px-1.5 py-0.5 rounded border border-red-950/30">
            {getElementEmoji(currentAffinity.weakTo)} 受制 0.75x
          </span>
        </div>

        <p className="text-slate-450 leading-relaxed font-sans text-[11px]">
          {currentAffinity.desc}
        </p>

        {/* Matrix Guide Route Carousel */}
        <div className="mt-3 pt-2.5 border-t border-slate-900 flex justify-center items-center gap-1.5 text-[11px] font-mono text-slate-500 overflow-x-auto whitespace-nowrap">
          <span>🔥</span> <ArrowRight className="w-2.5 h-2.5 shrink-0" />
          <span>🌿</span> <ArrowRight className="w-2.5 h-2.5 shrink-0" />
          <span>⛰️</span> <ArrowRight className="w-2.5 h-2.5 shrink-0" />
          <span>⚡</span> <ArrowRight className="w-2.5 h-2.5 shrink-0" />
          <span>💧</span> <ArrowRight className="w-2.5 h-2.5 shrink-0" />
          <span>🔥</span>
        </div>
      </div>
    </div>
  );
}
