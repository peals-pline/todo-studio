import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createId, loadTodos, saveTodos, TODOS_KEY } from '../lib/storage';
import { normalizeTodoText } from '../lib/todoText';
import type { Todo, Undo } from '../types';

/** Примеры для первого запуска — заодно подсказывают, что умеет список. */
function seed(): Todo[] {
  const now = Date.now();
  return [
    { text: 'Добавить свою первую задачу', done: false },
    { text: 'Дважды кликнуть по тексту, чтобы его изменить', done: false },
    { text: 'Перетащить задачу и поменять порядок', done: false },
    { text: 'Открыть список задач', done: true },
  ].map((item, i) => ({ ...item, id: createId(), createdAt: now - i }));
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>(() => loadTodos() ?? seed());
  const [undo, setUndo] = useState<Undo | null>(null);
  const [storageError, setStorageError] = useState(false);

  const todosRef = useRef(todos);
  const undoRef = useRef(undo);
  useLayoutEffect(() => {
    todosRef.current = todos;
    undoRef.current = undo;
  }, [todos, undo]);

  // Сохраняем при каждом изменении
  useEffect(() => {
    // Статус отражает результат синхронизации с внешним хранилищем.
    // oxlint-disable-next-line react/set-state-in-effect
    setStorageError(!saveTodos(todos));
  }, [todos]);

  // Подхватываем изменения из соседней вкладки
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== TODOS_KEY) return;
      const next = loadTodos();
      if (next) setTodos(next);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const add = useCallback((text: string): boolean => {
    const value = normalizeTodoText(text);
    if (!value) return false;
    setTodos((prev) => [{ id: createId(), text: value, done: false, createdAt: Date.now() }, ...prev]);
    return true;
  }, []);

  const toggle = useCallback((id: string) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }, []);

  const edit = useCallback((id: string, text: string) => {
    const value = normalizeTodoText(text);
    if (!value) return;
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, text: value } : t)));
  }, []);

  /** Удаляет задачи, подходящие под условие, и запоминает их для «Вернуть». */
  const removeWhere = useCallback((match: (todo: Todo) => boolean, message: string) => {
    const current = todosRef.current;
    const removed = current.flatMap((todo, index) => (match(todo) ? [{ todo, index }] : []));
    if (removed.length === 0) return;
    setUndo({ id: Date.now(), message, removed });
    setTodos(current.filter((todo) => !match(todo)));
  }, []);

  const remove = useCallback(
    (id: string) => removeWhere((t) => t.id === id, 'Задача удалена'),
    [removeWhere],
  );

  const clearDone = useCallback(
    () => removeWhere((t) => t.done, 'Выполненные удалены'),
    [removeWhere],
  );

  /**
   * Новый порядок приходит только для видимых задач (с учётом фильтра),
   * поэтому расставляем их по тем же местам, не трогая скрытые.
   */
  const reorder = useCallback((visibleInNewOrder: Todo[]) => {
    setTodos((prev) => {
      const byId = new Map(prev.map((t) => [t.id, t]));
      const queue = visibleInNewOrder.flatMap((t) => byId.get(t.id) ?? []);
      const moved = new Set(queue.map((t) => t.id));
      let i = 0;
      return prev.map((t) => (moved.has(t.id) ? queue[i++] : t));
    });
  }, []);

  /**
   * Возвращает удалённые задачи на прежние места. Остальные изменения,
   * сделанные пока висела плашка (отметки, новые задачи), сохраняются.
   */
  const applyUndo = useCallback(() => {
    const pending = undoRef.current;
    if (!pending) return;
    setTodos((prev) => {
      const next = [...prev];
      const present = new Set(prev.map((t) => t.id));
      for (const { todo, index } of pending.removed) {
        if (!present.has(todo.id)) next.splice(Math.min(index, next.length), 0, todo);
      }
      return next;
    });
    setUndo(null);
  }, []);

  const dismissUndo = useCallback(() => setUndo(null), []);

  return { todos, undo, storageError, add, toggle, edit, remove, clearDone, reorder, applyUndo, dismissUndo };
}
