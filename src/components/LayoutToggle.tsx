import { motion } from 'motion/react';
import type { Layout } from '../types';

type Props = {
  value: Layout;
  onChange: (layout: Layout, origin: { x: number; y: number }) => void;
};

const SparkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 2.5l1.9 5.6a3 3 0 0 0 1.9 1.9l5.7 2-5.7 2a3 3 0 0 0-1.9 1.9L12 21.5l-1.9-5.6a3 3 0 0 0-1.9-1.9l-5.7-2 5.7-2a3 3 0 0 0 1.9-1.9L12 2.5Z" />
  </svg>
);

/** Переключает компактную колонку и развёрнутый вид «Студия». */
export function LayoutToggle({ value, onChange }: Props) {
  const studio = value === 'studio';

  return (
    <motion.button
      type="button"
      className="layout-btn"
      aria-pressed={studio}
      aria-label={studio ? 'Вернуться к простому виду' : 'Открыть развёрнутый вид «Студия»'}
      whileTap={{ scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 500, damping: 26 }}
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        onChange(studio ? 'simple' : 'studio', { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      }}
    >
      <SparkIcon />
      <span className="layout-btn__label">{studio ? 'Простой вид' : 'Студия'}</span>
    </motion.button>
  );
}
