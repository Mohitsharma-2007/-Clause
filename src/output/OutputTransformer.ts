import { AgentOutput } from "../core/types";

export interface TransformedOutput {
  summary: string;
  agent_contributions: AgentOutput[];
  insights: string[];
  actions: string[];
  visuals?: any;
}

export function transformOutputs(outputs: AgentOutput[]): TransformedOutput {
  const summary = outputs.map(o => `${o.agent}: ${o.task_summary}`).join(" | ");
  const insights = outputs.flatMap(o => o.insights ?? []);
  const actions = outputs.flatMap(o => o.recommendations ?? []);
  return {
    summary,
    agent_contributions: outputs,
    insights,
    actions
  };
}
