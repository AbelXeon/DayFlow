"use client";

import { useMemo, useState } from "react";
import { Menu } from "lucide-react";

import dynamic from "next/dynamic";
import CalcMenuSheet, { CalcMode } from "@/components/calculator/CalcMenuSheet";

const ScientificView = dynamic(() => import("@/components/calculator/ScientificView"), { ssr: false });
const ProgrammerView = dynamic(() => import("@/components/calculator/ProgrammerView"), { ssr: false });
const UnitConverterView = dynamic(() => import("@/components/calculator/UnitConverterView"), { ssr: false });

const unitModes = new Set([
  "length", "mass", "volume", "area", "speed", "time", "power", "energy", "data", "pressure", "angle", "temperature",
]);

const padBasic = [
  ["7", "8", "9", "÷"],
  ["4", "5", "6", "×"],
  ["1", "2", "3", "−"],
  ["0", ".", "%", "+"],
];

function StandardView() {
  const [display, setDisplay] = useState("0");

  const liveResult = useMemo(() => {
    try {
      const expr = display.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-");
      if (!/^[0-9+\-*/. %()]+$/.test(expr)) return null;
      // eslint-disable-next-line no-new-func
      const res = Function(`"use strict"; return (${expr})`)();
      if (typeof res === "number" && isFinite(res) && String(res) !== display) {
        return String(res);
      }
      return null;
    } catch {
      return null;
    }
  }, [display]);

  function insert(val: string) {
    setDisplay((d) => (d === "0" ? val : d + val));
  }

  function calculate() {
    try {
      const expr = display.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-");
      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict"; return (${expr})`)();
      setDisplay(typeof result === "number" && isFinite(result) ? String(result) : "Error");
    } catch {
      setDisplay("Error");
    }
  }

  function clear() { setDisplay("0"); }
  function backspace() { setDisplay((d) => (d.length <= 1 ? "0" : d.slice(0, -1))); }

  return (
    <div className="px-5 pt-6">
      <div className="rounded-2xl border border-border bg-surface p-5 mb-3 min-h-[6rem] flex flex-col justify-end">
        {liveResult !== null && (
          <p className="font-mono text-muted text-sm text-right break-all w-full mb-1">
            = {liveResult}
          </p>
        )}
        <p className="font-mono text-data text-3xl text-right break-all w-full">{display}</p>
      </div>
      <div className="flex gap-2 mb-3">
        <button onClick={clear} className="flex-1 rounded-xl bg-surface-elevated border border-border py-2.5 text-sm text-muted">Clear</button>
        <button onClick={backspace} className="flex-1 rounded-xl bg-surface-elevated border border-border py-2.5 text-sm text-muted">Delete</button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {padBasic.flat().map((b) => (
          <button key={b} onClick={() => insert(b)} className="rounded-xl py-4 font-mono text-lg border border-border bg-surface text-text">
            {b}
          </button>
        ))}
      </div>
      <button onClick={calculate} className="w-full rounded-xl bg-accent text-bg font-mono text-lg font-semibold py-4 mt-2">
        =
      </button>
    </div>
  );
}

export default function CalculatorPage() {
  const [mode, setMode] = useState<CalcMode>("standard");
  const [menuOpen, setMenuOpen] = useState(false);

  const modeLabels: Record<string, string> = {
    standard: "Standard", scientific: "Scientific", programmer: "Programmer",
    length: "Length", mass: "Weight & Mass", volume: "Volume", temperature: "Temperature",
    area: "Area", speed: "Speed", time: "Time", power: "Power", energy: "Energy",
    data: "Data", pressure: "Pressure", angle: "Angle",
  };

  return (
    <div>
      <div className="px-5 pt-6 flex items-center justify-between">
        <h1 className="font-display text-3xl tracking-wide">{modeLabels[mode]}</h1>
        <button
          onClick={() => setMenuOpen(true)}
          className="rounded-xl border border-border bg-surface p-2.5"
        >
          <Menu size={20} className="text-text" />
        </button>
      </div>

      {mode === "standard" && <StandardView />}
      {mode === "scientific" && <ScientificView />}
      {mode === "programmer" && <ProgrammerView />}
      {unitModes.has(mode) && <UnitConverterView key={mode} mode={mode} />}

      <CalcMenuSheet open={menuOpen} onClose={() => setMenuOpen(false)} selected={mode} onSelect={setMode} />
    </div>
  );
}