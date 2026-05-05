# Clause Architecture (Updated)

Overview
- Clause now operates as a production-grade, modular multi-agent system with a central Clause Core orchestrator.
- The system supports inter-agent communication, a visualization canvas, HTML UI rendering, and universal file visualization. It is designed to scale across finance, legal, HR, government, and enterprise domains.

1. Master Orchestrator (Clause Core)
- Responsibilities: task decomposition, agent assignment, dependency management, inter-agent messaging, conflict resolution, and output aggregation.
- All agent communication must pass through Clause Core to preserve context and memory.
- WebSearchAgent is introduced to fetch up-to-date information; all web-derived data must be cited with URLs.

2. Agent Suite (specialized agents)
- FinanceAgent, LegalAgent, HR Agent, DataAnalystAgent, RiskAuditorAgent, PolicyDrafterAgent, OnboardingAgent, VisualizationControllerAgent, UIRenderingAgent, FileVisualizationAgent, SystemEvolutionAgent, WebSearchAgent (new)
- All agents implement a universal schema:
  {
    "agent": "...",
    "task_summary": "...",
    "insights": [...],
    "risks": [...],
    "recommendations": [...],
    "confidence": 0-100
  }
- Agents can collaborate and request data via Clause Core.

3. Inter-Agent Communication
- Message format:
  {
    "from": "agent",
    "to": "agent",
    "intent": "request | response | alert | collaboration",
    "message": "...",
    "data": {...}
  }
- Clause Core routes messages and maintains memory/context.

4. Visualization System (Next-Gen)
- Capabilities: charts, tables, graphs, mermaid diagrams, kanban, timelines, HTML preview, code structure visuals.
- Decision logic maps input types to visualization types as described in the plan.
- Outputs include reasoning and insights; emit clause:viz blocks for visualization data.

5. HTML + UI Visualization
- Render safe HTML in sandbox; extract DOM structure; provide UI insights and improvements.

6. Task Visualization
- Kanban, Dependency Graph, Timeline/Gantt, Priority Matrix; detect bottlenecks and critical paths.

7. Advanced Canvas System
- Layers: Summary, Agent Panels, Visualization, Tasks, HTML Preview, Action Panel.
- Merge multiple outputs into a single interactive canvas with live updates.

8. Visualization Controller
- Chooses engines and coordinates multi-modal rendering.

9. UI State Management
- Tracks active view, expanded panels, filters; supports responsive switching.

10. Universal File Visualization
- CSV/JSON/PDF/HTML/Markdown/Logs visualizations with raw + visual outputs.

11. Visual Enhancement
- Auto color logic, labels, legends, tooltips; decluttering and highlighting insights.

12. System Evolution Agent
- Meta-agent for weakness detection and UX/perf improvements.

13. Onboarding System
- Dynamic configuration for agents/workflows/data requirements by organization type.

14. Output Transformation
- Replace plain text with structured JSON and canvas outputs; include summary, contributions, insights, actions.

15. Backward Compatibility
- Existing prompts preserved; new orchestration layered on top.

This document is a living guide reflecting the upgraded Clause architecture.
