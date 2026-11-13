export type Todo = {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
};

export type Filter = 'all' | 'active' | 'done';

export type Theme = 'air' | 'night';

/** simple — компактная колонка, studio — развёрнутый вид с панелью дня. */
export type Layout = 'simple' | 'studio';

/** Удалённые задачи и их места в списке — по ним работает «Вернуть». */
export type Undo = {
  id: number;
  message: string;
  removed: { todo: Todo; index: number }[];
};
