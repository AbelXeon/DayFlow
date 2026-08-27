"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Plus, Trash2, Check, X, Pencil, Search } from "lucide-react";

type Task = { id: string; text: string; done: boolean };
type FilterType = "all" | "active" | "completed";

export default function TodoPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [mounted, setMounted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const saved = localStorage.getItem("dayflow-tasks");
    if (saved) setTasks(JSON.parse(saved));
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("dayflow-tasks", JSON.stringify(tasks));
  }, [tasks, loaded]);

  useEffect(() => {
    if (adding || editingId) textareaRef.current?.focus();
  }, [adding, editingId]);

  function openAdd() {
    setDraft("");
    setEditingId(null);
    setAdding(true);
  }

  function openEdit(task: Task) {
    setDraft(task.text);
    setEditingId(task.id);
    setAdding(true);
  }

  function closeEditor() {
    setAdding(false);
    setEditingId(null);
    setDraft("");
  }

  function saveTask() {
    const text = draft.trim();
    if (!text) {
      closeEditor();
      return;
    }
    if (editingId) {
      setTasks((t) => t.map((task) => (task.id === editingId ? { ...task, text } : task)));
    } else {
      setTasks((t) => [{ id: crypto.randomUUID(), text, done: false }, ...t]);
    }
    closeEditor();
  }

  function toggle(id: string) {
    setTasks((t) => t.map((task) => (task.id === id ? { ...task, done: !task.done } : task)));
  }

  function remove(id: string) {
    setTasks((t) => t.filter((task) => task.id !== id));
  }

  const remaining = tasks.filter((t) => !t.done).length;
  const completedCount = tasks.filter((t) => t.done).length;

  // Filter & Search Logic
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.text.toLowerCase().includes(search.toLowerCase());
    if (filter === "active") return matchesSearch && !task.done;
    if (filter === "completed") return matchesSearch && task.done;
    return matchesSearch;
  });

  return (
    <div className="px-5 pt-6 pb-12 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-wide text-text">Tasks</h1>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                remaining === 0 ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" : "bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.6)]"
              }`}
            />
            <p className="text-muted text-xs font-medium">
              {remaining === 0 ? "All clear for today 🎉" : `${remaining} left to complete`}
            </p>
          </div>
        </div>
        <button
          onClick={openAdd}
          className="rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white w-11 h-11 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-600/30 transition-all"
        >
          <Plus size={22} />
        </button>
      </div>

      {/* Search Bar with glowing focus and colored icon */}
      <div className="relative mb-3.5">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks..."
          className="w-full bg-surface border border-border/80 rounded-2xl pl-10 pr-9 py-2.5 text-sm text-text placeholder:text-muted outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-text p-0.5 rounded-full hover:bg-white/5 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filter Tabs with Active Indicators & Badges */}
      <div className="flex gap-1.5 p-1 bg-surface border border-border/80 rounded-2xl mb-4 text-xs font-medium">
        {(
          [
            { id: "all", label: "All", count: tasks.length },
            { id: "active", label: "Active", count: remaining },
            { id: "completed", label: "Done", count: completedCount },
          ] as const
        ).map((tab) => {
          const isActive = filter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as FilterType)}
              className={`flex-1 py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 ${
                isActive
                  ? "bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/25 scale-[1.02]"
                  : "text-muted hover:text-text hover:bg-white/5"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-border/60 text-muted"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-2 gap-3">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className={`rounded-2xl border p-3.5 flex flex-col justify-between min-h-[102px] transition-all duration-200 ${
              task.done
                ? "bg-surface/50 border-border/50 opacity-70"
                : "bg-surface border-border hover:border-border/80 shadow-sm"
            }`}
          >
            <p
              className={`text-sm leading-snug line-clamp-2 ${
                task.done ? "line-through text-muted/70" : "text-text font-medium"
              }`}
            >
              {task.text}
            </p>

            <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/40">
              {/* Green check button */}
              <button
                onClick={() => toggle(task.id)}
                className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                  task.done
                    ? "bg-emerald-500 border-emerald-500 shadow-sm shadow-emerald-500/40"
                    : "border-border hover:border-emerald-500/60"
                }`}
              >
                {task.done && <Check size={12} className="text-white stroke-[3]" />}
              </button>

              {/* Action Icons: Blue for Edit, Red for Delete */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEdit(task)}
                  className="p-1 rounded-lg text-sky-400 hover:text-sky-300 hover:bg-sky-500/15 transition-colors"
                  title="Edit task"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => remove(task.id)}
                  className="p-1 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 transition-colors"
                  title="Delete task"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty States */}
      {tasks.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted text-sm">Nothing here yet — tap + to add one.</p>
        </div>
      )}

      {tasks.length > 0 && filteredTasks.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted text-sm">No tasks found in this view.</p>
        </div>
      )}

      {/* Add / Edit Modal */}
      {mounted && adding &&
        createPortal(
          <div
            style={{ backgroundColor: "#0a0c0f" }}
            className="fixed inset-0 z-[999] flex flex-col"
          >
            <div className="mx-auto w-full max-w-md flex flex-col flex-1 px-5 pt-6">
              <div className="flex items-center justify-between pb-4 border-b border-border/40">
                <button
                  onClick={closeEditor}
                  className="text-muted hover:text-text p-1.5 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <X size={22} />
                </button>
                <button
                  onClick={saveTask}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 text-sm font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
                >
                  <Check size={16} /> Done
                </button>
              </div>
              <textarea
                ref={textareaRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                    e.preventDefault();
                    saveTask();
                  }
                  if (e.key === "Escape") closeEditor();
                }}
                placeholder="What needs doing?"
                className="flex-1 bg-transparent pt-4 pb-6 text-lg outline-none resize-none placeholder:text-muted text-text"
              />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}