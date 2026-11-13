import type { Todo } from '../types';

export const TODOS_KEY = 'the-digital-todo:v1';
export const THEME_KEY = 'the-digital-todo:theme';
export const LAYOUT_KEY = 'the-digital-todo:layout';

function isTodo(value: unknown): value is Todo {
  if (typeof value !== 'object' || value === null) return false;
  const t = value as Record<string, unknown>;
  return (
    typeof t.id === 'string' &&
    typeof t.text === 'string' &&
    typeof t.done === 'boolean' &&
    typeof t.createdAt === 'number'
  );
}

/** Возвращает null, если данных ещё нет или они повреждены. */
export function loadTodos(): Todo[] | null {
  try {
    const raw = localStorage.getItem(TODOS_KEY);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isTodo) : null;
  } catch {
    return null;
  }
}

export function saveTodos(todos: Todo[]): void {
  try {
    localStorage.setItem(TODOS_KEY, JSON.stringify(todos));
  } catch {
    // Хранилище недоступно (приватный режим, переполнение) — работаем без сохранения
  }
}

export function createId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
