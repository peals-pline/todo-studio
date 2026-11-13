import { motion } from 'motion/react';
import { useState } from 'react';

type Props = {
  checked: boolean;
  label: string;
  onChange: () => void;
};

export function Checkbox({ checked, label, onChange }: Props) {
  // Счётчик запускает «всплеск» только при живом клике, а не при загрузке страницы
  const [burst, setBurst] = useState(0);

  return (
    <motion.button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      className="check"
      whileTap={{ scale: 0.86 }}
      transition={{ type: 'spring', stiffness: 600, damping: 22 }}
      onClick={() => {
        if (!checked) setBurst((n) => n + 1);
        onChange();
      }}
    >
      {burst > 0 && checked && <span key={burst} className="check__burst" />}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
        <motion.path
          d="M4.5 12.5l5 5L19.5 7"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
          transition={{
            pathLength: { duration: checked ? 0.28 : 0.12, ease: 'easeOut', delay: checked ? 0.06 : 0 },
            opacity: { duration: 0.08 },
          }}
        />
      </svg>
    </motion.button>
  );
}
