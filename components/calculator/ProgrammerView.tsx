"use client";

import { useState } from "react";

type Base = 2 | 8 | 10 | 16;
const baseLabels: Record<Base, string> = { 2: "BIN", 8: "OCT", 10: "DEC", 16: "HEX" };
const digitsByBase: Record<Base, string[]> = {
  2: ["0", "1"],
  8: ["0", "1", "2", "3", "4", "5", "6", "7"],
  10: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
  16: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"],
};

export default function ProgrammerView() {
  const [base, setBase] = useState<Base>(10);
  const [acc, setAcc] = useState(0);
  const [current, setCurrent] = useState("0");
  const [pending, setPending] = useState<string | null>(null);
  const [typing, setTyping] = useState(false);

  const currentValue = () => parseInt(current || "0", base) || 0;

  function pressDigit(d: string) {
    setTyping(true);
    setCurrent((c) => (c === "0" ? d : c + d));
  }

  function apply(a: number, b: number, op: string): number {
    switch (op) {
      case "AND": return (a & b) >>> 0;
      case "OR": return (a | b) >>> 0;
      case "XOR": return (a ^ b) >>> 0;
      case "<<": return (a << b) >>> 0;
      case ">>": return (a >>> b) >>> 0;
      case "+": return a + b;
      case "-": return a - b;
      case "×": return a * b;
      case "÷": return b === 0 ? 0 : Math.trunc(a / b);
      default: return b;
    }
  }

  function pressOp(op: string) {
    const val = currentValue();
    const newAcc = pending ? apply(acc, val, pending) : val;
    setAcc(newAcc);
    setPending(op);
    setCurrent("0");
    setTyping(false);
  }

  function equals() {
    const val = currentValue();
    const result = pending ? apply(acc, val, pending) : val;
    setAcc(result);
    setCurrent(String(result));
    setPending(null);
    setTyping(true);
  }

  function not() {
    const val = typing ? currentValue() : acc;
    const result = (~val) >>> 0;
    setAcc(result);
    setCurrent(String(result));
    setTyping(true);
  }

  function clear() {
    setAcc(0);
    setCurrent("0");
    setPending(null);
    setTyping(false);
  }

  const displayDec = typing ? currentValue() : acc;

  return (
    <div className="px-5 pt-6">
      <div className="flex gap-2 mb-3">
        {([2, 8, 10, 16] as Base[]).map((b) => (
          <button
            key={b}
            onClick={() => setBase(b)}
            className={`flex-1 rounded-xl py-2 text-xs font-medium border border-border ${
              base === b ? "bg-accent text-bg" : "bg-surface text-muted"
            }`}
          >
            {baseLabels[b]}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4 mb-3 space-y-1">
        <p className="font-mono text-data text-3xl text-right break-all">
          {displayDec.toString(base).toUpperCase()}
        </p>
        <div className="grid grid-cols-2 gap-x-4 text-xs text-muted font-mono pt-2 border-t border-border">
          <span>BIN {(displayDec >>> 0).toString(2)}</span>
          <span>HEX {(displayDec >>> 0).toString(16).toUpperCase()}</span>
          <span>OCT {(displayDec >>> 0).toString(8)}</span>
          <span>DEC {displayDec}</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-2">
        {["AND", "OR", "XOR", "NOT"].map((op) => (
          <button
            key={op}
            onClick={() => (op === "NOT" ? not() : pressOp(op))}
            className="rounded-lg bg-surface-elevated border border-border py-2 text-xs text-accent"
          >
            {op}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2 mb-2">
        {["<<", ">>", "Clear", "="].map((op) => (
          <button
            key={op}
            onClick={() => (op === "Clear" ? clear() : op === "=" ? equals() : pressOp(op))}
            className={`rounded-lg py-2 text-xs border border-border ${
              op === "=" ? "bg-accent text-bg" : "bg-surface-elevated text-muted"
            }`}
          >
            {op}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {digitsByBase[16].map((d) => {
          const enabled = digitsByBase[base].includes(d);
          return (
            <button
              key={d}
              disabled={!enabled}
              onClick={() => pressDigit(d)}
              className={`rounded-xl py-3 font-mono text-base border border-border ${
                enabled ? "bg-surface text-text" : "bg-surface/40 text-muted/30"
              }`}
            >
              {d}
            </button>
          );
        })}
        {["+", "-", "×", "÷"].map((op) => (
          <button
            key={op}
            onClick={() => pressOp(op)}
            className="rounded-xl py-3 font-mono text-base border border-border bg-surface-elevated text-accent"
          >
            {op}
          </button>
        ))}
      </div>
    </div>
  );
}