import { motion } from 'motion/react';
import { useRef, type FormEvent } from 'react';
import { PlusIcon } from './icons';

type Props = {
  value: string;
  onValueChange: (value: string) => void;
  onAdd: (text: string) => boolean;
};

export function AddTodo({ value, onValueChange, onAdd }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isEmpty = value.trim() === '';

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (onAdd(value)) onValueChange('');
    inputRef.current?.focus();
  };

  return (
    <form className="add" onSubmit={submit}>
      <input
        ref={inputRef}
        className="add__input"
        value={value}
        maxLength={200}
        placeholder="Что нужно сделать?"
        aria-label="Новая задача"
        autoComplete="off"
        enterKeyHint="done"
        onChange={(event) => onValueChange(event.target.value)}
      />
      <motion.button
        type="submit"
        className="add__btn"
        aria-label="Добавить задачу"
        disabled={isEmpty}
        aria-disabled={isEmpty}
        whileHover={isEmpty ? undefined : { scale: 1.05 }}
        whileTap={isEmpty ? undefined : { scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 500, damping: 24 }}
      >
        <PlusIcon />
      </motion.button>
    </form>
  );
}
