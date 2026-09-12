import { NextRequest, NextResponse } from 'next/server';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '@/lib/db';
import { Task, ApiResponse, isTaskStatus } from '@/types/task';

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id: rawId } = await context.params;
  const id = parseId(rawId);
  if (id === null) {
    const body: ApiResponse<never> = { ok: false, error: 'Invalid task id.' };
    return NextResponse.json(body, { status: 400 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    const body: ApiResponse<never> = { ok: false, error: 'Request body must be valid JSON.' };
    return NextResponse.json(body, { status: 400 });
  }

  const { status } = (payload ?? {}) as { status?: unknown };
  if (!isTaskStatus(status)) {
    const body: ApiResponse<never> = { ok: false, error: "Status must be 'todo', 'in-progress', or 'done'." };
    return NextResponse.json(body, { status: 400 });
  }

  try {
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE tasks SET status = ? WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      const body: ApiResponse<never> = { ok: false, error: 'Task not found.' };
      return NextResponse.json(body, { status: 404 });
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, title, status, created_at FROM tasks WHERE id = ?',
      [id]
    );

    const body: ApiResponse<Task> = { ok: true, data: rows[0] as Task };
    return NextResponse.json(body);
  } catch (err) {
    console.error(`PATCH /api/tasks/${rawId} failed:`, err);
    const body: ApiResponse<never> = { ok: false, error: 'Failed to update task.' };
    return NextResponse.json(body, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id: rawId } = await context.params;
  const id = parseId(rawId);
  if (id === null) {
    const body: ApiResponse<never> = { ok: false, error: 'Invalid task id.' };
    return NextResponse.json(body, { status: 400 });
  }

  try {
    const [result] = await pool.query<ResultSetHeader>('DELETE FROM tasks WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      const body: ApiResponse<never> = { ok: false, error: 'Task not found.' };
      return NextResponse.json(body, { status: 404 });
    }

    const body: ApiResponse<{ id: number }> = { ok: true, data: { id } };
    return NextResponse.json(body);
  } catch (err) {
    console.error(`DELETE /api/tasks/${rawId} failed:`, err);
    const body: ApiResponse<never> = { ok: false, error: 'Failed to delete task.' };
    return NextResponse.json(body, { status: 500 });
  }
}