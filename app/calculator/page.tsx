"use client";

import { useState } from "react";
import { evaluate, format } from "mathjs";

const sciStrip = [
  "sin(", "cos(", "tan(", "log(", "ln(", "√(",
  "^", "!", "mod", "(", ")", "π", "e",
  "x", ",", "'", "[", "]", "det(", "inv(", "derivative(",
];

const pad = [
  ["7", "8", "9", "÷"],
  ["4", "5", "6", "×"],
  ["1", "2", "3", "−"],
  ["0", ".", "%", "+"],
];

function toMathExpr(raw: string) {
  return raw
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/−/g, "-")
    .replace(/√\(/g, "sqrt(")
    .replace(/π/g, "pi");
}

export default function CalculatorPage() {
  const [display, setDisplay] = useState("0");

  function insert(val: string) {
    setDisplay((d) => (d === "0" && !["(", "√(", "π", "e"].includes(val) ? val : d + val));
  }

  function calculate() {
    try {
      const result = evaluate(toMathExpr(display));
      setDisplay(format(result, { precision: 12 }));
    } catch {
      setDisplay("Error");
    }
  }

  function clear() {
    setDisplay("0");
  }

  function backspace() {
    setDisplay((d) => (d.length <= 1 ? "0" : d.slice(0, -1)));
  }

  return (
    <div className="px-5 pt-6">
      <h1 className="font-display text-3xl tracking-wide mb-4">Calculator</h1>

      <div className="rounded-2xl border border-border bg-surface p-5 mb-3 min-h-[6rem] flex items-end">
        <p className="font-mono text-data text-3xl text-right break-all w-full">{display}</p>
      </div>

      <div className="flex gap-2 mb-3">
        <button onClick={clear} className="flex-1 rounded-xl bg-surface-elevated border border-border py-2.5 text-sm font-medium text-muted">
          Clear
        </button>
        <button onClick={backspace} className="flex-1 rounded-xl bg-surface-elevated border border-border py-2.5 text-sm font-medium text-muted">
          Delete
        </button>
      </div>

      {/* Scientific functions — scrolls sideways so it never pushes the pad off-screen */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-1 -mx-5 px-5 no-scrollbar">
        {sciStrip.map((b) => (
          <button
            key={b}
            onClick={() => insert(b)}
            className="flex-shrink-0 rounded-lg bg-surface border border-border px-3 py-2 font-mono text-sm text-accent"
          >
            {b}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {pad.flat().map((b) => (
          <button
            key={b}
            onClick={() => insert(b)}
            className="rounded-xl py-4 font-mono text-lg border border-border bg-surface text-text active:scale-95 transition-transform"
          >
            {b}
          </button>
        ))}
      </div>

      <button
        onClick={calculate}
        className="w-full rounded-xl bg-accent text-bg font-mono text-lg font-semibold py-4 mt-2 active:scale-95 transition-transform"
      >
        =
      </button>

    </div>
  );
}