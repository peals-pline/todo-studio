import { useEffect, useMemo, useState, type CSSProperties } from 'react';

type Props = {
  /** Каждое новое значение запускает один залп. Ноль — ничего не показывать. */
  burst: number;
};

const COLORS = ['var(--accent)', '#ffb547', '#ff6f91', '#4fd1a5', 'var(--text)'];
const PIECES = 34;
const LIFETIME_MS = 1900;

/** Детерминированный разброс: новый залп меняет рисунок без случайности в render. */
function noise(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

/** Небольшой салют, когда закрыта последняя задача. */
export function Confetti({ burst }: Props) {
  const [finishedBurst, setFinishedBurst] = useState(0);

  useEffect(() => {
    if (burst === 0) return;
    const timer = window.setTimeout(() => setFinishedBurst(burst), LIFETIME_MS);
    return () => window.clearTimeout(timer);
  }, [burst]);

  const pieces = useMemo(
    () =>
      Array.from({ length: PIECES }, (_, i) => {
        const seed = burst * PIECES + i;
        const angle = (i / PIECES) * Math.PI * 2 + noise(seed + 1) * 0.4;
        const distance = 140 + noise(seed + 101) * 220;
        return {
          '--x': `${Math.cos(angle) * distance}px`,
          '--up': `${Math.sin(angle) * distance * 0.7 - 120}px`,
          '--down': `${Math.sin(angle) * distance * 0.7 + 260}px`,
          '--r': `${noise(seed + 201) * 720 - 360}deg`,
          '--d': `${noise(seed + 301) * 90}ms`,
          '--c': COLORS[i % COLORS.length],
        } as CSSProperties;
      }),
    // новый разброс на каждый залп
    [burst],
  );

  if (burst === 0 || burst === finishedBurst) return null;

  return (
    <div className="confetti" aria-hidden>
      {pieces.map((style, i) => (
        <i key={`${burst}-${i}`} style={style} />
      ))}
    </div>
  );
}
