import { AgentOutput } from "../core/types";

export type CanvasOutput = {
  canvas: {
    summary: string;
    agents: string[];
    visuals: any[];
    tasks: any[];
    html_preview: string;
    actions: string[];
  };
};

export function synthesizeCanvas(outputs: AgentOutput[], html_preview: string = ""): CanvasOutput {
  const agents = outputs.map(o => o.agent);
  const visuals = outputs.flatMap(o => o.insights);
  const tasks = outputs.map(o => ({ id: o.agent, summary: o.task_summary }));
  return {
    canvas: {
      summary: "Integrated multi-agent canvas",
      agents,
      visuals,
      tasks,
      html_preview,
      actions: outputs.map(o => `Follow-up with ${o.agent}`)
    }
  };
}
