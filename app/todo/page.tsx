"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, Check } from "lucide-react";

type Task = { id: string; text: string; done: boolean };

export default function TodoPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [adding, setAdding] = useState(false);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("dayflow-tasks");
    if (saved) setTasks(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("dayflow-tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if (adding) inputRef.current?.focus();
  }, [adding]);

  function confirmAdd() {
    const text = input.trim();
    if (text) setTasks((t) => [{ id: crypto.randomUUID(), text, done: false }, ...t]);
    setInput("");
    setAdding(false);
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
          onClick={() => setAdding(true)}
          className="rounded-xl bg-accent text-bg w-11 h-11 flex items-center justify-center flex-shrink-0"
        >
          <Plus size={22} />
        </button>
      </div>

      {adding && (
        <div className="flex gap-2 mb-4">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") confirmAdd();
              if (e.key === "Escape") { setInput(""); setAdding(false); }
            }}
            onBlur={confirmAdd}
            placeholder="What needs doing?"
            className="flex-1 rounded-xl bg-surface border border-accent px-4 py-3 text-sm outline-none"
          />
        </div>
      )}

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
                  task.done ? "bg-accent border-accent" : "border-border"
                }`}
              >
                {task.done && <Check size={12} className="text-bg" />}
              </button>
              <button onClick={() => remove(task.id)} className="text-muted">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {tasks.length === 0 && !adding && (
        <p className="text-muted text-sm text-center py-16">Nothing here yet — tap + to add one.</p>
      )}
    </div>
  );
}