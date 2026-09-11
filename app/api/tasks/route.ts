import { NextRequest, NextResponse } from 'next/server';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '@/lib/db';
import { Task, ApiResponse, TaskStatus, isTaskStatus } from '@/types/task';

export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, title, status, created_at FROM tasks ORDER BY created_at DESC, id DESC'
    );
    const body: ApiResponse<Task[]> = { ok: true, data: rows as Task[] };
    return NextResponse.json(body);
  } catch (err) {
    console.error('GET /api/tasks failed:', err);
    const body: ApiResponse<never> = { ok: false, error: 'Failed to load tasks.' };
    return NextResponse.json(body, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    const body: ApiResponse<never> = { ok: false, error: 'Request body must be valid JSON.' };
    return NextResponse.json(body, { status: 400 });
  }

  const { title, status } = (payload ?? {}) as { title?: unknown; status?: unknown };

  if (typeof title !== 'string' || title.trim().length === 0) {
    const body: ApiResponse<never> = { ok: false, error: 'Task title is required.' };
    return NextResponse.json(body, { status: 400 });
  }
  if (title.trim().length > 255) {
    const body: ApiResponse<never> = { ok: false, error: 'Task title must be 255 characters or fewer.' };
    return NextResponse.json(body, { status: 400 });
  }
  let taskStatus: TaskStatus = 'todo';
  if (status !== undefined) {
    if (!isTaskStatus(status)) {
      const body: ApiResponse<never> = { ok: false, error: "Status must be 'todo', 'in-progress', or 'done'." };
      return NextResponse.json(body, { status: 400 });
    }
    taskStatus = status;
  }

  try {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO tasks (title, status) VALUES (?, ?)',
      [title.trim(), taskStatus]
    );

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, title, status, created_at FROM tasks WHERE id = ?',
      [result.insertId]
    );

    const body: ApiResponse<Task> = { ok: true, data: rows[0] as Task };
    return NextResponse.json(body, { status: 201 });
  } catch (err) {
    console.error('POST /api/tasks failed:', err);
    const body: ApiResponse<never> = { ok: false, error: 'Failed to create task.' };
    return NextResponse.json(body, { status: 500 });
  }
}