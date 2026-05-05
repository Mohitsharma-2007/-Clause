import os
import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai
# from ingestion import get_documents
# from utils import parse_pdf # utils imports pathway, might fail? Let's inline parsing or use safe imports

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Query(BaseModel):
    query: str

# Simple In-Memory RAG
CONTEXT_CACHE = []

def initialize_context():
    global CONTEXT_CACHE
    try:
        # Mocking getting text from documents
        # In a real Pathway app on Linux, this would be a streaming pipeline
        # Here we just load once for the demo
        import io
        import pdfplumber
        
        print("Syncing with Supabase Storage...")
        from supabase import create_client
        
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_KEY")
        
        # Define data_dir here, before usage
        data_dir = os.path.join(os.path.dirname(__file__), "data")
        os.makedirs(data_dir, exist_ok=True)
        
        if supabase_url and supabase_key:
            supabase = create_client(supabase_url, supabase_key)
            try:
                files = supabase.storage.from_("policies").list()
                if files:
                    for f in files:
                        if f['name'].endswith('.pdf'):
                            print(f"Downloading {f['name']}...")
                            data = supabase.storage.from_("policies").download(f['name'])
                            with open(os.path.join(data_dir, f['name']), 'wb') as out:
                                out.write(data)
            except Exception as e:
                print(f"Supabase sync warning: {e}")
        
        text_content = []
        for filename in os.listdir(data_dir):
            if filename.endswith(".pdf"):
                print(f"Parsing {filename}...")
                path = os.path.join(data_dir, filename)
                with pdfplumber.open(path) as pdf:
                    text = "\n".join(page.extract_text() or "" for page in pdf.pages)
                    text_content.append(text)
        
        CONTEXT_CACHE = text_content
        print(f"Loaded {len(CONTEXT_CACHE)} documents.")
        
    except Exception as e:
        print(f"Error loading context: {e}")

@app.on_event("startup")
async def startup_event():
    initialize_context()

@app.post("/")
async def answer_query(query: Query):
    context = "\n\n".join(CONTEXT_CACHE)
    if not context:
        context = "No policies loaded. Please upload a policy PDF."
    
    prompt = f"Context:\n{context}\n\nQuestion: {query.query}\n\nAnswer:"
    
    try:
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        # Return format matching what frontend expects (list of objects with answer)
        return [{"answer": response.text}]
    except Exception as e:
        return [{"answer": f"Error: {str(e)}"}]

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
