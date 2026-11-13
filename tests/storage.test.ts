import { describe, expect, it, vi } from 'vitest';
import { createId, loadTodos, saveTodos, TODOS_KEY } from '../src/lib/storage';
import type { Todo } from '../src/types';

const task: Todo = { id: 'one', text: 'Задача', done: false, createdAt: 123 };

describe('storage', () => {
  it('отличает отсутствие записи от сохранённого пустого списка', () => {
    expect(loadTodos()).toBeNull();
    expect(saveTodos([])).toBe(true);
    expect(loadTodos()).toEqual([]);
  });

  it('сохраняет порядок, текст и отметки задач', () => {
    const tasks = [task, { ...task, id: 'two', done: true }];
    expect(saveTodos(tasks)).toBe(true);
    expect(loadTodos()).toEqual(tasks);
  });

  it.each(['{broken', '{}', 'null', '42'])('не падает на повреждённой записи %s', (raw) => {
    localStorage.setItem(TODOS_KEY, raw);
    expect(loadTodos()).toBeNull();
  });

  it('сохраняет корректные задачи, отбрасывая неверные поля', () => {
    localStorage.setItem(TODOS_KEY, JSON.stringify([
      null, task, { ...task, id: 1 }, { ...task, id: 'two', done: 'yes' },
    ]));
    expect(loadTodos()).toEqual([task]);
  });

  it.each([
    { id: '' }, { id: '   ' }, { text: '' }, { text: ' \t\n ' },
    { text: 'x'.repeat(201) }, { createdAt: null },
  ])('отбрасывает пустую или повреждённую задачу %j', (patch) => {
    localStorage.setItem(TODOS_KEY, JSON.stringify([{ ...task, ...patch }]));
    expect(loadTodos()).toEqual([]);
  });

  it('отбрасывает неограниченное числовое значение даты', () => {
    localStorage.setItem(TODOS_KEY, '[{"id":"one","text":"Задача","done":false,"createdAt":1e400}]');
    expect(loadTodos()).toEqual([]);
  });

  it('оставляет только первую задачу с одинаковым ID', () => {
    localStorage.setItem(TODOS_KEY, JSON.stringify([
      task, { ...task, text: 'Дубликат' }, { ...task, id: 'two' },
    ]));
    expect(loadTodos()).toEqual([task, { ...task, id: 'two' }]);
  });

  it('не падает при недоступном чтении', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    expect(loadTodos()).toBeNull();
  });

  it('сообщает об ошибке записи', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
    expect(saveTodos([task])).toBe(false);
  });

  it('создаёт различные ID для новых задач', () => {
    expect(createId()).not.toBe(createId());
  });
});
