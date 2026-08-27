"use client";

import { useEffect, useState } from "react";

function getPhase(hour: number) {
  if (hour >= 5 && hour < 8) return { name: "Dawn", from: "#3b6cf2", to: "#f2a93b", greeting: "Early start" };
  if (hour >= 8 && hour < 17) return { name: "Midday", from: "#f2a93b", to: "#f2d43b", greeting: "Good day" };
  if (hour >= 17 && hour < 20) return { name: "Dusk", from: "#f2643b", to: "#f2a93b", greeting: "Winding down" };
  return { name: "Night", from: "#1c2027", to: "#3b3bf2", greeting: "Late one" };
}

export default function DayFlowBar() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(id);
  }, []);

  if (!now) return <div className="h-24" />;

  const phase = getPhase(now.getHours());
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const date = now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="px-5 pt-6 pb-4">
      <div
        className="h-1 w-16 rounded-full mb-4"
        style={{
          background: `linear-gradient(90deg, ${phase.from}, ${phase.to})`,
        }}
      />
      <p className="text-muted text-sm font-body">{date} · {phase.name}</p>
      <h1 className="font-display text-3xl font-semibold mt-1">
        {phase.greeting}
      </h1>
      <p className="font-mono text-data text-sm mt-1">{time}</p>
    </div>
  );
}