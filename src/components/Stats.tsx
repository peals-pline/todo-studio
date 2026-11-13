import { AnimatedNumber } from './AnimatedNumber';

type Props = {
  total: number;
  active: number;
  done: number;
};

export function Stats({ total, active, done }: Props) {
  const rows = [
    { label: 'Всего', value: total },
    { label: 'В работе', value: active },
    { label: 'Готово', value: done },
  ];

  return (
    <section className="tile stats" aria-label="Счётчики">
      {rows.map((row) => (
        <p key={row.label} className="stat">
          <span className="stat__label">{row.label}</span>
          <span className="stat__value">
            <AnimatedNumber value={row.value} />
          </span>
        </p>
      ))}
    </section>
  );
}
