import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useTodos } from '../src/hooks/useTodos';
import { saveTodos, TODOS_KEY } from '../src/lib/storage';
import type { Todo } from '../src/types';

const tasks: Todo[] = [
  { id: 'a', text: 'Первая', done: false, createdAt: 1 },
  { id: 'b', text: 'Вторая', done: true, createdAt: 2 },
  { id: 'c', text: 'Третья', done: false, createdAt: 3 },
];

function setup(initial = tasks) {
  saveTodos(initial);
  return renderHook(() => useTodos());
}

describe('useTodos', () => {
  it('не принимает пустой ввод и нормализует пробелы', () => {
    const { result } = setup([]);
    act(() => { expect(result.current.add('   ')).toBe(false); });
    expect(result.current.todos).toEqual([]);
    act(() => { expect(result.current.add('  Новая   задача  ')).toBe(true); });
    expect(result.current.todos[0].text).toBe('Новая задача');
  });

  it('ограничивает длину текста при добавлении и редактировании', () => {
    const { result } = setup([]);
    act(() => { result.current.add('a'.repeat(300)); });
    expect(result.current.todos[0].text).toHaveLength(200);
    act(() => { result.current.edit(result.current.todos[0].id, 'b'.repeat(300)); });
    expect(result.current.todos[0].text).toHaveLength(200);
  });

  it('отмечает и редактирует только выбранную задачу', () => {
    const { result } = setup();
    act(() => { result.current.toggle('a'); result.current.edit('c', '  Новый   текст '); });
    expect(result.current.todos).toEqual([
      { ...tasks[0], done: true }, tasks[1], { ...tasks[2], text: 'Новый текст' },
    ]);
  });

  it('возвращает удалённое, сохраняя новые задачи и другие изменения', () => {
    const { result } = setup();
    act(() => { result.current.remove('b'); });
    act(() => { result.current.add('Новая'); result.current.toggle('a'); });
    act(() => { result.current.applyUndo(); });
    expect(result.current.todos).toHaveLength(4);
    expect(result.current.todos.find((t) => t.id === 'a')?.done).toBe(true);
    expect(result.current.todos.find((t) => t.id === 'b')).toEqual(tasks[1]);
    expect(result.current.todos.some((t) => t.text === 'Новая')).toBe(true);
    expect(result.current.undo).toBeNull();
  });

  it('очищает выполненные и восстанавливает их на прежних местах', () => {
    const { result } = setup();
    act(() => { result.current.clearDone(); });
    expect(result.current.todos.map((t) => t.id)).toEqual(['a', 'c']);
    act(() => { result.current.applyUndo(); });
    expect(result.current.todos).toEqual(tasks);
  });

  it('меняет порядок видимых задач, сохраняя место скрытой', () => {
    const { result } = setup();
    act(() => { result.current.reorder([tasks[2], tasks[0]]); });
    expect(result.current.todos.map((t) => t.id)).toEqual(['c', 'b', 'a']);
  });

  it('сохраняет изменения для следующего открытия', () => {
    const first = setup([]);
    act(() => { first.result.current.add('Сохранённая'); });
    first.unmount();
    const { result } = renderHook(() => useTodos());
    expect(result.current.todos[0].text).toBe('Сохранённая');
  });

  it('подхватывает изменения другой вкладки', () => {
    const { result } = setup();
    act(() => {
      saveTodos([]);
      window.dispatchEvent(new StorageEvent('storage', { key: TODOS_KEY }));
    });
    expect(result.current.todos).toEqual([]);
  });

  it('показывает состояние ошибки и снимает его после успешной записи', () => {
    const failingWrite = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
    const { result } = renderHook(() => useTodos());
    expect(result.current.storageError).toBe(true);
    failingWrite.mockRestore();
    act(() => { result.current.add('Сохранение восстановлено'); });
    expect(result.current.storageError).toBe(false);
  });
});
