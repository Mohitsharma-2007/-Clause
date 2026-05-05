import { Message, AgentOutput, IAgent, ClauseTask, ClauseMemoryEntry, MemoryStore } from "./types";

// Central Clause Core orchestrator
export class ClauseCore {
  private agents: Map<string, IAgent> = new Map();
  private memory: MemoryStore = new InMemoryStore();
  private context: any;

  constructor(context?: any) {
    this.context = context || {};
  }

  public registerAgent(agent: IAgent): void {
    this.agents.set(agent.name, agent);
  }

  public async init(): Promise<void> {
    const initPromises: Promise<void>[] = [];
    for (const agent of this.agents.values()) {
      initPromises.push(agent.initialize(this));
    }
    await Promise.all(initPromises);
  }

  public async routeMessage(msg: Message): Promise<void> {
    const target = this.agents.get(msg.to);
    if (!target) {
      console.warn(`ClauseCore: Unknown target agent ${msg.to}`);
      return;
    }
    const output = await target.onMessage(msg);
    if (output) {
      this.aggregateOutput(output);
    }
  }

  private aggregateOutput(output: AgentOutput): void {
    const entry: ClauseMemoryEntry = {
      id: `${output.agent}-${Date.now()}`,
      agent: output.agent,
      timestamp: new Date().toISOString(),
      summary: output.task_summary,
      data: output
    };
    this.memory.add(entry);
  }

  public getMemory(): MemoryStore { return this.memory; }

  // Decompose and dispatch a high-level task (demonstration; concrete logic in real implementation)
  public decomposeAndDispatch(task: ClauseTask): void {
    // In a full implementation, this would break down the task and route to multiple agents.
    // Here we provide a placeholder to illustrate the flow.
    console.info(`[ClauseCore] Decomposing task ${task.id}: ${task.title}`);
  }

  // Lightweight message sender wrapper
  public async sendMessage(to: string, from: string, intent: Message["intent"], message: string, data?: any): Promise<void> {
    const m: Message = { from, to, intent, message, data };
    await this.routeMessage(m);
  }
}

class InMemoryStore implements MemoryStore {
  private entries: ClauseMemoryEntry[] = [];
  add(entry: ClauseMemoryEntry): void { this.entries.push(entry); }
  getAll(): ClauseMemoryEntry[] { return this.entries; }
}
