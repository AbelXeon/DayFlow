"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { X, Check } from "lucide-react";

export type CalcMode =
  | "standard" | "scientific" | "programmer"
  | "length" | "mass" | "volume" | "area" | "speed"
  | "time" | "power" | "energy" | "data" | "pressure" | "angle" | "temperature";

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
    <div style={{ backgroundColor: "#0a0c0f" }} className="fixed inset-0 z-[999] flex flex-col">
      <div className="mx-auto w-full max-w-md flex flex-col flex-1 px-5 pt-6 min-h-0">
        <div className="flex items-center justify-between pb-4">
          <h2 className="font-display text-2xl tracking-wide">Calculator mode</h2>
          <button onClick={onClose} className="text-muted"><X size={22} /></button>
        </div>
        <div className="flex-1 overflow-y-auto pb-6">
          {groups.map((g) => (
            <div key={g.label} className="mb-5">
              <p className="text-muted text-xs mb-2 uppercase tracking-wide">{g.label}</p>
              <div className="space-y-1">
                {g.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { onSelect(item.id); onClose(); }}
                    className="w-full text-left rounded-xl px-4 py-3 text-sm bg-surface border border-border flex items-center justify-between"
                  >
                    {item.label}
                    {selected === item.id && <Check size={16} className="text-accent" />}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}