export const MAX_TODO_LENGTH = 200;

export function normalizeTodoText(text: string): string {
  return text.replace(/\s+/g, ' ').trim().slice(0, MAX_TODO_LENGTH);
}
