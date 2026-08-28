"use client";

import { useState } from "react";
import { math, simpsonIntegrate, numericLimit } from "@/lib/scientificMath";

const categories = {
  Basic: ["sin(", "cos(", "tan(", "log(", "ln(", "√(", "^", "!", "(", ")", "π", "e", "mod"],
  Matrix: ["[", "]", ",", "det(", "inv(", "transpose(", "trace(", "eigs(", "lup(", "qr(", "dot(", "cross("],
  Complex: ["i", "complex(", "conj(", "arg(", "abs(", "re(", "im("],
  Number: ["gcd(", "lcm(", "combinations(", "permutations(", "primeFactors("],
  Stats: ["mean(", "median(", "mode(", "std(", "variance(", "quantileSeq(", ","],
};
type Cat = keyof typeof categories;

const pad = [
  ["7", "8", "9", "÷"],
  ["4", "5", "6", "×"],
  ["1", "2", "3", "−"],
  ["0", ".", "%", "+"],
];

function toMathExpr(raw: string) {
  return raw.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/√\(/g, "sqrt(").replace(/π/g, "pi");
}

export default function ScientificView() {
  const [display, setDisplay] = useState("0");
  const [cat, setCat] = useState<Cat>("Basic");
  const [showCalculus, setShowCalculus] = useState(false);
  const [bound, setBound] = useState({ a: "0", b: "1" });

  function insert(val: string) {
    setDisplay((d) => (d === "0" && !["(", "√(", "π", "e"].includes(val) ? val : d + val));
  }

  function calculate() {
    try {
      const result = math.evaluate(toMathExpr(display));
      setDisplay(math.format(result, { precision: 12 }));
    } catch {
      setDisplay("Error");
    }
  }

  function derivative() {
    try {
      setDisplay(math.derivative(toMathExpr(display), "x").toString());
    } catch {
      setDisplay("Error — needs valid f(x)");
    }
  }

  function integrate() {
    try {
      const a = parseFloat(bound.a), b = parseFloat(bound.b);
      const result = simpsonIntegrate(toMathExpr(display), a, b);
      setDisplay(String(math.format(result, { precision: 10 })));
    } catch {
      setDisplay("Error");
    }
  }

  function limitAt(point: number | "Infinity" | "-Infinity") {
    const result = numericLimit(toMathExpr(display), point);
    setDisplay(result);
  }

  function clear() { setDisplay("0"); }
  function backspace() { setDisplay((d) => (d.length <= 1 ? "0" : d.slice(0, -1))); }

  return (
    <div className="px-5 pt-6">
      <div className="rounded-2xl border border-border bg-surface p-4 mb-2 min-h-[5rem] flex items-end">
        <p className="font-mono text-data text-2xl text-right break-all w-full">{display}</p>
      </div>

      <div className="flex gap-2 mb-2">
        <button onClick={clear} className="flex-1 rounded-lg bg-surface-elevated border border-border py-2 text-xs text-muted">Clear</button>
        <button onClick={backspace} className="flex-1 rounded-lg bg-surface-elevated border border-border py-2 text-xs text-muted">Delete</button>
        <button onClick={() => setShowCalculus((s) => !s)} className="flex-1 rounded-lg bg-surface-elevated border border-border py-2 text-xs text-accent">Calculus</button>
      </div>

      {showCalculus && (
        <div className="rounded-xl border border-border bg-surface p-3 mb-2 space-y-2">
          <div className="flex gap-2">
            <button onClick={derivative} className="flex-1 rounded-lg bg-surface-elevated py-2 text-xs text-accent">d/dx</button>
            <input
              value={bound.a}
              onChange={(e) => setBound((b) => ({ ...b, a: e.target.value }))}
              placeholder="a"
              className="w-14 bg-surface-elevated rounded-lg text-center text-xs py-2 text-text"
            />
            <input
              value={bound.b}
              onChange={(e) => setBound((b) => ({ ...b, b: e.target.value }))}
              placeholder="b"
              className="w-14 bg-surface-elevated rounded-lg text-center text-xs py-2 text-text"
            />
            <button onClick={integrate} className="flex-1 rounded-lg bg-surface-elevated py-2 text-xs text-accent">∫[a,b]</button>
          </div>
          <div className="flex gap-2">
            <button onClick={() => limitAt(parseFloat(bound.a) || 0)} className="flex-1 rounded-lg bg-surface-elevated py-2 text-xs text-accent">lim x→a</button>
            <button onClick={() => limitAt("Infinity")} className="flex-1 rounded-lg bg-surface-elevated py-2 text-xs text-accent">lim x→∞</button>
          </div>
          <p className="text-muted text-[10px]">Uses the field above as f(x). a/b reused for both the integral bounds and the limit point.</p>
        </div>
      )}

      <div className="flex gap-1 mb-2 flex-wrap">
        {(Object.keys(categories) as Cat[]).map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-full px-3 py-1 text-xs border border-border ${cat === c ? "bg-accent text-bg" : "bg-surface text-muted"}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-2">
        {categories[cat].map((tok) => (
          <button key={tok} onClick={() => insert(tok)} className="rounded-lg bg-surface border border-border px-2.5 py-1.5 font-mono text-xs text-accent">
            {tok}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {pad.flat().map((b) => (
          <button key={b} onClick={() => insert(b)} className="rounded-lg py-2.5 font-mono text-sm border border-border bg-surface text-text">
            {b}
          </button>
        ))}
      </div>

      <button onClick={calculate} className="w-full rounded-xl bg-accent text-bg font-mono text-lg font-semibold py-3 mt-2">
        =
      </button>
    </div>
  );
}