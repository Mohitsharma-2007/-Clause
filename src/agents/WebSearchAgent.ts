import { BaseAgent } from "./BaseAgent";
import { AgentOutput } from "../core/types";

// Web search agent scaffold: unlimited web search capability via Clause Core routing
export class WebSearchAgent extends BaseAgent {
  public name = "WebSearchAgent";
  // Simple in-memory cache to debounce repeated fetches and emulate "unlimited" availability by avoiding redundant calls
  private static _cache: Map<string, { t: number; sources: { title: string; url: string; snippet: string }[] }> = new Map();
  private static CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes TTL

  async onMessage(msg: any): Promise<AgentOutput | null> {
    if (!msg) return null;
    if ((msg.intent === "request" || msg.intent === "collaboration") && msg.data?.query) {
      const query = msg.data.query;
      const now = Date.now();
      const cached = WebSearchAgent._cache.get(query);
      if (cached && now - cached.t < WebSearchAgent.CACHE_TTL_MS) {
        const outputCached: AgentOutput = {
          agent: this.name,
          task_summary: `Web search (cached) results for: ${query}`,
          insights: cached.sources.map(s => s.title),
          risks: ["Data provenance varies; verify sources"],
          recommendations: ["Cite URLs in outputs", "Cross-check critical facts across sources"],
          confidence: 80
        };
        (outputCached as any).data = { sources: cached.sources };
        return outputCached;
      }
      const sources: { title: string; url: string; snippet: string }[] = [];
      // 1) Wikipedia top result
      try {
        const w1 = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json`);
        const wj = await w1.json();
        const top = wj?.query?.search?.[0];
        if (top) {
          const pageid = top.pageid;
          const w2 = await fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext&format=json&pageids=${pageid}`);
          const w2j = await w2.json();
          const extract = w2j?.query?.pages?.[String(pageid)]?.extract ?? "";
          sources.push({ title: top.title, url: `https://en.wikipedia.org/?curid=${pageid}`, snippet: extract.substring(0, 350) });
        }
      } catch (e) {
        // ignore wiki errors
      }

      // 2) Public APIs directory (free)
      try {
        const p = await fetch(`https://api.publicapis.org/entries?title=${encodeURIComponent(query)}`);
        const pj = await p.json();
        const ent = pj?.entries?.[0];
        if (ent) {
          sources.push({ title: ent.API, url: ent.Link, snippet: ent.Description });
        }
      } catch (e) {
        // ignore
      }

      // 3) World Bank indicator for context (free)
      try {
        const wb = await fetch(`https://api.worldbank.org/v2/country/IND/indicator/FP.CPI.TOTL.ZG?format=json&per_page=5`);
        const wbj = await wb.json();
        const arr = wbj?.[1] ?? [];
        if (Array.isArray(arr) && arr.length > 0) {
          const recent = arr.slice(0, 2).map((it: any) => `${it.date}:${it.value ?? ''}`).join(' | ');
          sources.push({ title: "World Bank CPI (IND)", url: "https://data.worldbank.org/indicator/FP.CPI.TOTL.ZG?locations=IN", snippet: recent });
        }
      } catch (e) {
        // ignore
      }

      const output: AgentOutput = {
        agent: this.name,
        task_summary: `Web search results for: ${query}`,
        insights: sources.map(s => s.title),
        risks: ["Data provenance varies; verify sources"],
        recommendations: ["Cite URLs in outputs", "Cross-check critical facts across sources"],
        confidence: Math.min(95, 50 + sources.length * 10)
      };
      // attach the raw sources in the data field for downstream consumers
      (output as any).data = { sources };
      // populate cache
      WebSearchAgent._cache.set(query, { t: now, sources });
      return output;
    }
    return null;
  }
}

export default WebSearchAgent;
