/**
 * Дата по-русски в часовом поясе устройства: «пятница, 13 ноября».
 * Intl берёт пояс из системы пользователя, поэтому в любой стране
 * показывается его собственная дата, а не дата сервера.
 */
const dateFormat = new Intl.DateTimeFormat('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });

export function formatDate(date: Date): string {
  return dateFormat.format(date);
}
