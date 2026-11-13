import { motion } from 'motion/react';
import type { Filter } from '../types';

type Props = {
  value: Filter;
  counts: Record<Filter, number>;
  onChange: (filter: Filter) => void;
};

const OPTIONS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'active', label: 'Активные' },
  { id: 'done', label: 'Выполненные' },
];

export function Filters({ value, counts, onChange }: Props) {
  return (
    <div className="filters" role="group" aria-label="Фильтр задач">
      {OPTIONS.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            className="filter"
            aria-pressed={active}
            onClick={() => onChange(option.id)}
          >
            {active && (
              <motion.span
                layoutId="filter-indicator"
                className="filter__indicator"
                transition={{ type: 'spring', stiffness: 480, damping: 36 }}
              />
            )}
            <span className="filter__label">
              {option.label}
              <span className="filter__count">{counts[option.id]}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
