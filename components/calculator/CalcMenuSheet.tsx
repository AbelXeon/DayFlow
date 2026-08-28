"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import {
  X,
  Check,
  Calculator,
  FlaskConical,
  Code2,
  Ruler,
  Scale,
  Beaker,
  Thermometer,
  Grid2x2,
  Gauge,
  Clock,
  Zap,
  Flame,
  HardDrive,
  Wind,
  Compass,
  type LucideIcon,
} from "lucide-react";

export type CalcMode =
  | "standard" | "scientific" | "programmer"
  | "length" | "mass" | "volume" | "area" | "speed"
  | "time" | "power" | "energy" | "data" | "pressure" | "angle" | "temperature";

const modeIcons: Record<CalcMode, LucideIcon> = {
  standard: Calculator,
  scientific: FlaskConical,
  programmer: Code2,
  length: Ruler,
  mass: Scale,
  volume: Beaker,
  temperature: Thermometer,
  area: Grid2x2,
  speed: Gauge,
  time: Clock,
  power: Zap,
  energy: Flame,
  data: HardDrive,
  pressure: Wind,
  angle: Compass,
};

const groups: { label: string; items: { id: CalcMode; label: string }[] }[] = [
  {
    label: "Calculators",
    items: [
      { id: "standard", label: "Standard" },
      { id: "scientific", label: "Scientific" },
      { id: "programmer", label: "Programmer" },
    ],
  },
  {
    label: "Unit converters",
    items: [
      { id: "length", label: "Length" },
      { id: "mass", label: "Weight & Mass" },
      { id: "volume", label: "Volume" },
      { id: "temperature", label: "Temperature" },
      { id: "area", label: "Area" },
      { id: "speed", label: "Speed" },
      { id: "time", label: "Time" },
      { id: "power", label: "Power" },
      { id: "energy", label: "Energy" },
      { id: "data", label: "Data" },
      { id: "pressure", label: "Pressure" },
      { id: "angle", label: "Angle" },
    ],
  },
];

export default function CalcMenuSheet({
  open, onClose, selected, onSelect,
}: {
  open: boolean;
  onClose: () => void;
  selected: CalcMode;
  onSelect: (m: CalcMode) => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || !open) return null;

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <style>{`
        .sheet-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .sheet-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .sheet-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.12);
          border-radius: 9999px;
        }
        .sheet-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.25);
        }
        .sheet-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.12) transparent;
        }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-border bg-surface p-4 shadow-2xl flex flex-col max-h-[80vh]"
      >
        <div className="flex items-center justify-between pb-3">
          <h2 className="font-display text-lg tracking-wide">Calculator mode</h2>
          <button onClick={onClose} className="text-muted hover:text-text transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 sheet-scroll min-h-0">
          {groups.map((g) => (
            <div key={g.label} className="mb-4">
              <p className="text-muted text-[11px] mb-2 uppercase tracking-wider px-1 font-medium">{g.label}</p>
              <div className="space-y-1">
                {g.items.map((item) => {
                  const Icon = modeIcons[item.id] || Calculator;
                  const isSelected = selected === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { onSelect(item.id); onClose(); }}
                      className={`w-full text-left rounded-xl px-3.5 py-2.5 text-sm border flex items-center justify-between transition-colors ${
                        isSelected
                          ? "bg-surface-elevated border-accent/50 text-text"
                          : "bg-surface hover:bg-surface-elevated border-border text-text"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={17} className={isSelected ? "text-accent" : "text-muted"} />
                        <span>{item.label}</span>
                      </div>
                      {isSelected && <Check size={16} className="text-accent flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}