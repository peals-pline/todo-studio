import { motion } from 'motion/react';
import { AnimatedNumber } from './AnimatedNumber';

type Props = {
  done: number;
  total: number;
};

const RADIUS = 50;
const LENGTH = 2 * Math.PI * RADIUS;

/** Кольцо прогресса с процентом в центре. */
export function Ring({ done, total }: Props) {
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <section className="tile ring" aria-label={`Выполнено ${percent}%`}>
      <div className="ring__figure">
        <svg viewBox="0 0 120 120" className="ring__svg" aria-hidden>
          <circle cx="60" cy="60" r={RADIUS} className="ring__track" />
          <motion.circle
            cx="60"
            cy="60"
            r={RADIUS}
            className="ring__fill"
            transform="rotate(-90 60 60)"
            strokeDasharray={LENGTH}
            initial={false}
            animate={{ strokeDashoffset: LENGTH * (1 - percent / 100), opacity: percent > 0 ? 1 : 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 22 }}
          />
        </svg>
        <p className="ring__center">
          <span className="ring__value">
            <AnimatedNumber value={percent} />
            <span className="ring__percent">%</span>
          </span>
        </p>
      </div>
      <p className="ring__label">выполнено</p>
    </section>
  );
}
