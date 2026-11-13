import { motion } from 'motion/react';
import type { Theme } from '../types';

type Props = {
  value: Theme;
  onChange: (theme: Theme, origin: { x: number; y: number }) => void;
};

const OPTIONS: { id: Theme; label: string }[] = [
  { id: 'air', label: 'Воздух' },
  { id: 'night', label: 'Ночь' },
];

export function ThemeSwitch({ value, onChange }: Props) {
  return (
    <div className="switch" role="group" aria-label="Стиль оформления">
      {OPTIONS.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            className="switch__btn"
            aria-pressed={active}
            onClick={(event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              onChange(option.id, { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
            }}
          >
            {active && (
              <motion.span
                layoutId="switch-indicator"
                className="switch__indicator"
                transition={{ type: 'spring', stiffness: 480, damping: 36 }}
              />
            )}
            <span className="switch__label">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
