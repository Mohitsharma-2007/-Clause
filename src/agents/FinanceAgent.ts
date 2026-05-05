import { BaseAgent } from "./BaseAgent";
import { AgentOutput, Message } from "../core/types";

export class FinanceAgent extends BaseAgent {
  public name = "FinanceAgent";

  async onMessage(msg: any): Promise<AgentOutput | null> {
    // Very lightweight placeholder logic
    if (!msg) return null;
    if (msg.intent === "request" || msg.intent === "collaboration") {
      const summary = "Assess financial risk and regulatory alignment for the requested task.";
      const output: AgentOutput = {
        agent: this.name,
        task_summary: summary,
        insights: ["Identified applicable controls", "Potential data quality issues"],
        risks: ["Regulatory ambiguity", "Data gaps"],
        recommendations: ["Clarify data sources", "Coordinate with Legal"],
        confidence: 70
      };
      return output;
    }
    return null;
  }
}

export default FinanceAgent;
