"""
Clause Backend — FastAPI Application
Complete API service for the Clause compliance automation platform.
"""
import os
import io
import pdfplumber
import uvicorn
from fastapi import FastAPI, Request, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai
from supabase import create_client

from rule_extractor import extract_rules
from violation_scanner import scan_for_violations
from utils import parse_pdf, chunk_text

load_dotenv()

# --- App Setup ---
app = FastAPI(title="Clause API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Supabase Client ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = None
if SUPABASE_URL and SUPABASE_KEY and SUPABASE_KEY != "YOUR_SUPABASE_ANON_KEY":
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    print(f"[Clause] Supabase connected: {SUPABASE_URL}")
else:
    print("[Clause] WARNING: Supabase not configured. Some features will be unavailable.")

# --- In-Memory Context Cache ---
CONTEXT_CACHE = []


def load_context():
    """Sync policy PDFs from Supabase Storage and parse them into text."""
    global CONTEXT_CACHE
    data_dir = os.path.join(os.path.dirname(__file__), "data")
    os.makedirs(data_dir, exist_ok=True)

    if supabase:
        try:
            files = supabase.storage.from_("policies").list()
            if files:
                for f in files:
                    if f["name"].endswith(".pdf"):
                        print(f"  Downloading {f['name']}...")
                        data = supabase.storage.from_("policies").download(f["name"])
                        with open(os.path.join(data_dir, f["name"]), "wb") as out:
                            out.write(data)
        except Exception as e:
            print(f"  Supabase sync warning: {e}")

    text_content = []
    for filename in os.listdir(data_dir):
        if filename.endswith(".pdf"):
            print(f"  Parsing {filename}...")
            path = os.path.join(data_dir, filename)
            with pdfplumber.open(path) as pdf:
                text = "\n".join(page.extract_text() or "" for page in pdf.pages)
                text_content.append(text)

    CONTEXT_CACHE = text_content
    print(f"[Clause] Loaded {len(CONTEXT_CACHE)} documents into context.")


@app.on_event("startup")
async def startup_event():
    print("[Clause] Starting Clause Backend Service...")
    load_context()
    print("[Clause] Backend ready.")


# --- Pydantic Models ---
class QueryRequest(BaseModel):
    query: str
    user_context: dict | None = None

class ViolationAction(BaseModel):
    action: str  # "Resolved" or "Dismissed"


# ============================================================
# ENDPOINT: /api/query — RAG Query (Chat with policies)
# ============================================================
@app.post("/api/query")
async def query_rag(req: QueryRequest):
    context = "\n\n".join(CONTEXT_CACHE)
    if not context:
        context = "No policies loaded yet. Please upload a policy PDF in the Knowledge Vault."

    # Build context string from user profile
    user_info = ""
    if req.user_context:
        ind = req.user_context.get('industry', {}).get('industry', 'Unknown Industry')
        scale = req.user_context.get('scale', 'Unknown Scale')
        role = req.user_context.get('persona', 'Assistant')
        user_info = f"User Context: {ind} ({scale}). Persona: {role}."

    # --- Fetch Knowledge Vault Context ---
    vault_context = "No connected Knowledge Vault sources."
    vault_chunks = []
    try:
        # 1. Active Connections
        active_sources = []
        if os.getenv("GDRIVE_CREDENTIALS_FILE"): active_sources.append("Google Drive")
        if os.getenv("SHAREPOINT_URL"): active_sources.append("SharePoint")
        if os.getenv("SLACK_BOT_TOKEN"): active_sources.append("Slack")
        
        # 2. Vector Search for Relevant Content
        if supabase:
            try:
                # Generate Query Embedding
                api_key = os.getenv("GEMINI_API_KEY")
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key={api_key}"
                payload = {
                    "content": {"parts": [{"text": req.query}]},
                    "taskType": "RETRIEVAL_QUERY",
                    "outputDimensionality": 768
                }
                res = requests.post(url, json=payload, timeout=30)
                res.raise_for_status()
                embedding = res.json()['embedding']['values']
                
                # Perform Search using RPC
                search_res = supabase.rpc("match_policy_chunks", {
                    "query_embedding": str(embedding),
                    "match_threshold": 0.5,
                    "match_count": 5
                }).execute()
                
                if search_res.data:
                    vault_chunks = search_res.data
            except Exception as e:
                print(f"[Clause] Search error: {e}")

        # 3. List All Indexed Files for Status
        indexed_files = []
        if supabase:
            try:
                # Get unique names from policies table
                res = supabase.table("policies").select("name").execute()
                if res.data:
                    indexed_files = [r["name"] for r in res.data]
            except Exception as e:
                print(f"[Clause] Vault filenames error: {e}")

        vault_summary = f"**Active Vault Connections:** {', '.join(active_sources) if active_sources else 'None'}\n"
        if indexed_files:
            vault_summary += "**Ingested Files:** " + ", ".join(indexed_files[:10])
            if len(indexed_files) > 10: vault_summary += f" (+{len(indexed_files)-10} more)"
        else:
            vault_summary += "(No files ingested yet)"
            
        vault_context = vault_summary

    except Exception as e:
        print(f"[Clause] Error building vault context: {e}")

    # Combine all context
    vault_rag_context = "\n\n".join([c["chunk_text"] for c in vault_chunks])
    
    prompt = f"""You are Clause AI, an advanced compliance agent.
{user_info}

Knowledge Vault Status:
{vault_context}

Relevant Context from Knowledge Vault:
---
{vault_rag_context}
---

Context from Policy PDFs (Manual Uploads):
---
{context[:20000]}
---

User Question: {req.query}

Instructions:
1. Analyze the question based on the provided policy context.
2. Formulate a comprehensive answer using Markdown.
3. CRITICAL: When referencing policies, quote specific statements or highlight points exactly as they appear in the text using > blockquotes.
4. Show your reasoning process (chain of thought).
5. Suggest 3 relevant follow-up actions.
6. List the filenames of the source documents you used (if any).

Return ONLY a valid JSON object with these fields:
- "answer": The markdown-formatted response.
- "reasoning": A step-by-step explanation.
- "actions": A list of 3 short follow-up actions.
- "citations": A list of strings (filenames) of the source documents referenced.

JSON Output:"""

    try:
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        
        text = response.text.strip()
        
        # Robust JSON extraction using Regex
        import re
        import json
        
        try:
            # Try to find the JSON block
            json_match = re.search(r"\{.*\}", text, re.DOTALL)
            if json_match:
                data = json.loads(json_match.group(0))
            else:
                # Try direct load if regex fails
                data = json.loads(text)
                
            return [data]
        except json.JSONDecodeError:
            print(f"JSON Parse Error. Raw text: {text}")
            # Fallback if json parse completely fails
            return [{
                "answer": response.text, 
                "reasoning": "Standard response (JSON Parse Failed).", 
                "actions": [],
                "citations": []
            }]
            
    except Exception as e:
        return [{"answer": f"Error: {str(e)}", "reasoning": "System Error", "actions": []}]


# Keep legacy endpoint for backward compatibility
@app.post("/")
async def legacy_query(req: QueryRequest):
    return await query_rag(req)


# ============================================================
# ENDPOINT: /api/documents — List uploaded documents
# ============================================================
@app.get("/api/documents")
async def list_documents():
    if not supabase:
        return {"documents": [], "error": "Supabase not configured"}

    try:
        files = supabase.storage.from_("policies").list()
        documents = []
        for f in files:
            if f.get("name") and not f["name"].startswith("."):
                documents.append({
                    "id": f.get("id", f["name"]),
                    "name": f["name"],
                    "size": f.get("metadata", {}).get("size", 0),
                    "created_at": f.get("created_at", ""),
                    "type": "PDF" if f["name"].endswith(".pdf") else "Other"
                })
        return {"documents": documents}
    except Exception as e:
        return {"documents": [], "error": str(e)}


# ============================================================
# ENDPOINT: /api/documents/upload — Upload & extract rules
# ============================================================
@app.post("/api/documents/upload")
async def upload_document(file: UploadFile = File(...)):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured")

    try:
        contents = await file.read()
        filename = file.filename or f"upload_{int(__import__('time').time())}.pdf"

        # 1. Upload to Supabase Storage
        supabase.storage.from_("policies").upload(filename, contents)

        # 2. Parse the PDF text
        text = parse_pdf(contents)

        # 3. Extract compliance rules using Gemini
        rules = extract_rules(text, source_document=filename)

        # 4. Store rules in Supabase
        stored_rules = []
        for rule in rules:
            result = supabase.table("ai_rules").insert({
                "title": rule["title"],
                "description": rule["description"],
                "severity": rule["severity"],
                "source_document": rule["source_document"]
            }).execute()
            if result.data:
                stored_rules.append(result.data[0])

        # 5. Refresh context cache
        load_context()

        return {
            "success": True,
            "filename": filename,
            "rules_extracted": len(stored_rules),
            "rules": stored_rules
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# ENDPOINT: /api/rules — List all extracted compliance rules
# ============================================================
@app.get("/api/rules")
async def list_rules():
    if not supabase:
        return {"rules": [], "error": "Supabase not configured"}

    try:
        result = supabase.table("ai_rules").select("*").order("created_at", desc=True).execute()
        return {"rules": result.data or []}
    except Exception as e:
        return {"rules": [], "error": str(e)}



# ============================================================
# ENDPOINT: /api/violations/{id}/action — Update violation status
# ============================================================
@app.patch("/api/violations/{violation_id}/action")
async def update_violation(violation_id: str, body: ViolationAction):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured")

    if body.action not in ("Resolved", "Dismissed"):
        raise HTTPException(status_code=400, detail="Action must be 'Resolved' or 'Dismissed'")

    try:
        result = supabase.table("ai_violations").update(
            {"status": body.action}
        ).eq("id", violation_id).execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Violation not found")

        return {"success": True, "violation": result.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# ENDPOINT: /api/reports/stats — Dashboard KPIs
# ============================================================
@app.get("/api/reports/stats")
async def get_stats():
    if not supabase:
        return {
            "total_documents": 0,
            "active_rules": 0,
            "violations_detected": 0,
            "high_severity_alerts": 0,
            "pending_violations": 0,
            "resolved_violations": 0
        }

    try:
        # Count documents
        docs = supabase.storage.from_("policies").list()
        doc_count = len([d for d in docs if d.get("name") and not d["name"].startswith(".")]) if docs else 0

        # Count rules
        rules = supabase.table("ai_rules").select("id", count="exact").execute()
        rule_count = rules.count if rules.count is not None else len(rules.data or [])

        # Count violations
        all_violations = supabase.table("ai_violations").select("*").execute()
        violations_data = all_violations.data or []

        total_violations = len(violations_data)
        high_severity = len([v for v in violations_data if v.get("severity") in ("Critical", "High")])
        pending = len([v for v in violations_data if v.get("status") == "Pending"])
        resolved = len([v for v in violations_data if v.get("status") == "Resolved"])

        return {
            "total_documents": doc_count,
            "active_rules": rule_count,
            "violations_detected": total_violations,
            "high_severity_alerts": high_severity,
            "pending_violations": pending,
            "resolved_violations": resolved
        }
    except Exception as e:
        return {
            "total_documents": 0,
            "active_rules": 0,
            "violations_detected": 0,
            "high_severity_alerts": 0,
            "pending_violations": pending if 'pending' in dir() else 0,
            "resolved_violations": 0,
            "error": str(e)
        }


# ============================================================
# ENDPOINT: /api/agent/execute — Perform generative actions
# ============================================================
class AgentAction(BaseModel):
    action: str
    context: dict | None = None

@app.post("/api/agent/execute")
async def execute_agent_action(req: AgentAction):
    print(f"[Agent] Executing action: {req.action}")
    
    # Simulate processing time for effect
    import time
    time.sleep(1.5)

    try:
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        model = genai.GenerativeModel("gemini-2.5-flash")
        
        prompt = f"""You are an autonomous AI agent for Clause.
User Action: "{req.action}"
Context: {req.context}

Task: Perform this action by generating the necessary content.
- If it's "Draft Policy", write a professional policy document in Markdown.
- If it's "Email", write a professional email draft.
- If it's "Schedule", confirm the meeting details.

Return ONLY JSON:
{{
    "success": true,
    "result": "Markown content of the artifact created",
    "file_type": "markdown | email | text",
    "summary": "Brief summary of what was done"
}}
"""
        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith("```"):
            text = "\n".join(text.split("\n")[1:-1])
        
        return __import__('json').loads(text)

    except Exception as e:
        return {
            "success": False, 
            "result": f"Failed to execute action: {str(e)}", 
            "summary": "Error"
        }

# ============================================================
# ENDPOINT: /api/config/gdrive — Upload Service Account JSON
# ============================================================
@app.post("/api/config/gdrive")
async def config_gdrive(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        creds_path = os.path.join(os.path.dirname(__file__), "credentials.json")
        with open(creds_path, "wb") as f:
            f.write(contents)
        
        # Update .env to point to this file (Persistent)
        env_path = os.path.join(os.path.dirname(__file__), ".env")
        with open(env_path, "a") as f:
            f.write(f"\nGDRIVE_CREDENTIALS_FILE={creds_path}")
            f.write(f"\nGDRIVE_FOLDER_ID=ROOT")

        # Runtime update
        os.environ["GDRIVE_CREDENTIALS_FILE"] = creds_path
        os.environ["GDRIVE_FOLDER_ID"] = "ROOT"
        
        return {"success": True, "message": "Google Drive credentials saved."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================
# ENDPOINT: /api/config/sharepoint — Save SharePoint Config
# ============================================================
class SharePointConfig(BaseModel):
    url: str
    tenant_id: str
    client_id: str
    client_secret: str

@app.post("/api/config/sharepoint")
async def config_sharepoint(req: SharePointConfig):
    try:
        # Runtime update
        os.environ["SHAREPOINT_URL"] = req.url
        os.environ["SHAREPOINT_TENANT_ID"] = req.tenant_id
        os.environ["SHAREPOINT_CLIENT_ID"] = req.client_id
        os.environ["SHAREPOINT_CLIENT_SECRET"] = req.client_secret

        # Persistent update
        env_path = os.path.join(os.path.dirname(__file__), ".env")
        with open(env_path, "a") as f:
            f.write(f"\nSHAREPOINT_URL={req.url}")
            f.write(f"\nSHAREPOINT_TENANT_ID={req.tenant_id}")
            f.write(f"\nSHAREPOINT_CLIENT_ID={req.client_id}")
            f.write(f"\nSHAREPOINT_CLIENT_SECRET={req.client_secret}")
        
        return {"success": True, "message": "SharePoint configuration saved."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================
# ENDPOINT: /api/config/slack — Save Slack Config
# ============================================================
class SlackConfig(BaseModel):
    bot_token: str
    channel_id: str

@app.post("/api/config/slack")
async def config_slack(req: SlackConfig):
    try:
        os.environ["SLACK_BOT_TOKEN"] = req.bot_token
        os.environ["SLACK_CHANNEL_ID"] = req.channel_id
        
        env_path = os.path.join(os.path.dirname(__file__), ".env")
        with open(env_path, "a") as f:
            f.write(f"\nSLACK_BOT_TOKEN={req.bot_token}")
            f.write(f"\nSLACK_CHANNEL_ID={req.channel_id}")
            
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================
# ENDPOINT: /api/config/notion — Save Notion Config
# ============================================================
class NotionConfig(BaseModel):
    integration_token: str

@app.post("/api/config/notion")
async def config_notion(req: NotionConfig):
    try:
        os.environ["NOTION_INTEGRATION_TOKEN"] = req.integration_token
        
        env_path = os.path.join(os.path.dirname(__file__), ".env")
        with open(env_path, "a") as f:
            f.write(f"\nNOTION_INTEGRATION_TOKEN={req.integration_token}")
            
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================
# ENDPOINT: /api/config/generic — Save Custom Source Config
# ============================================================
class GenericConfig(BaseModel):
    source_name: str
    api_key: str
    endpoint_url: str

@app.post("/api/config/generic")
async def config_generic(req: GenericConfig):
    try:
        # Sanitize name
        clean_name = req.source_name.upper().replace(" ", "_")
        
        os.environ[f"{clean_name}_API_KEY"] = req.api_key
        os.environ[f"{clean_name}_ENDPOINT"] = req.endpoint_url
        
        env_path = os.path.join(os.path.dirname(__file__), ".env")
        with open(env_path, "a") as f:
            f.write(f"\n{clean_name}_API_KEY={req.api_key}")
            f.write(f"\n{clean_name}_ENDPOINT={req.endpoint_url}")
            
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



# ============================================================
# ENDPOINT: /api/config/status — Check configured sources
# ============================================================
@app.get("/api/config/status")
async def get_config_status():
    status = {
        "Google Drive": bool(os.getenv("GDRIVE_CREDENTIALS_FILE")),
        "SharePoint": bool(os.getenv("SHAREPOINT_URL")),
        "Slack": bool(os.getenv("SLACK_BOT_TOKEN")),
        "Notion": bool(os.getenv("NOTION_INTEGRATION_TOKEN")),
        # Add others as needed by checking their specific env vars
    }
    # Check for generic sources
    for key in os.environ:
        if key.endswith("_API_KEY") and key not in ["GEMINI_API_KEY", "SUPABASE_KEY"]:
            source_name = key.replace("_API_KEY", "").replace("_", " ").title()
            status[source_name] = True
            
    return {"connected": [k for k, v in status.items() if v]}

# ============================================================
# ENDPOINT: /api/pipeline/start — Start Pathway Auto-Sync
# ============================================================
import subprocess
import sys

pipeline_process = None

@app.post("/api/pipeline/start")
async def start_pipeline():
    global pipeline_process
    if pipeline_process and pipeline_process.poll() is None:
        return {"success": True, "message": "Pipeline is already running."}

    try:
        # Detect OS and pick script
        script_name = "pathway_pipeline.py"
        if sys.platform == "win32":
            script_name = "windows_ingestion.py"
            print(f"[Clause] Windows detected. Using fallback ingestion: {script_name}")

        script_path = os.path.join(os.path.dirname(__file__), script_name)
        
        # Use the same python interpreter
        pipeline_process = subprocess.Popen(
            [sys.executable, script_path],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        return {"success": True, "message": f"Auto-Sync Pipeline ({script_name}) started."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================
# ENDPOINT: /api/pipeline/status — Check Pipeline Status
# ============================================================
@app.get("/api/pipeline/status")
async def get_pipeline_status():
    global pipeline_process
    is_running = pipeline_process is not None and pipeline_process.poll() is None
    return {"running": is_running}


# ============================================================
# MAIN
# ============================================================

# ============================================================
# ENDPOINT: /api/dashboard — Metrics & Activity
# ============================================================
@app.get("/api/dashboard")
async def get_dashboard():
    if not supabase:
        return {
            "activePolicies": 0,
            "complianceScore": "0%",
            "criticalRisks": 0,
            "systemUptime": "99.9%",
            "recentActivity": []
        }
    
    try:
        # 1. Total Policies
        policies_res = supabase.table("policies").select("id", count="exact").execute()
        total_policies = policies_res.count if policies_res.count is not None else 0

        # 2. Critical Risks (Pending violations with high/critical severity)
        violations_res = supabase.table("ai_violations").select("*").eq("status", "Pending").execute()
        violations = violations_res.data or []
        critical_count = len([v for v in violations if v.get("severity") in ("Critical", "High")])

        # 3. Compliance Score (Dynamic calculation)
        base_score = 100
        deduction = (len(violations) * 5) + (critical_count * 10)
        score = max(0, min(100, base_score - deduction))

        # 4. Recent Activity
        # Mix of policy updates and violation detections
        activity = []
        for p in (supabase.table("policies").select("name, created_at").order("created_at", desc=True).limit(3).execute().data or []):
            activity.append({
                "type": "policy",
                "title": "Policy Indexed",
                "detail": f"The document '{p['name']}' has been successfully analyzed.",
                "time": p["created_at"]
            })
        
        for v in (supabase.table("ai_violations").select("rule_title, created_at").order("created_at", desc=True).limit(3).execute().data or []):
            activity.append({
                "type": "violation",
                "title": "Violation Detected",
                "detail": f"AI flagged a potential risk in {v['rule_title']}.",
                "time": v["created_at"]
            })
        
        # Sort by time
        activity.sort(key=lambda x: x["time"], reverse=True)

        return {
            "activePolicies": total_policies,
            "complianceScore": f"{score}%",
            "criticalRisks": critical_count,
            "systemUptime": "99.9%",
            "recentActivity": activity[:5]
        }
    except Exception as e:
        print(f"Dashboard error: {e}")
        return {"error": str(e)}


# ============================================================
# ENDPOINT: /api/violations — Scan & List
# ============================================================
@app.get("/api/violations")
async def get_violations():
    if not supabase:
        return []
    try:
        res = supabase.table("ai_violations").select("*").order("created_at", desc=True).execute()
        return res.data or []
    except Exception as e:
        print(f"Fetch violations error: {e}")
        return []

@app.post("/api/violations/scan")
async def run_violation_scan():
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not connected")
    
    try:
        # 1. Get all policy text
        # For demo, we use the CONTEXT_CACHE if populated, otherwise query DB
        all_text = "\n\n".join(CONTEXT_CACHE)
        if not all_text:
            # Fallback to DB
            chunks = supabase.table("policy_chunks").select("chunk_text").execute()
            all_text = "\n\n".join([c["chunk_text"] for c in chunks.data]) if chunks.data else ""

        if not all_text:
            return {"success": False, "message": "No policy documents found to scan."}

        # 2. Extract Rules if none exist
        rules_res = supabase.table("ai_rules").select("*").execute()
        rules = rules_res.data or []
        
        if not rules:
            print("[Clause] No rules found. Extracting from documents...")
            extracted_rules = extract_rules(all_text)
            for r in extracted_rules:
                supabase.table("ai_rules").insert(r).execute()
            rules = supabase.table("ai_rules").select("*").execute().data or []

        # 3. Scan for Violations
        print(f"[Clause] Scanning {len(rules)} rules for violations...")
        found_violations = scan_for_violations(rules)
        
        # 4. Save results (and avoid duplicates if possible, or just append for demo)
        for v in found_violations:
            # Check if exists (simple check by title and entity)
            exists = supabase.table("ai_violations").select("id").eq("rule_title", v["rule_title"]).eq("entity", v["entity"]).execute()
            if not exists.data:
                supabase.table("ai_violations").insert(v).execute()

        return {"success": True, "message": f"Scan complete. Found {len(found_violations)} potential violations."}
    except Exception as e:
        print(f"Scan error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# ENDPOINT: /api/reports — Compliance Audits
# ============================================================
@app.get("/api/reports")
async def get_reports():
    # Templates for reports
    return [
        {
            "title": "Quarterly Compliance Audit",
            "description": "Comprehensive review of all indexed policies vs detected violations for Q1 2026.",
            "type": "audit",
            "icon": "bar-chart"
        },
        {
            "title": "Risk Assessment Report",
            "description": "AI-generated risk profile identifying critical gaps in data privacy and retention.",
            "type": "risk",
            "icon": "alert-triangle"
        },
        {
            "title": "Policy Drift Analysis",
            "description": "Tracks version history and changes across all connected policy sources.",
            "type": "drift",
            "icon": "pie-chart"
        }
    ]


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
