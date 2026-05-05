import { BaseAgent } from "./BaseAgent";
import { AgentOutput } from "../core/types";

export class VisualizationControllerAgent extends BaseAgent {
  public name = "VisualizationControllerAgent";

  async onMessage(msg: any): Promise<AgentOutput | null> {
    if (msg && (msg.intent === "collaboration" || msg.intent === "request")) {
      const output: AgentOutput = {
        agent: this.name,
        task_summary: "Decide which visualization engine to trigger (Canvas, Chart, HTML Preview).",
        insights: ["Data-driven routing", "Multi-modal rendering enabled"],
        risks: [],
        recommendations: ["Route to VisualizationEngine", "Coordinate with CanvasEngine"],
        confidence: 78
      };
      return output;
    }
    return null;
  }
}

export default VisualizationControllerAgent;
