/** Сколько экран загрузки держится минимум, чтобы его анимация успела доиграть. */
const MIN_VISIBLE_MS = 1900;
const FADE_MS = 600;

/**
 * Прячет экран загрузки из index.html, когда приложение уже отрисовано
 * и шрифты загружены. После этого запускается появление блоков интерфейса.
 */
export function hideSplash(): void {
  const root = document.documentElement;
  const splash = document.getElementById('splash');

  if (!splash) {
    root.classList.remove('is-loading');
    return;
  }

  // performance.now() считает время с начала загрузки страницы
  const wait = Math.max(0, MIN_VISIBLE_MS - performance.now());
  const fontsReady = document.fonts?.ready ?? Promise.resolve();
  const minDelay = new Promise((resolve) => window.setTimeout(resolve, wait));

  void Promise.all([fontsReady, minDelay]).then(() => {
    splash.classList.add('splash--out');
    root.classList.remove('is-loading');
    window.setTimeout(() => splash.remove(), FADE_MS + 100);
  });
}
