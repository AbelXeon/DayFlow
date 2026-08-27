"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calculator, CloudSun, ArrowLeftRight, ListChecks } from "lucide-react";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/calculator", label: "Calc", icon: Calculator },
  { href: "/weather", label: "Weather", icon: CloudSun },
  { href: "/currency", label: "Exchange", icon: ArrowLeftRight },
  { href: "/todo", label: "Tasks", icon: ListChecks },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50">
      <div className="mx-4 mb-4 rounded-2xl border border-border bg-surface-elevated/90 backdrop-blur-xl shadow-2xl shadow-black/40">
        <ul className="flex items-center justify-between px-2 py-2">
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  className="flex flex-col items-center gap-1 py-2 rounded-xl transition-colors"
                >
                  <Icon
                    size={20}
                    strokeWidth={active ? 2.4 : 1.8}
                    className={active ? "text-accent" : "text-muted"}
                  />
                  <span
                    className={`text-[10px] font-medium ${
                      active ? "text-accent" : "text-muted"
                    }`}
                  >
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}