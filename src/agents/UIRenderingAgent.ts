import { BaseAgent } from "./BaseAgent";
import { AgentOutput, Message } from "../core/types";
import { renderSafeHtml } from "../ui/HTMLRenderer";

export class UIRenderingAgent extends BaseAgent {
  public name = "UIRenderingAgent";

  async onMessage(msg: any): Promise<AgentOutput | null> {
    if (msg && msg.intent === "request" && msg.data?.html) {
      const html = msg.data.html;
      const res = renderSafeHtml(html);
      const output: AgentOutput = {
        agent: this.name,
        task_summary: "Render HTML UI safely and extract DOM structure",
        insights: res.ui_insights,
        risks: ["XSS risk if sandboxing fails"],
        recommendations: ["Always run in sandbox", "Validate DOM structure"],
        confidence: 72
      };
      return output;
    }
    return null;
  }
}

export default UIRenderingAgent;
