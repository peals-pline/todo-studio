import { useEffect, useMemo, useState, type CSSProperties } from 'react';

type Props = {
  /** Каждое новое значение запускает один залп. Ноль — ничего не показывать. */
  burst: number;
};

const COLORS = ['var(--accent)', '#ffb547', '#ff6f91', '#4fd1a5', 'var(--text)'];
const PIECES = 34;
const LIFETIME_MS = 1900;

/** Небольшой салют, когда закрыта последняя задача. */
export function Confetti({ burst }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (burst === 0) return;
    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), LIFETIME_MS);
    return () => window.clearTimeout(timer);
  }, [burst]);

  const pieces = useMemo(
    () =>
      Array.from({ length: PIECES }, (_, i) => {
        const angle = (i / PIECES) * Math.PI * 2 + Math.random() * 0.4;
        const distance = 140 + Math.random() * 220;
        return {
          '--x': `${Math.cos(angle) * distance}px`,
          '--up': `${Math.sin(angle) * distance * 0.7 - 120}px`,
          '--down': `${Math.sin(angle) * distance * 0.7 + 260}px`,
          '--r': `${Math.random() * 720 - 360}deg`,
          '--d': `${Math.random() * 90}ms`,
          '--c': COLORS[i % COLORS.length],
        } as CSSProperties;
      }),
    // новый разброс на каждый залп
    [burst],
  );

  if (!visible) return null;

  return (
    <div className="confetti" aria-hidden>
      {pieces.map((style, i) => (
        <i key={`${burst}-${i}`} style={style} />
      ))}
    </div>
  );
}
