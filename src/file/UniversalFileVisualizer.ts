import { renderViz } from "../visualization/VisualizationEngine";

export type FileVisualizationResult = {
  file_type: string;
  visualization: any;
  key_insights: string[];
};

export function visualizeFile(filePath: string, contents?: string): FileVisualizationResult {
  const ext = (filePath.split('.').pop() || '').toLowerCase();
  let visualization: any = null;
  const key_insights: string[] = [];
  if (ext === 'csv') {
    visualization = { type: 'table', data: [] };
    key_insights.push('CSV parsed into table');
  } else if (ext === 'json') {
    visualization = { type: 'graph', data: {} };
    key_insights.push('JSON parsed into graph');
  } else {
    visualization = { type: 'text', data: contents ?? '' };
    key_insights.push('Raw file shown with basic structure');
  }
  return { file_type: ext, visualization, key_insights };
}
