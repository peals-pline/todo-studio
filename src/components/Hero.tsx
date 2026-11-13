import { useNow } from '../hooks/useNow';
import { formatDate } from '../lib/date';
import { plural } from '../lib/plural';

type Props = {
  active: number;
  total: number;
};

function greeting(hour: number): string {
  if (hour < 5) return 'Доброй ночи';
  if (hour < 12) return 'Доброе утро';
  if (hour < 18) return 'Добрый день';
  return 'Добрый вечер';
}

function status(active: number, total: number): string {
  if (total === 0) return 'Список пуст — самое время что-нибудь запланировать';
  if (active === 0) return 'Всё сделано. Можно выдохнуть';
  return `${plural(active, ['Осталась', 'Осталось', 'Осталось'])} ${active} ${plural(active, ['задача', 'задачи', 'задач'])}`;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Карточка дня в развёрнутом виде: дата, живые часы и статус списка. */
export function Hero({ active, total }: Props) {
  // Таймер живёт здесь, чтобы раз в секунду перерисовывалась только карточка, а не весь список
  const now = useNow();
  const date = formatDate(now);
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());

  return (
    <section className="hero" aria-label="Сегодня">
      <div className="hero__art" aria-hidden>
        <i />
        <i />
        <i />
      </div>

      <p className="hero__date">{date}</p>

      <time className="hero__time" dateTime={`${hours}:${minutes}`} aria-label={`Сейчас ${hours}:${minutes}`}>
        <span>{hours}</span>
        <span className="hero__colon">:</span>
        <span>{minutes}</span>
      </time>

      <div className="hero__bottom">
        <p className="hero__greet">{greeting(now.getHours())}</p>
        <p className="hero__status">{status(active, total)}</p>
      </div>
    </section>
  );
}
