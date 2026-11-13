import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import App from '../src/App';
import { saveTodos } from '../src/lib/storage';

describe('App', () => {
  it('сохраняет черновик при переключении обоих видов', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByRole('textbox', { name: 'Новая задача' }), 'Мой черновик');
    await user.click(screen.getByRole('button', { name: 'Вернуться к простому виду' }));
    expect(screen.getByRole('textbox', { name: 'Новая задача' })).toHaveValue('Мой черновик');
    await user.click(screen.getByRole('button', { name: 'Открыть развёрнутый вид «Студия»' }));
    expect(screen.getByRole('textbox', { name: 'Новая задача' })).toHaveValue('Мой черновик');
  });

  it('показывает новую задачу при добавлении из выполненных', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /Выполненные/ }));
    await user.type(screen.getByRole('textbox', { name: 'Новая задача' }), 'Новая из фильтра{Enter}');
    expect(screen.getByRole('button', { name: /^Все/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Редактировать задачу: Новая из фильтра' })).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Новая задача' })).toHaveValue('');
  });

  it('отключает добавление пустой задачи', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByRole('textbox', { name: 'Новая задача' }), '   ');
    expect(screen.getByRole('button', { name: 'Добавить задачу' })).toBeDisabled();
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
  });

  it('позволяет редактировать с клавиатуры при сенсорном вводе', async () => {
    const media = window.matchMedia;
    vi.stubGlobal('matchMedia', (query: string) => ({ ...media(query), matches: true }));
    const user = userEvent.setup();
    render(<App />);
    const textButton = screen.getByRole('button', { name: 'Редактировать задачу: Добавить свою первую задачу' });
    textButton.focus();
    await user.keyboard('{Enter}');
    const input = screen.getByRole('textbox', { name: 'Текст задачи' });
    await user.clear(input);
    await user.type(input, 'Изменено с клавиатуры{Enter}');
    const saved = screen.getByRole('button', { name: 'Редактировать задачу: Изменено с клавиатуры' });
    await waitFor(() => expect(saved).toHaveFocus());
    await user.keyboard(' ');
    await user.clear(screen.getByRole('textbox', { name: 'Текст задачи' }));
    await user.type(screen.getByRole('textbox', { name: 'Текст задачи' }), 'Отменить{Escape}');
    expect(screen.getByRole('button', { name: 'Редактировать задачу: Изменено с клавиатуры' })).toBeVisible();
  });

  it('удаляет и возвращает задачу кнопкой отмены', async () => {
    const user = userEvent.setup();
    render(<App />);
    const row = screen.getByRole('button', { name: 'Редактировать задачу: Добавить свою первую задачу' }).closest('li')!;
    await user.click(within(row).getByRole('button', { name: 'Удалить' }));
    await user.click(screen.getByRole('button', { name: 'Вернуть' }));
    expect(screen.getByRole('button', { name: 'Редактировать задачу: Добавить свою первую задачу' })).toBeVisible();
  });

  it('показывает предупреждение, когда браузер не сохраняет данные', () => {
    saveTodos([]);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
    render(<App />);
    expect(screen.getByRole('status')).toHaveTextContent('Не удалось сохранить задачи');
  });
});
