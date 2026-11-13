import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import { useEffect, useRef } from 'react';

type Props = {
  value: number;
  className?: string;
};

/**
 * Число, которое плавно досчитывает до нового значения (25 → 26 → … → 50)
 * и слегка «вздрагивает» в момент изменения. Соседние цифры не показываются.
 */
export function AnimatedNumber({ value, className }: Props) {
  const reduceMotion = useReducedMotion();
  const count = useMotionValue(value);
  const text = useTransform(count, (v) => String(Math.round(v)));
  const scale = useMotionValue(1);
  const previous = useRef(value);

  useEffect(() => {
    // Анимируем только настоящее изменение, а не первый показ
    if (previous.current === value) return;
    previous.current = value;

    if (reduceMotion) {
      count.set(value);
      return;
    }

    const distance = Math.abs(value - count.get());
    const counting = animate(count, value, {
      duration: Math.min(0.9, 0.25 + distance * 0.012),
      ease: [0.22, 0.8, 0.24, 1],
    });
    const pulse = animate(scale, [1, 1.08, 1], { duration: 0.42, ease: 'easeOut' });

    return () => {
      counting.stop();
      pulse.stop();
    };
  }, [value, count, scale, reduceMotion]);

  return (
    <motion.span className={`num${className ? ` ${className}` : ''}`} style={{ scale }}>
      {text}
    </motion.span>
  );
}
