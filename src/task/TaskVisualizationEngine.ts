import { AgentOutput } from "../core/types";

export type TaskBoard = {
  todo: string[];
  in_progress: string[];
  done: string[];
};

export function transformToKanban(outputs: AgentOutput[]): TaskBoard {
  const board: TaskBoard = { todo: [], in_progress: [], done: [] };
  outputs.forEach(o => {
    board.todo.push(`${o.agent}: ${o.task_summary}`);
  });
  return board;
}

export function transformToTimeline(outputs: AgentOutput[]): any[] {
  return outputs.map(o => ({ id: o.agent, label: o.task_summary, time: new Date().toISOString(), value: o.confidence }));
}
