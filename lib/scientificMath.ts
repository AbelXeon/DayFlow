import { create, all } from "mathjs";

export const math = create(all);

function primeFactors(n: number): string {
  n = Math.floor(Math.abs(n));
  if (n < 2) return String(n);
  const factors: number[] = [];
  let d = 2;
  while (d * d <= n) {
    while (n % d === 0) {
      factors.push(d);
      n /= d;
    }
    d++;
  }
  if (n > 1) factors.push(n);
  return factors.join(" × ");
}

math.import(
  { primeFactors },
  { override: true }
);

export function simpsonIntegrate(expr: string, a: number, b: number, n = 1000): number {
  if (n % 2 !== 0) n++;
  const h = (b - a) / n;
  const f = (x: number) => {
    try {
      return math.evaluate(expr, { x });
    } catch {
      return NaN;
    }
  };
  let sum = f(a) + f(b);
  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    sum += (i % 2 === 0 ? 2 : 4) * f(x);
  }
  return (h / 3) * sum;
}

export function numericLimit(expr: string, point: number | "Infinity" | "-Infinity"): string {
  const evalAt = (x: number) => {
    try {
      const r = math.evaluate(expr, { x });
      return typeof r === "number" && isFinite(r) ? r : null;
    } catch {
      return null;
    }
  };

  if (point === "Infinity" || point === "-Infinity") {
    const x = point === "Infinity" ? 1e8 : -1e8;
    const r = evalAt(x);
    return r === null ? "undefined" : String(r);
  }

  const eps = 1e-6;
  const left = evalAt(point - eps);
  const right = evalAt(point + eps);
  if (left === null || right === null) return "undefined";
  if (Math.abs(left - right) > 1e-3) return `L: ${left.toFixed(6)}, R: ${right.toFixed(6)} (discontinuous)`;
  return ((left + right) / 2).toFixed(6);
}