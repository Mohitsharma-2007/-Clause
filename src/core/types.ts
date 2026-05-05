// Clause core types and interfaces

export type Message = {
  from: string;
  to: string;
  intent: "request" | "response" | "alert" | "collaboration";
  message: string;
  data?: any;
};

export type AgentOutput = {
  agent: string;
  task_summary: string;
  insights: string[];
  risks: string[];
  recommendations: string[];
  confidence: number;
};

export interface IAgent {
  name: string;
  initialize(core: any): Promise<void>;
  onMessage(msg: Message): Promise<AgentOutput | null>;
}

// Additional types for memory and tasks
export type ClauseTask = {
  id: string;
  title: string;
  description?: string;
  dependencies?: string[];
  required_by?: string[];
};

export type ClauseMemoryEntry = {
  id: string;
  agent: string;
  timestamp: string;
  summary: string;
  data?: any;
};

export interface MemoryStore {
  add(entry: ClauseMemoryEntry): void;
  getAll(): ClauseMemoryEntry[];
}

export interface AgentDeclaration {
  name: string;
  initializer?: () => Promise<void>;
}
