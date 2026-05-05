import os
import sys
import time
import json
import google.generativeai as genai
import requests
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
import io
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

# Configure APIs
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

# GDrive Setup
CREDENTIALS_FILE = os.getenv("GDRIVE_CREDENTIALS_FILE")
FOLDER_ID = os.getenv("GDRIVE_FOLDER_ID")

def get_gdrive_service():
    creds = service_account.Credentials.from_service_account_file(CREDENTIALS_FILE)
    return build('drive', 'v3', credentials=creds)

def download_file(service, file_id):
    request = service.files().get_media(fileId=file_id)
    fh = io.BytesIO()
    downloader = MediaIoBaseDownload(fh, request)
    done = False
    while not done:
        status, done = downloader.next_chunk()
    return fh.getvalue()

def split_text(text, chunk_size=1000, chunk_overlap=200):
    chunks = []
    for i in range(0, len(text), chunk_size - chunk_overlap):
        chunks.append(text[i : i + chunk_size])
    return chunks

def embed_text(text):
    api_key = os.getenv("GEMINI_API_KEY")
    for attempt in range(3):
        try:
            time.sleep(1.0)
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key={api_key}"
            payload = {
                "content": {"parts": [{"text": text}]},
                "taskType": "RETRIEVAL_DOCUMENT",
                "outputDimensionality": 768
            }
            res = requests.post(url, json=payload, timeout=30)
            res.raise_for_status()
            res_data = res.json()
            return res_data['embedding']['values']
        except Exception as e:
            print(f"Embedding attempt {attempt+1} error: {e}")
            time.sleep(2)
    return None

def sync_gdrive():
    if not FOLDER_ID or not CREDENTIALS_FILE:
        print("GDrive not configured.")
        return

    service = get_gdrive_service()
    results = service.files().list(
        q=f"'{FOLDER_ID}' in parents and trashed=false",
        fields="files(id, name, mimeType)"
    ).execute()
    files = results.get('files', [])

    for f in files:
        if f['mimeType'] == 'application/pdf' or f['mimeType'] == 'text/plain':
            print(f"Processing {f['name']}...")
            
            # 1. Create Policy record
            policy_res = supabase.table("policies").select("id").eq("name", f["name"]).execute()
            if policy_res.data:
                policy_id = policy_res.data[0]["id"]
                # Optional: Delete old chunks
                try:
                    supabase.table("policy_chunks").delete().eq("policy_id", policy_id).execute()
                except: pass
            else:
                new_policy = supabase.table("policies").insert({
                    "name": f["name"],
                    "file_path": f["name"],
                    "status": "active"
                }).execute()
                policy_id = new_policy.data[0]["id"]

            # 2. Extract Text & Sync to Storage
            data = download_file(service, f['id'])
            
            # Sync to Supabase Storage (needed for preview)
            if f['mimeType'] == 'application/pdf':
                try:
                    # Upload to 'policies' bucket
                    # Note: Assistant.jsx expects filename to exist in 'policies' bucket
                    print(f"Syncing {f['name']} to Supabase Storage...")
                    supabase.storage.from_('policies').upload(
                        path=f["name"],
                        file=data,
                        file_options={"content-type": "application/pdf"}
                    )
                except Exception as e:
                    if "already exists" in str(e):
                        print(f"File {f['name']} already in storage.")
                    else:
                        print(f"Storage upload error: {e}")

            text = ""
            if f['mimeType'] == 'application/pdf':
                try:
                    import pdfplumber
                    with pdfplumber.open(io.BytesIO(data)) as pdf:
                        text = "\n".join(page.extract_text() or "" for page in pdf.pages)
                except Exception as e:
                    print(f"PDF parsing error: {e}")
            else:
                text = data.decode('utf-8', errors='ignore')

            if not text.strip():
                print(f"No text extracted from {f['name']}")
                continue

            # 3. Chunk and Embed
            chunks = split_text(text)
            print(f"Split into {len(chunks)} chunks. Processing embeddings...")
            for i, chunk in enumerate(chunks):
                vector = embed_text(chunk)
                if vector:
                    print(f"  Embedding generated for chunk {i}. Inserting to DB...")
                    metadata = {"source": f["name"], "path": f["name"], "chunk_index": i}
                    try:
                        supabase.table("policy_chunks").insert({
                            "policy_id": policy_id,
                            "chunk_text": chunk,
                            "chunk_index": i,
                            "metadata": json.dumps(metadata),
                            "embedding": vector
                        }).execute()
                    except Exception as e:
                        print(f"  DB Insert error at chunk {i}: {e}")
                else:
                    print(f"  Failed to generate embedding for chunk {i}")
            print(f"Finished {f['name']} (Chunks: {len(chunks)})")

if __name__ == "__main__":
    print("Starting Windows Sync...")
    try:
        sync_gdrive()
        print("Sync complete.")
    except Exception as e:
        print(f"Sync failed: {e}")
