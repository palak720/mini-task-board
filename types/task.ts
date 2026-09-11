export type TaskStatus = 'todo' | 'in-progress' | 'done';

export const TASK_STATUSES: TaskStatus[] = ['todo', 'in-progress', 'done'];

export interface Task {
  id: number;
  title: string;
  status: TaskStatus;
  created_at: string;
}

export interface CreateTaskInput {
  title: string;
  status?: TaskStatus;
}

export interface UpdateTaskStatusInput {
  status: TaskStatus;
}

export type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export function isTaskStatus(value: unknown): value is TaskStatus {
  return typeof value === 'string' && (TASK_STATUSES as string[]).includes(value);
}