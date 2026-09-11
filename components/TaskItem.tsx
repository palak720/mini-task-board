'use client';

import { Task, TASK_STATUSES, TaskStatus } from '@/types/task';

interface TaskItemProps {
  task: Task;
  pending: boolean;
  onStatusChange: (id: number, status: TaskStatus) => void;
  onDelete: (id: number) => void;
}

export default function TaskItem({ task, pending, onStatusChange, onDelete }: TaskItemProps) {
  return (
    <li className={`task-item${pending ? ' is-pending' : ''}`}>
      <span className="title">{task.title}</span>
      <span className={`status-badge status-${task.status}`}>{task.status}</span>
      <select
        value={task.status}
        disabled={pending}
        aria-label={`Change status for ${task.title}`}
        onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
      >
        {TASK_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <button type="button" className="delete-btn" disabled={pending} onClick={() => onDelete(task.id)} aria-label={`Delete ${task.title}`}>
        Delete
      </button>
    </li>
  );
}