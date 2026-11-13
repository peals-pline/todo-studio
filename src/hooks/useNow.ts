import { useEffect, useState } from 'react';

/**
 * Текущее время устройства пользователя, обновляется раз в секунду.
 * Нужно часам в карточке дня и дате в шапке: если вкладка открыта через полночь,
 * дата сменится сама, без перезагрузки страницы.
 */
export function useNow(): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return now;
}
