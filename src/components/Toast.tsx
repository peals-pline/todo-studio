import { AnimatePresence, motion } from 'motion/react';
import { useEffect } from 'react';
import type { Undo } from '../types';

type Props = {
  undo: Undo | null;
  onUndo: () => void;
  onDismiss: () => void;
};

const LIFETIME_MS = 5000;

export function Toast({ undo, onUndo, onDismiss }: Props) {
  const undoId = undo?.id;

  useEffect(() => {
    if (undoId === undefined) return;
    const timer = window.setTimeout(onDismiss, LIFETIME_MS);
    return () => window.clearTimeout(timer);
  }, [undoId, onDismiss]);

  return (
    <div className="toast-wrap" aria-live="polite">
      <AnimatePresence mode="wait">
        {undo && (
          <motion.div
            key={undo.id}
            className="toast"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97, transition: { duration: 0.16 } }}
            transition={{ type: 'spring', stiffness: 460, damping: 32 }}
          >
            <span>{undo.message}</span>
            <button type="button" className="toast__btn" onClick={onUndo}>
              Вернуть
            </button>
            <span className="toast__bar" style={{ animationDuration: `${LIFETIME_MS}ms` }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
