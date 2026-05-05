import { IAgent } from "../core/types";
import { ClauseCore } from "../core/ClauseCore";

// Base agent to be extended by specialized agents
export abstract class BaseAgent implements IAgent {
  public abstract name: string;
  protected core!: ClauseCore;
  async initialize(core: ClauseCore): Promise<void> { this.core = core; }
  abstract onMessage(msg: any): Promise<any>;
  // Optional helper to send messages via the core
  protected async request(to: string, intent: string, message: string, data?: any): Promise<void> {
    await this.core.sendMessage(to, this.name, intent as any, message, data);
  }
}

export default BaseAgent;
