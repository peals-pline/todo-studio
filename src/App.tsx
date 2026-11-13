import { AnimatePresence, MotionConfig, Reorder, motion } from 'motion/react';
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { AddTodo } from './components/AddTodo';
import { Confetti } from './components/Confetti';
import { Filters } from './components/Filters';
import { Hero } from './components/Hero';
import { LayoutToggle } from './components/LayoutToggle';
import { Progress } from './components/Progress';
import { Ring } from './components/Ring';
import { Stats } from './components/Stats';
import { ThemeSwitch } from './components/ThemeSwitch';
import { Toast } from './components/Toast';
import { Today } from './components/Today';
import { TodoItem } from './components/TodoItem';
import { useLayout } from './hooks/useLayout';
import { useTheme } from './hooks/useTheme';
import { useTodos } from './hooks/useTodos';
import { plural } from './lib/plural';
import type { Filter } from './types';

const EMPTY_TEXT: Record<Filter, { title: string; note: string }> = {
  all: { title: 'Здесь пока пусто', note: 'Запишите первую задачу в поле выше' },
  active: { title: 'Всё сделано', note: 'Активных задач не осталось' },
  done: { title: 'Пока ничего не выполнено', note: 'Отмеченные задачи появятся здесь' },
};

const spring = { type: 'spring', stiffness: 520, damping: 40 } as const;

/** Задержка появления блока при загрузке: блоки поднимаются по очереди. */
const order = (i: number) => ({ '--i': i }) as CSSProperties;

export default function App() {
  const { todos, undo, storageError, add, toggle, edit, remove, clearDone, reorder, applyUndo, dismissUndo } = useTodos();
  const { theme, setTheme } = useTheme();
  const { layout, setLayout } = useLayout();
  const [filter, setFilter] = useState<Filter>('all');
  const [draft, setDraft] = useState('');
  const [burst, setBurst] = useState(0);

  const addTodo = useCallback((text: string): boolean => {
    if (!add(text)) return false;
    // Новая задача активна: показываем её даже из фильтра выполненных.
    setFilter((current) => current === 'done' ? 'all' : current);
    return true;
  }, [add]);

  const doneCount = todos.filter((t) => t.done).length;
  const activeCount = todos.length - doneCount;
  const counts: Record<Filter, number> = { all: todos.length, active: activeCount, done: doneCount };
  const complete = todos.length > 0 && activeCount === 0;

  const visible = useMemo(() => {
    if (filter === 'active') return todos.filter((t) => !t.done);
    if (filter === 'done') return todos.filter((t) => t.done);
    return todos;
  }, [todos, filter]);

  // Салют — только в момент, когда закрыли последнюю задачу, а не при загрузке страницы
  const wasComplete = useRef(complete);
  useEffect(() => {
    if (complete && !wasComplete.current) setBurst((n) => n + 1);
    wasComplete.current = complete;
  }, [complete]);

  /** Перемещение с клавиатуры: меняем местами с соседом в видимом списке. */
  const move = useCallback(
    (id: string, direction: -1 | 1) => {
      const from = visible.findIndex((t) => t.id === id);
      const to = from + direction;
      if (from < 0 || to < 0 || to >= visible.length) return;
      const next = [...visible];
      [next[from], next[to]] = [next[to], next[from]];
      reorder(next);
    },
    [visible, reorder],
  );

  // Ctrl/Cmd + Z возвращает последнее удаление, пока видна плашка
  useEffect(() => {
    if (!undo) return;
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA';
      if ((event.ctrlKey || event.metaKey) && event.code === 'KeyZ' && !event.shiftKey && !typing) {
        event.preventDefault();
        applyUndo();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [undo, applyUndo]);

  const empty = EMPTY_TEXT[filter];
  const studio = layout === 'studio';

  /** Поле ввода, фильтры и сам список — общие для обоих видов. */
  const board = (first: number) => (
    <>
      <div className="rise" style={order(first)}>
        <AddTodo value={draft} onValueChange={setDraft} onAdd={addTodo} />
        {storageError && (
          <p className="storage-warning" role="status">
            Не удалось сохранить задачи в браузере. Не закрывайте вкладку: после обновления изменения могут потеряться.
          </p>
        )}
      </div>

      <div className="rise" style={order(first + 1)}>
        <Filters value={filter} counts={counts} onChange={setFilter} />
      </div>

      <div className="rise" style={order(first + 2)}>
        <Reorder.Group as="ul" axis="y" values={visible} onReorder={reorder} className="list">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((todo) => (
              <TodoItem key={todo.id} todo={todo} onToggle={toggle} onEdit={edit} onRemove={remove} onMove={move} />
            ))}
          </AnimatePresence>
        </Reorder.Group>

        <AnimatePresence initial={false}>
          {visible.length === 0 && (
            <motion.div
              key={filter}
              className="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.12, duration: 0.3 } }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
            >
              <p className="empty__title">{empty.title}</p>
              <p className="empty__note">{empty.note}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.footer layout="position" className="footer" transition={spring}>
          <span>
            {activeCount === 0
              ? 'Нет активных задач'
              : `${plural(activeCount, ['Осталась', 'Осталось', 'Осталось'])} ${activeCount} ${plural(activeCount, ['задача', 'задачи', 'задач'])}`}
          </span>
          <AnimatePresence initial={false}>
            {doneCount > 0 && (
              <motion.button
                type="button"
                className="link-btn"
                onClick={clearDone}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Очистить выполненные
              </motion.button>
            )}
          </AnimatePresence>
        </motion.footer>

        <motion.p layout="position" className="hint" transition={spring}>
          Двойной клик — изменить текст · перетащите за точки — поменять порядок
        </motion.p>
      </div>
    </>
  );

  return (
    <MotionConfig reducedMotion="user">
      <div className={`app app--${layout}`}>
        <div className="topbar rise" style={order(0)}>
          <span className="brand">
            <span className="brand__mark" aria-hidden />
            To-Do
          </span>
          <div className="topbar__controls">
            <ThemeSwitch value={theme} onChange={setTheme} />
            <LayoutToggle value={layout} onChange={setLayout} />
          </div>
        </div>

        {studio ? (
          <div className="studio">
            <aside className="studio__side">
              <div className="studio__hero rise" style={order(1)}>
                <Hero active={activeCount} total={todos.length} />
              </div>
              <div className="rise" style={order(2)}>
                <Ring done={doneCount} total={todos.length} />
              </div>
              <div className="rise" style={order(3)}>
                <Stats total={todos.length} active={activeCount} done={doneCount} />
              </div>
            </aside>

            <main className="studio__board">
              <h1 className="title rise" style={order(2)}>
                Список задач
              </h1>
              {board(3)}
            </main>
          </div>
        ) : (
          <>
            <header className="header rise" style={order(1)}>
              <p className="date">
                <Today />
              </p>
              <h1 className="title">Список задач</h1>
              <Progress done={doneCount} total={todos.length} />
            </header>
            <main>{board(2)}</main>
          </>
        )}

        <Toast undo={undo} onUndo={applyUndo} onDismiss={dismissUndo} />
        <Confetti burst={burst} />
      </div>
    </MotionConfig>
  );
}
