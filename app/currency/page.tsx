"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeftRight, ChevronDown, Search, X } from "lucide-react";

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
  const [rates, setRates] = useState<Record<string, number>>(mockRates);
  const [updated, setUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [live, setLive] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [picker, setPicker] = useState<"from" | "to" | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch(`/api/exchange-rate?base=${from}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.rates) {
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

  // Full currency list — from live data when we have it (~160 codes), mock list otherwise
  const allCurrencies = useMemo(() => {
    const codes = live ? Object.keys(rates) : Object.keys(mockRates);
    return codes.sort();
  }, [rates, live]);

  const filteredCurrencies = useMemo(() => {
    if (!search.trim()) return allCurrencies;
    const q = search.trim().toUpperCase();
    return allCurrencies.filter((c) => c.includes(q));
  }, [allCurrencies, search]);

  const rate = (code: string) => (live ? rates[code] : mockRates[code] / mockRates[from]);
  const numeric = parseFloat(amount) || 0;
  const converted = numeric * rate(to);

  function swap() {
    setFrom(to);
    setTo(from);
  }

  function openPicker(which: "from" | "to") {
    setSearch("");
    setPicker(which);
  }

  function selectCurrency(code: string) {
    if (picker === "from") setFrom(code);
    if (picker === "to") setTo(code);
    setPicker(null);
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
          <button
            onClick={() => openPicker("from")}
            className="flex-1 rounded-xl bg-surface-elevated border border-border px-3 py-3 text-sm flex items-center justify-between"
          >
            {from} <ChevronDown size={16} className="text-muted" />
          </button>

          <button
            onClick={swap}
            className="rounded-xl bg-accent text-bg p-3 flex-shrink-0"
          >
            <ArrowLeftRight size={18} />
          </button>

          <button
            onClick={() => openPicker("to")}
            className="flex-1 rounded-xl bg-surface-elevated border border-border px-3 py-3 text-sm flex items-center justify-between"
          >
            {to} <ChevronDown size={16} className="text-muted" />
          </button>
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
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {allCurrencies
            .filter((c) => c !== from)
            .slice(0, 12)
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

      {mounted && picker &&
        createPortal(
          <div
            style={{ backgroundColor: "#0a0c0f" }}
            className="fixed inset-0 z-[999] flex flex-col"
          >
            <div className="mx-auto w-full max-w-md flex flex-col flex-1 px-5 pt-6 min-h-0">
              <div className="flex items-center justify-between pb-4">
                <h2 className="font-display text-2xl tracking-wide">
                  Select {picker === "from" ? "from" : "to"} currency
                </h2>
                <button onClick={() => setPicker(null)} className="text-muted">
                  <X size={22} />
                </button>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-surface border border-border px-3 py-3 mb-4">
                <Search size={16} className="text-muted flex-shrink-0" />
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search currency code"
                  className="flex-1 bg-transparent text-sm outline-none text-text placeholder:text-muted"
                />
              </div>

              <div className="flex-1 overflow-y-auto space-y-1 pb-6">
                {filteredCurrencies.map((c) => (
                  <button
                    key={c}
                    onClick={() => selectCurrency(c)}
                    className="w-full text-left rounded-xl px-4 py-3 text-sm hover:bg-surface active:bg-surface-elevated flex items-center justify-between"
                  >
                    <span>{c}</span>
                    {live && (
                      <span className="font-mono text-muted text-xs">
                        {rates[c]?.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                      </span>
                    )}
                  </button>
                ))}
                {filteredCurrencies.length === 0 && (
                  <p className="text-muted text-sm text-center py-10">No match</p>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}