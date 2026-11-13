import type { Todo } from '../types';
import { MAX_TODO_LENGTH } from './todoText';

export const TODOS_KEY = 'the-digital-todo:v1';
export const THEME_KEY = 'the-digital-todo:theme';
export const LAYOUT_KEY = 'the-digital-todo:layout';

function isTodo(value: unknown): value is Todo {
  if (typeof value !== 'object' || value === null) return false;
  const t = value as Record<string, unknown>;
  return (
    typeof t.id === 'string' &&
    t.id.trim().length > 0 &&
    typeof t.text === 'string' &&
    t.text.trim().length > 0 &&
    t.text.length <= MAX_TODO_LENGTH &&
    typeof t.done === 'boolean' &&
    typeof t.createdAt === 'number' &&
    Number.isFinite(t.createdAt)
  );
}

/** Возвращает null, если данных ещё нет или они повреждены. */
export function loadTodos(): Todo[] | null {
  try {
    const raw = localStorage.getItem(TODOS_KEY);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    const seen = new Set<string>();
    return parsed.filter((item): item is Todo => {
      if (!isTodo(item) || seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  } catch {
    return null;
  }
}

export function saveTodos(todos: Todo[]): boolean {
  try {
    localStorage.setItem(TODOS_KEY, JSON.stringify(todos));
    return true;
  } catch {
    // Хранилище недоступно (приватный режим, переполнение) — работаем без сохранения
    return false;
  }
}

export function createId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
