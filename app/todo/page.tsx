"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Plus, Trash2, Check, X, Pencil } from "lucide-react";

type Task = { id: string; text: string; done: boolean };

export default function TodoPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
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

  return (
    <div className="px-5 pt-6">
      <div className="flex items-start justify-between mb-5">
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

      <div className="grid grid-cols-2 gap-3">
        {tasks.map((task) => (
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
                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  task.done ? "bg-green-500 border-green-500" : "border-border"
                }`}
              >
                {task.done && <Check size={12} className="text-bg" />}
              </button>
              <div className="flex items-center gap-2">
                <button onClick={() => openEdit(task)} className="text-muted">
                  <Pencil size={14} />
                </button>
                <button onClick={() => remove(task.id)} className="text-muted">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <p className="text-muted text-sm text-center py-16">Nothing here yet — tap + to add one.</p>
      )}

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