'use client';

import { FormEvent, useState } from 'react';
import { TASK_STATUSES, TaskStatus } from '@/types/task';

interface TaskFormProps {
  onCreate: (title: string, status: TaskStatus) => Promise<void>;
}

export default function TaskForm({ onCreate }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError('Task title cannot be empty.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onCreate(trimmed, status);
      setTitle('');
      setStatus('todo');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add task.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="task-form" onSubmit={handleSubmit} noValidate>
      <input
        type="text"
        placeholder="What needs doing?"
        value={title}
        onChange={(e) => { setTitle(e.target.value); if (error) setError(null); }}
        disabled={submitting}
        aria-label="Task title"
      />
      <select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)} disabled={submitting} aria-label="Initial status">
        {TASK_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <button type="submit" disabled={submitting}>{submitting ? 'Adding…' : 'Add task'}</button>
      {error && <p className="form-error" role="alert">{error}</p>}
    </form>
  );
}