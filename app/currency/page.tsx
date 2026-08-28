"use client";

import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";

const mockRates: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  ETB: 123.4,
  JPY: 149.2,
};

export default function CurrencyPage() {
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("ETB");
  const [amount, setAmount] = useState("100");

  const numeric = parseFloat(amount) || 0;
  const converted = (numeric / mockRates[from]) * mockRates[to];

  function swap() {
    setFrom(to);
    setTo(from);
  }

  return (
    <div className="px-5 pt-6">
      <h1 className="font-display text-2xl font-semibold mb-5">Exchange</h1>

      <div className="rounded-2xl border border-border bg-surface p-5">
        <label className="text-muted text-xs">Amount</label>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          inputMode="decimal"
          className="w-full bg-transparent font-mono text-data text-3xl outline-none mt-1 mb-4"
        />

        <div className="flex items-center gap-2">
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="flex-1 rounded-xl bg-surface-elevated border border-border px-3 py-3 text-sm"
          >
            {Object.keys(mockRates).map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <button
            onClick={swap}
            className="rounded-xl bg-accent text-bg p-3 flex-shrink-0"
          >
            <ArrowLeftRight size={18} />
          </button>

          <select
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="flex-1 rounded-xl bg-surface-elevated border border-border px-3 py-3 text-sm"
          >
            {Object.keys(mockRates).map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 mt-3 text-center">
        <p className="text-muted text-sm mb-1">{amount || 0} {from} equals</p>
        <p className="font-mono text-data text-4xl">
          {converted.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </p>
        <p className="text-muted text-sm mt-1">{to}</p>
      </div>

     
    </div>
  );
}