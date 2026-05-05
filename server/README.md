# Clause Backend

This service handles document ingestion, parsing, and RAG logic using Pathway.

## Setup

1. Create a virtual environment:
   ```bash
   python -m venv venv
   venv\Scripts\activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the service:
   ```bash
   python rag.py
   ```
   The service will listen on `http://localhost:8000`.

## Configuration
See `.env.example` (copy to `.env`).
