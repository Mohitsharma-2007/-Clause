"""
Pathway Ingestion Module (Optional)
This module provides real-time document ingestion via the Pathway framework.
Pathway requires Linux/macOS — use WSL or Docker on Windows.

When Pathway is not available, the main app.py falls back to direct
Supabase Storage API for document management.
"""
import os
from dotenv import load_dotenv

load_dotenv()


def run_pathway_pipeline():
    """
    Start the Pathway real-time ingestion pipeline.
    This watches Supabase Storage (via S3 protocol) for new documents
    and automatically processes them.
    
    Requires: Linux/macOS or WSL/Docker on Windows.
    """
    try:
        import pathway as pw
    except ImportError:
        print("[Pathway] Pathway is not installed or not available on this platform.")
        print("[Pathway] Install with: pip install pathway")
        print("[Pathway] Note: Pathway requires Linux or macOS. Use WSL/Docker on Windows.")
        return

    # S3 Configuration for Supabase Storage
    if os.getenv("AWS_ACCESS_KEY_ID") and os.getenv("AWS_SECRET_ACCESS_KEY"):
        print("[Pathway] Using Supabase Storage (S3)...")
        documents = pw.io.s3.read(
            bucket_name="policies",
            region_name="us-east-1",
            endpoint_url=os.getenv("SUPABASE_S3_ENDPOINT", ""),
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
            format="binary",
            with_metadata=True
        )
    else:
        print("[Pathway] Falling back to local file system 'data/'...")
        data_dir = os.path.join(os.path.dirname(__file__), "data")
        os.makedirs(data_dir, exist_ok=True)
        documents = pw.io.fs.read(
            path=data_dir,
            format="binary",
            with_metadata=True
        )

    # Log ingested documents
    pw.io.csv.write(documents, "ingestion_debug.csv")
    print("[Pathway] Pipeline started. Press Ctrl+C to stop.")
    pw.run()


if __name__ == "__main__":
    run_pathway_pipeline()
