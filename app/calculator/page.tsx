"use client";

import { useState } from "react";

const buttons = [
  ["sin", "cos", "tan", "√"],
  ["(", ")", "^", "÷"],
  ["7", "8", "9", "×"],
  ["4", "5", "6", "−"],
  ["1", "2", "3", "+"],
  ["0", ".", "%", "="],
];

const SAFE_PATTERN = /^[0-9+\-*/^().%\sA-Za-z]*$/;

function sanitizeAndEval(expr: string): string {
  if (!SAFE_PATTERN.test(expr)) return "Error";
  let js = expr
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/−/g, "-")
    .replace(/√/g, "Math.sqrt")
    .replace(/sin/g, "Math.sin")
    .replace(/cos/g, "Math.cos")
    .replace(/tan/g, "Math.tan")
    .replace(/\^/g, "**");

  if (!/^[0-9+\-*/.()%\sA-Za-z]*$/.test(js)) return "Error";
  // final guard: only allow Math.* identifiers, nothing else alphabetic
  const stripped = js.replace(/Math\.[a-z]+/g, "");
  if (/[A-Za-z]/.test(stripped)) return "Error";

  try {
    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${js})`)();
    if (typeof result !== "number" || !isFinite(result)) return "Error";
    return String(Math.round(result * 1e10) / 1e10);
  } catch {
    return "Error";
  }
}

export default function CalculatorPage() {
  const [display, setDisplay] = useState("0");
  const [expr, setExpr] = useState("");

  function press(val: string) {
    if (val === "=") {
      const result = sanitizeAndEval(expr || display);
      setDisplay(result);
      setExpr(result === "Error" ? "" : result);
      return;
    }
    if (["sin", "cos", "tan", "√"].includes(val)) {
      const next = (expr || (display !== "0" ? display : "")) + val + "(";
      setExpr(next);
      setDisplay(next);
      return;
    }
    const next = (expr || (display === "0" ? "" : display)) + val;
    setExpr(next);
    setDisplay(next);
  }

  function clear() {
    setDisplay("0");
    setExpr("");
  }

  function backspace() {
    const next = (expr || display).slice(0, -1);
    setExpr(next);
    setDisplay(next || "0");
  }

  return (
    <div className="px-5 pt-6 flex flex-col h-[calc(100vh-8rem)]">
      <h1 className="font-display text-2xl font-semibold mb-4">Calculator</h1>

      <div className="rounded-2xl border border-border bg-surface flex-1 flex flex-col justify-end p-5 mb-4">
        <p className="font-mono text-data text-4xl text-right break-all">{display}</p>
      </div>

      <div className="flex gap-2 mb-2">
        <button
          onClick={clear}
          className="flex-1 rounded-xl bg-surface-elevated border border-border py-3 text-sm font-medium text-muted"
        >
          Clear
        </button>
        <button
          onClick={backspace}
          className="flex-1 rounded-xl bg-surface-elevated border border-border py-3 text-sm font-medium text-muted"
        >
          Delete
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {buttons.flat().map((b) => (
          <button
            key={b}
            onClick={() => press(b)}
            className={`rounded-xl py-4 font-mono text-lg border border-border active:scale-95 transition-transform ${
              b === "=" ? "bg-accent text-bg font-semibold" : "bg-surface text-text"
            }`}
          >
            {b}
          </button>
        ))}
      </div>
    </div>
  );
}