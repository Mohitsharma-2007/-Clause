import { ClauseCore } from "./core/ClauseCore";
import { FinanceAgent } from "./agents/FinanceAgent";
import { WebSearchAgent } from "./agents/WebSearchAgent";
import { DataAnalystAgent } from "./agents/DataAnalystAgent";
import UIRenderingAgent from "./agents/UIRenderingAgent";
import OnboardingAgent from "./agents/OnboardingAgent";
import VisualizationControllerAgent from "./agents/VisualizationControllerAgent";
import SystemEvolutionAgent from "./agents/SystemEvolutionAgent";
import FileVisualizationAgent from "./agents/FileVisualizationAgent";
import PolicyDrafterAgent from "./agents/PolicyDrafterAgent";
import SmartVisualEnhancementAgent from "./agents/SmartVisualEnhancementAgent";
import { MemoryStore } from "./core/types";

export async function bootstrapClause(): Promise<{ core: ClauseCore; memory?: MemoryStore }> {
  const core = new ClauseCore();
  // Register modular agents
  core.registerAgent(new FinanceAgent());
  core.registerAgent(new DataAnalystAgent());
  core.registerAgent(new WebSearchAgent());
  core.registerAgent(new UIRenderingAgent());
  core.registerAgent(new OnboardingAgent());
  core.registerAgent(new VisualizationControllerAgent());
  core.registerAgent(new SystemEvolutionAgent());
  core.registerAgent(new FileVisualizationAgent());
  core.registerAgent(new PolicyDrafterAgent());
  core.registerAgent(new SmartVisualEnhancementAgent());
  await core.init();
  return { core };
}

export type { AgentOutput } from "./core/types";
