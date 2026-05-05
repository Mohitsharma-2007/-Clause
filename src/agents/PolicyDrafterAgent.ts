import { BaseAgent } from "./BaseAgent";
import { AgentOutput } from "../core/types";

export class PolicyDrafterAgent extends BaseAgent {
  public name = "PolicyDrafterAgent";

  async onMessage(msg: any): Promise<AgentOutput | null> {
    if (msg && (msg.intent === "collaboration" || msg.intent === "request")) {
      const output: AgentOutput = {
        agent: this.name,
        task_summary: "Draft policy sections with definitions and controls.",
        insights: ["Policy scope determined by task", "Definitions clarified"],
        risks: ["Ambiguity in policy language"],
        recommendations: ["Provide examples", "Align to governance framework"] ,
        confidence: 77
      };
      return output;
    }
    return null;
  }
}

export default PolicyDrafterAgent;
