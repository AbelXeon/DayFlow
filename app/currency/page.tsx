"use client";

import { useEffect, useState } from "react";
import { ArrowLeftRight } from "lucide-react";

const mockRates: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  ETB: 123.4,
  JPY: 149.2,
};

const currencies = Object.keys(mockRates);
const popularAgainst = ["USD", "EUR", "GBP", "ETB", "JPY"];

export default function CurrencyPage() {
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("ETB");
  const [amount, setAmount] = useState("100");
  const [rates, setRates] = useState<Record<string, number>>(mockRates);
  const [updated, setUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch(`/api/exchange-rate?base=${from}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.rates) {
          // rates are relative to `from`, so USD-based mockRates format won't mix in —
          // rebuild against USD=1 style isn't needed, we just use them directly since base = from
          setRates({ ...data.rates, [from]: 1 });
          setUpdated(data.updated);
          setLive(true);
        } else {
          setLive(false);
        }
      })
      .catch(() => setLive(false))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [from]);

  // when live, rates[x] = units of x per 1 `from`. when mock, mockRates is USD-based, so
  // convert via the from-anchor either way using the same math.
  const rate = (code: string) => (live ? rates[code] : mockRates[code] / mockRates[from]);
  const numeric = parseFloat(amount) || 0;
  const converted = numeric * rate(to);

  function swap() {
    setFrom(to);
    setTo(from);
  }

  return (
    <div className="px-5 pt-6">
      <h1 className="font-display text-3xl tracking-wide mb-5">Exchange</h1>

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
            {currencies.map((c) => (
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
            {currencies.map((c) => (
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

      <div className="mt-4 flex items-center justify-between px-1">
        <p className="text-muted text-xs">
          {live ? "Live rates" : loading ? "Loading live rates…" : "Offline — showing estimate"}
        </p>
        {updated && <p className="text-muted text-xs">{updated}</p>}
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4 mt-2">
        <p className="text-muted text-xs mb-3">1 {from} equals</p>
        <div className="space-y-2">
          {popularAgainst
            .filter((c) => c !== from)
            .map((c) => (
              <div key={c} className="flex items-center justify-between">
                <span className="text-sm text-text">{c}</span>
                <span className="font-mono text-data text-sm">
                  {rate(c).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}