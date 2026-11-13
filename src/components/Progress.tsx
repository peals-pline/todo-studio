import { motion } from 'motion/react';
import { AnimatedNumber } from './AnimatedNumber';

type Props = {
  done: number;
  total: number;
};

export function Progress({ done, total }: Props) {
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  const complete = total > 0 && done === total;

  return (
    <div className={`progress${complete ? ' is-complete' : ''}`}>
      <div
        className="progress__track"
        role="progressbar"
        aria-label="Выполнено задач"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
      >
        <motion.div
          className="progress__fill"
          initial={false}
          animate={{ width: `${percent}%` }}
          transition={{ type: 'spring', stiffness: 160, damping: 24 }}
        />
      </div>
      <p className="progress__label">
        {total === 0 ? (
          'Задач пока нет'
        ) : complete ? (
          'Всё выполнено'
        ) : (
          <>
            <AnimatedNumber value={done} /> из {total} выполнено
          </>
        )}
      </p>
    </div>
  );
}
