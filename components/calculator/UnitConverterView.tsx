"use client";

import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { unitCategories, unitNames, convertLinear, convertTemperature } from "@/lib/units";
import type { CalcMode } from "./CalcMenuSheet";

export default function UnitConverterView({ mode }: { mode: CalcMode }) {
  const isTemp = mode === "temperature";
  const category = !isTemp ? unitCategories[mode] : null;
  const unitKeys = isTemp ? ["C", "F", "K"] : Object.keys(category!.units);

  const [from, setFrom] = useState(unitKeys[0]);
  const [to, setTo] = useState(unitKeys[1]);
  const [amount, setAmount] = useState("1");

  const numeric = parseFloat(amount) || 0;
  const result = isTemp
    ? convertTemperature(numeric, from, to)
    : convertLinear(numeric, category!, from, to);

  function swap() {
    setFrom(to);
    setTo(from);
  }

  return (
    <div className="px-5 pt-6">
      <div className="rounded-2xl border border-border bg-surface p-5">
        <label className="text-muted text-xs">Amount</label>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          inputMode="decimal"
          className="w-full bg-transparent font-mono text-data text-3xl outline-none mt-1 mb-4 text-text"
        />
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full sm:flex-1 rounded-xl bg-surface-elevated border border-border px-3 py-3 text-sm text-text truncate"
          >
            {unitKeys.map((u) => (
              <option key={u} value={u}>
                {unitNames[u] || u}
              </option>
            ))}
          </select>
          <button
            onClick={swap}
            aria-label="Swap units"
            className="rounded-xl bg-accent text-bg p-3 flex-shrink-0 hover:opacity-90 transition-opacity"
          >
            <ArrowLeftRight size={18} />
          </button>
          <select
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full sm:flex-1 rounded-xl bg-surface-elevated border border-border px-3 py-3 text-sm text-text truncate"
          >
            {unitKeys.map((u) => (
              <option key={u} value={u}>
                {unitNames[u] || u}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 mt-3 text-center">
        <p className="text-muted text-sm mb-1">
          {amount || 0} {unitNames[from] || from} equals
        </p>
        <p className="font-mono text-data text-4xl">
          {result.toLocaleString(undefined, { maximumFractionDigits: 6 })}
        </p>
        <p className="text-muted text-sm mt-1">{unitNames[to] || to}</p>
      </div>
    </div>
  );
}