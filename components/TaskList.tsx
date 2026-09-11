'use client';

import { Task, TaskStatus } from '@/types/task';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  pendingIds: Set<number>;
  onStatusChange: (id: number, status: TaskStatus) => void;
  onDelete: (id: number) => void;
}

export default function TaskList({ tasks, pendingIds, onStatusChange, onDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return <p className="empty-state">No tasks yet — add your first one above.</p>;
  }
  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} pending={pendingIds.has(task.id)} onStatusChange={onStatusChange} onDelete={onDelete} />
      ))}
    </ul>
  );
}