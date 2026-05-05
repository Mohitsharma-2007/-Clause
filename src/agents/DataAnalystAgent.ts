import { BaseAgent } from "./BaseAgent";
import { AgentOutput, Message } from "../core/types";

export class DataAnalystAgent extends BaseAgent {
  public name = "DataAnalystAgent";

  async onMessage(msg: any): Promise<AgentOutput | null> {
    if (!msg) return null;
    if (msg.intent === "request" || msg.intent === "collaboration") {
      const output: AgentOutput = {
        agent: this.name,
        task_summary: "Analyze dataset for trends, anomalies and segments.",
        insights: ["Counts: 1200 records", "Anomaly: 7% outliers", "Trend: growth 3.2%"],
        risks: ["Data quality", "Missing fields"],
        recommendations: ["Impute missing values", "Validate outliers"],
        confidence: 65
      };
      return output;
    }
    return null;
  }
}

export default DataAnalystAgent;
