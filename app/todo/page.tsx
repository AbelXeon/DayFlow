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

  // Filter & Search Logic
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.text.toLowerCase().includes(search.toLowerCase());
    if (filter === "active") return matchesSearch && !task.done;
    if (filter === "completed") return matchesSearch && task.done;
    return matchesSearch;
  });

  return (
    <div className="px-5 pt-6 pb-10 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="font-display text-3xl tracking-wide">Tasks</h1>
          <p className="text-muted text-sm mt-0.5">
            {remaining === 0 ? "All clear" : `${remaining} left today`}
          </p>
        </div>
        <button
          onClick={openAdd}
          className="rounded-xl bg-accent text-bg w-11 h-11 flex items-center justify-center flex-shrink-0"
        >
          <Plus size={22} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-3">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks..."
          className="w-full bg-surface border border-border rounded-xl pl-9 pr-9 py-2.5 text-sm text-text placeholder:text-muted outline-none focus:border-accent transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 p-1 bg-surface border border-border rounded-xl mb-4 text-xs font-medium">
        {(["all", "active", "completed"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`flex-1 py-1.5 rounded-lg capitalize transition-all duration-150 ${
              filter === tab
                ? "bg-accent text-bg font-semibold shadow-sm"
                : "text-muted hover:text-text"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-2 gap-3">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="rounded-xl bg-surface border border-border p-3 flex flex-col justify-between min-h-[92px]"
          >
            <p
              className={`text-sm leading-snug line-clamp-2 ${
                task.done ? "line-through text-muted" : "text-text"
              }`}
            >
              {task.text}
            </p>
            <div className="flex items-center justify-between mt-2">
              <button
                onClick={() => toggle(task.id)}
                className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                  task.done ? "bg-green-500 border-green-500" : "border-border"
                }`}
              >
                {task.done && <Check size={12} className="text-bg" />}
              </button>
              <div className="flex items-center gap-2">
                <button onClick={() => openEdit(task)} className="text-muted hover:text-text">
                  <Pencil size={14} />
                </button>
                <button onClick={() => remove(task.id)} className="text-muted hover:text-text">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty States */}
      {tasks.length === 0 && (
        <p className="text-muted text-sm text-center py-16">Nothing here yet — tap + to add one.</p>
      )}

      {tasks.length > 0 && filteredTasks.length === 0 && (
        <p className="text-muted text-sm text-center py-16">No tasks found matching your filter.</p>
      )}

      {/* Add / Edit Modal */}
      {mounted && adding &&
        createPortal(
          <div
            style={{ backgroundColor: "#0a0c0f" }}
            className="fixed inset-0 z-[999] flex flex-col"
          >
            <div className="mx-auto w-full max-w-md flex flex-col flex-1 px-5 pt-6">
              <div className="flex items-center justify-between pb-4">
                <button onClick={closeEditor} className="text-muted">
                  <X size={22} />
                </button>
                <button
                  onClick={saveTask}
                  className="rounded-lg bg-accent text-bg px-4 py-2 text-sm font-medium flex items-center gap-1"
                >
                  <Check size={16} /> Done
                </button>
              </div>
              <textarea
                ref={textareaRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="What needs doing?"
                className="flex-1 bg-transparent pb-6 text-lg outline-none resize-none placeholder:text-muted text-text"
              />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}