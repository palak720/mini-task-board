import { ApiResponse, CreateTaskInput, Task, TaskStatus } from '@/types/task';

async function unwrap<T>(res: Response): Promise<T> {
  let body: ApiResponse<T>;
  try {
    body = await res.json();
  } catch {
    throw new Error('Server returned an unexpected response.');
  }
  if (!body.ok) {
    throw new Error(body.error || 'Something went wrong.');
  }
  return body.data;
}

export async function fetchTasks(): Promise<Task[]> {
  const res = await fetch('/api/tasks', { cache: 'no-store' });
  return unwrap<Task[]>(res);
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const res = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return unwrap<Task>(res);
}

export async function updateTaskStatus(id: number, status: TaskStatus): Promise<Task> {
  const res = await fetch(`/api/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return unwrap<Task>(res);
}

export async function deleteTask(id: number): Promise<{ id: number }> {
  const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
  return unwrap<{ id: number }>(res);
}