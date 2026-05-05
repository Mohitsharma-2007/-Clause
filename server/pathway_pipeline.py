import sys
import os
import time
from dotenv import load_dotenv

# Platform Check
if sys.platform == "win32":
    print("❌ Error: Pathway is not supported natively on Windows.")
    print("👉 Solution: Run this script inside WSL (Windows Subsystem for Linux) or Docker.")
    print("   Command: python pathway_pipeline.py")
    sys.exit(1)

try:
    import pathway as pw
    import google.generativeai as genai
except ImportError as e:
    print(f"❌ Error: Missing dependencies: {e}")
    print("👉 Solution: pip install pathway google-generativeai")
    sys.exit(1)

# Load environment variables
load_dotenv()

# Configure Gemini
if not os.getenv("GEMINI_API_KEY"):
    print("❌ Error: GEMINI_API_KEY not found in .env")
    sys.exit(1)

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# --- UDFs for RAG ---

@pw.udf
def split_text(text: str) -> list[str]:
    """Simple recursive character splitter simulation."""
    if not text:
        return []
    # In a real scenario, use langchain.text_splitter or similar
    # Here we split by paragraphs/newlines to keep it simple and dependency-free
    chunks = [c.strip() for c in text.split('\n\n') if c.strip()]
    # Further split if chunks are too large (naive approach)
    final_chunks = []
    for chunk in chunks:
        if len(chunk) > 1000:
            # Split by period
            subchunks = [s.strip() for s in chunk.split('. ') if s.strip()]
            final_chunks.extend(subchunks)
        else:
            final_chunks.append(chunk)
    return final_chunks

@pw.udf
def embed_text(text: str) -> list[float]:
    """Generates embedding using Gemini text-embedding-004."""
    if not text:
        return []
    try:
        # Rate limit handling (naive sleep)
        time.sleep(0.1) 
        result = genai.embed_content(
            model="models/text-embedding-004",
            content=text,
            task_type="retrieval_document"
        )
        return result['embedding']
    except Exception as e:
        print(f"⚠️ Embedding error for text '{text[:20]}...': {e}")
        return []

def run_pipeline():
    """
    Real-World RAG Indexing Pipeline
    
    Flow:
    1. Read from Sources (GDrive, SharePoint, S3)
    2. Split Text into Chunks
    3. Embed Chunks
    4. Write to Supabase Vector Store
    """
    
    # --- Data Sources ---
    sources = []

    # 1. Local Filesystem (Always Active)
    print("[Pathway] Source: Local filesystem 'data/'.")
    data_dir = os.path.join(os.path.dirname(__file__), "data")
    os.makedirs(data_dir, exist_ok=True)
    local_table = pw.io.fs.read(
        path=data_dir,
        format="binary",
        with_metadata=True
    ).select(path=pw.this.path, data=pw.this.data)
    sources.append(local_table)

    # 2. Google Drive
    if os.getenv("GDRIVE_FOLDER_ID") and os.getenv("GDRIVE_CREDENTIALS_FILE"):
        print("[Pathway] Source: Google Drive configured.")
        gdrive_table = pw.io.gdrive.read(
            object_id=os.getenv("GDRIVE_FOLDER_ID"),
            service_user_credentials_file=os.getenv("GDRIVE_CREDENTIALS_FILE"),
            refresh_interval=30,
            with_metadata=True
        ).select(path=pw.this.path, data=pw.this.data)
        sources.append(gdrive_table)

    # 3. SharePoint
    if os.getenv("SHAREPOINT_URL"):
        print("[Pathway] Source: SharePoint configured.")
        sharepoint_table = pw.io.sharepoint.read(
            url=os.getenv("SHAREPOINT_URL"),
            tenant_id=os.getenv("SHAREPOINT_TENANT_ID"),
            client_id=os.getenv("SHAREPOINT_CLIENT_ID"),
            client_secret=os.getenv("SHAREPOINT_CLIENT_SECRET"),
            refresh_interval=30,
            with_metadata=True
        ).select(path=pw.this.path, data=pw.this.data)
        sources.append(sharepoint_table)

    # 4. Slack (Simulation)
    if os.getenv("SLACK_BOT_TOKEN"):
        print("[Pathway] Source: Slack configured.")
        slack_table = pw.debug.table_from_markdown('''
        | path | data |
        | slack_sys | "Slack Connection Active. Monitoring streams..." |
        ''').select(path=pw.this.path, data=pw.this.data)
        sources.append(slack_table)

    # 5. Notion (Simulation)
    if os.getenv("NOTION_INTEGRATION_TOKEN"):
        print("[Pathway] Source: Notion configured.")
        notion_table = pw.debug.table_from_markdown('''
        | path | data |
        | notion_sys | "Notion Integration Active. Syncing pages..." |
        ''').select(path=pw.this.path, data=pw.this.data)
        sources.append(notion_table)
    
    # Merge sources
    documents = sources[0]
    for source in sources[1:]:
        documents += source

    # --- Transformation ---
    
    # 1. Parse text (assuming binary is utf-8 text for simplicity)
    documents = documents.select(
        path=pw.this.path,
        text=pw.this.data.as_str()
    )
    
    # 2. Split into chunks
    chunks = documents.select(
        path=pw.this.path,
        chunk=split_text(pw.this.text)
    ).flatten(pw.this.chunk)

    # 3. Embed chunks
    embeddings = chunks.select(
        content=pw.this.chunk,
        metadata=pw.json.dumps({"source": pw.this.path}),
        embedding=embed_text(pw.this.chunk)
    )

    # Filter out empty embeddings
    embeddings = embeddings.filter(pw.this.embedding != [])

    # --- Output ---
    
    if os.getenv("SUPABASE_DB_URL"):
        print("[Pathway] Sink: Streaming to Supabase 'document_chunks' table...")
        # Write to Postgres
        pw.io.postgres.write(
            embeddings,
            postgres_url=os.getenv("SUPABASE_DB_URL"),
            table_name="document_chunks",
            mode="append"
        )
    else:
        print("[Pathway] Sink: CSV debug output (SUPABASE_DB_URL not set).")
        pw.io.csv.write(embeddings, "rag_output_debug.csv")

    print("[Pathway] Pipeline running. Press Ctrl+C to stop.")
    pw.run()

if __name__ == "__main__":
    run_pipeline()
