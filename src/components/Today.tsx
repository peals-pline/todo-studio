import { useNow } from '../hooks/useNow';
import { formatDate } from '../lib/date';

/** Сегодняшняя дата для шапки простого вида; сама меняется после полуночи. */
export function Today() {
  return <>{formatDate(useNow())}</>;
}
