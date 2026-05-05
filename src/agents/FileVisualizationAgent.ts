import { BaseAgent } from "./BaseAgent";
import { AgentOutput } from "../core/types";

export class FileVisualizationAgent extends BaseAgent {
  public name = "FileVisualizationAgent";

  async onMessage(msg: any): Promise<AgentOutput | null> {
    if (msg && msg.intent === "request" && msg.data?.file) {
      const file = msg.data.file;
      const output: AgentOutput = {
        agent: this.name,
        task_summary: "Visualize uploaded file content.",
        insights: ["Parsed file: " + (file?.name ?? "unknown")],
        risks: ["File type not fully supported"],
        recommendations: ["Convert to supported formats"],
        confidence: 70
      };
      return output;
    }
    return null;
  }
}

export default FileVisualizationAgent;
