"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Check } from "lucide-react";

type Task = { id: string; text: string; done: boolean };

export default function TodoPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("dayflow-tasks");
    if (saved) setTasks(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("dayflow-tasks", JSON.stringify(tasks));
  }, [tasks]);

  function addTask() {
    const text = input.trim();
    if (!text) return;
    setTasks((t) => [{ id: crypto.randomUUID(), text, done: false }, ...t]);
    setInput("");
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
      <h1 className="font-display text-2xl font-semibold">Tasks</h1>
      <p className="text-muted text-sm mt-1 mb-5">
        {remaining === 0 ? "All clear" : `${remaining} left today`}
      </p>

      <div className="flex gap-2 mb-5">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="Add a task"
          className="flex-1 rounded-xl bg-surface border border-border px-4 py-3 text-sm outline-none focus:border-accent"
        />
        <button
          onClick={addTask}
          className="rounded-xl bg-accent text-bg px-4 flex items-center justify-center"
        >
          <Plus size={20} />
        </button>
      </div>

      <ul className="space-y-2">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex items-center gap-3 rounded-xl bg-surface border border-border px-4 py-3"
          >
            <button
              onClick={() => toggle(task.id)}
              className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                task.done ? "bg-accent border-accent" : "border-border"
              }`}
            >
              {task.done && <Check size={12} className="text-bg" />}
            </button>
            <span className={`flex-1 text-sm ${task.done ? "line-through text-muted" : ""}`}>
              {task.text}
            </span>
            <button onClick={() => remove(task.id)} className="text-muted">
              <Trash2 size={16} />
            </button>
          </li>
        ))}
        {tasks.length === 0 && (
          <p className="text-muted text-sm text-center py-10">Nothing here yet.</p>
        )}
      </ul>
    </div>
  );
}