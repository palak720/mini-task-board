'use client';

import { useEffect, useState, useCallback } from 'react';
import { Task, TaskStatus } from '@/types/task';
import { createTask, deleteTask, fetchTasks, updateTaskStatus } from '@/lib/api-client';
import TaskForm from './TaskForm';
import TaskList from './TaskList';

export default function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function markPending(id: number, isPending: boolean) {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (isPending) next.add(id); else next.delete(id);
      return next;
    });
  }

  async function handleCreate(title: string, status: TaskStatus) {
    const created = await createTask({ title, status });
    setTasks((prev) => [created, ...prev]);
  }

  async function handleStatusChange(id: number, status: TaskStatus) {
    const previous = tasks;
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    markPending(id, true);
    setError(null);
    try {
      await updateTaskStatus(id, status);
    } catch (err) {
      setTasks(previous);
      setError(err instanceof Error ? err.message : 'Failed to update task.');
    } finally {
      markPending(id, false);
    }
  }

  async function handleDelete(id: number) {
    const previous = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    markPending(id, true);
    setError(null);
    try {
      await deleteTask(id);
    } catch (err) {
      setTasks(previous);
      setError(err instanceof Error ? err.message : 'Failed to delete task.');
      markPending(id, false);
    }
  }

  return (
    <main>
      <h1>Mini Task Board</h1>
      <TaskForm onCreate={handleCreate} />
      {error && <p className="banner-error" role="alert">{error}</p>}
      {loading ? (
        <p className="loading-state">Loading tasks…</p>
      ) : (
        <TaskList tasks={tasks} pendingIds={pendingIds} onStatusChange={handleStatusChange} onDelete={handleDelete} />
      )}
    </main>
  );
}