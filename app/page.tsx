import Link from "next/link";
import { Calculator, CloudSun, ArrowLeftRight, ListChecks } from "lucide-react";
import DayFlowBar from "@/components/DayFlowBar";

const tiles = [
  {
    href: "/calculator",
    label: "Calculator",
    sub: "Scientific",
    icon: Calculator,
  },
  {
    href: "/weather",
    label: "Weather",
    sub: "Now & forecast",
    icon: CloudSun,
  },
  {
    href: "/currency",
    label: "Exchange",
    sub: "Live rates",
    icon: ArrowLeftRight,
  },
  {
    href: "/todo",
    label: "Tasks",
    sub: "Today's list",
    icon: ListChecks,
  },
];

export default function Home() {
  return (
    <div>
      <DayFlowBar />
      <div className="grid grid-cols-2 gap-3 px-5">
        {tiles.map(({ href, label, sub, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-2xl border border-border bg-surface p-4 h-36 flex flex-col justify-between active:scale-[0.97] transition-transform"
          >
            <Icon size={22} className="text-accent" strokeWidth={1.8} />
            <div>
              <p className="font-display font-semibold text-lg leading-tight">{label}</p>
              <p className="text-muted text-xs mt-0.5">{sub}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}