"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { X, Search } from "lucide-react";
import Globe3D from "./Globe3D";
import { GlobeCity } from "@/lib/globeCities";

export default function GlobeSheet({
  open, onClose, onSelectCity, onSearch,
}: {
  open: boolean;
  onClose: () => void;
  onSelectCity: (city: GlobeCity) => void;
  onSearch: (query: string) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  useEffect(() => setMounted(true), []);
  if (!mounted || !open) return null;

  return createPortal(
    <div style={{ backgroundColor: "#0a0c0f" }} className="fixed inset-0 z-[999] flex flex-col">
      <div className="mx-auto w-full max-w-md flex flex-col flex-1 min-h-0">
        <div className="flex items-center justify-between px-5 pt-6 pb-3">
          <h2 className="font-display text-2xl tracking-wide">Pick a place</h2>
          <button onClick={onClose} className="text-muted"><X size={22} /></button>
        </div>

        <div className="flex gap-2 px-5 mb-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && search.trim()) {
                onSearch(search.trim());
                onClose();
              }
            }}
            placeholder="Or type a city"
            className="flex-1 rounded-xl bg-surface border border-border px-4 py-2.5 text-sm outline-none text-text"
          />
          <button
            onClick={() => { if (search.trim()) { onSearch(search.trim()); onClose(); } }}
            className="rounded-xl bg-surface border border-border px-3 text-text"
          >
            <Search size={16} />
          </button>
        </div>

        <p className="text-muted text-xs text-center pb-2">Drag to rotate · pinch to zoom · tap a dot</p>

        <div className="flex-1 min-h-0">
          <Globe3D onSelectCity={(city) => { onSelectCity(city); onClose(); }} />
        </div>
      </div>
    </div>,
    document.body
  );
}