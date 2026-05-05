import { BaseAgent } from "./BaseAgent";
import { AgentOutput } from "../core/types";

export class OnboardingAgent extends BaseAgent {
  public name = "OnboardingAgent";

  async onMessage(msg: any): Promise<AgentOutput | null> {
    if (!msg) return null;
    if (msg.intent === "collaboration" || msg.intent === "request") {
      const output: AgentOutput = {
        agent: this.name,
        task_summary: "Configure onboarding for organization type and data requirements.",
        insights: ["Org type: undefined", "Data requirements: not specified"],
        risks: ["Misconfigured onboarding flow"],
        recommendations: ["Ask for organization type", "Provide templates for data intake"],
        confidence: 75
      };
      return output;
    }
    return null;
  }
}

export default OnboardingAgent;
