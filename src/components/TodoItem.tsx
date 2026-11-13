import { Reorder, useDragControls } from 'motion/react';
import { forwardRef, useCallback, useRef, useState } from 'react';
import { MAX_TODO_LENGTH } from '../lib/todoText';
import type { Todo } from '../types';
import { Checkbox } from './Checkbox';
import { GripIcon, PencilIcon, TrashIcon } from './icons';

type Props = {
  todo: Todo;
  onToggle: (id: string) => void;
  onEdit: (id: string, text: string) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
};

const spring = { type: 'spring', stiffness: 520, damping: 40, mass: 0.9 } as const;

export const TodoItem = forwardRef<HTMLLIElement, Props>(function TodoItem(
  { todo, onToggle, onEdit, onRemove, onMove },
  ref,
) {
  const dragControls = useDragControls();
  const [dragging, setDragging] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.text);
  const skipBlur = useRef(false);
  const textRef = useRef<HTMLButtonElement>(null);
  const focusEditor = useCallback((node: HTMLInputElement | null) => { node?.focus(); }, []);

  const finishEdit = (restoreFocus: boolean) => {
    setEditing(false);
    if (restoreFocus) window.requestAnimationFrame(() => textRef.current?.focus());
  };

  const startEdit = () => {
    setDraft(todo.text);
    skipBlur.current = false;
    setEditing(true);
  };

  const commit = (restoreFocus = false) => {
    if (skipBlur.current) return;
    skipBlur.current = true;
    const value = draft.trim();
    if (value && value !== todo.text) onEdit(todo.id, value);
    finishEdit(restoreFocus);
  };

  const cancel = () => {
    skipBlur.current = true;
    finishEdit(true);
  };

  const className = ['todo', todo.done && 'is-done', dragging && 'is-dragging', editing && 'is-editing']
    .filter(Boolean)
    .join(' ');

  return (
    <Reorder.Item
      ref={ref}
      as="li"
      value={todo}
      className={className}
      dragListener={false}
      dragControls={dragControls}
      onDragStart={() => setDragging(true)}
      onDragEnd={() => setDragging(false)}
      // Сдвиг по y не анимируем: этой осью управляет перетаскивание
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.18, ease: 'easeOut' } }}
      transition={spring}
    >
      <button
        type="button"
        className="todo__handle"
        aria-label="Изменить порядок: перетащите или нажмите стрелку вверх или вниз"
        onPointerDown={(event) => dragControls.start(event)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowUp') {
            event.preventDefault();
            onMove(todo.id, -1);
          } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            onMove(todo.id, 1);
          }
        }}
      >
        <span className="todo__grip">
          <GripIcon />
        </span>
      </button>

      <Checkbox
        checked={todo.done}
        label={todo.done ? `Вернуть в работу: ${todo.text}` : `Отметить выполненной: ${todo.text}`}
        onChange={() => onToggle(todo.id)}
      />

      <div className="todo__body">
        {editing ? (
          <input
            ref={focusEditor}
            className="todo__edit"
            value={draft}
            maxLength={MAX_TODO_LENGTH}
            aria-label="Текст задачи"
            onFocus={(event) => event.currentTarget.select()}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={() => commit()}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.nativeEvent.isComposing) commit(true);
              if (event.key === 'Escape') cancel();
            }}
          />
        ) : (
          <button
            ref={textRef}
            type="button"
            className="todo__text"
            aria-label={`Редактировать задачу: ${todo.text}`}
            onDoubleClick={startEdit}
            onClick={(event) => {
              // Нативная кнопка поддерживает Enter, пробел и экранные дикторы.
              if (event.detail === 0 || window.matchMedia('(hover: none)').matches) startEdit();
            }}
          >
            <span className="todo__label">{todo.text}</span>
          </button>
        )}
      </div>

      <div className="todo__actions">
        <button type="button" className="icon-btn todo__edit-btn" aria-label="Редактировать" title="Редактировать" onClick={startEdit}>
          <PencilIcon />
        </button>
        <button
          type="button"
          className="icon-btn icon-btn--danger"
          aria-label="Удалить"
          title="Удалить"
          onClick={() => onRemove(todo.id)}
        >
          <TrashIcon />
        </button>
      </div>
    </Reorder.Item>
  );
});
