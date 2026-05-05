export type VizBlock = {
  type: "bar" | "line" | "pie" | "scatter" | "heatmap" | "kpi" | "table" | "graph" | "mermaid" | "html";
  title?: string;
  x?: string;
  y?: string;
  data?: any[];
  [key: string]: any;
};

export type VizOutput = {
  visual_type: string;
  reasoning: string;
  render_block: string;
  insights: string[];
};

export function renderViz(data: any, intent: string, title?: string): VizOutput {
  let visual_type: VizBlock["type"] = "table";
  let reasoning = "";
  if (typeof data === "object" && data != null) {
    if (Array.isArray(data)) {
      visual_type = "table";
      reasoning = "Array of records; render as table.";
    } else if (data?.relationship) {
      visual_type = "graph";
      reasoning = "Relational data; render as graph.";
    } else if (data?.timeline) {
      visual_type = "line";
      reasoning = "Timeline data; render as line chart.";
    }
  }
  const render_block = `{"type":"${visual_type}","title":"${title ?? ''}","data":${JSON.stringify(data)}}`;
  const insights = ["Auto-generated visualization", "Supports further customization"];
  return {
    visual_type,
    reasoning,
    render_block,
    insights,
  };
}

export function mermaidFromGraph(graph: any): string {
  // Placeholder: convert to mermaid syntax
  return "graph TD; A-->B;";
}
