# Online Version with Supabase DB and Vercel (Frontend and Backend Hosting)

## System Architecture Flow

*   User → **Vercel Frontend**
*   Frontend → **Vercel API Routes**
*   API → **Supabase DB**
*   API → Embedding Model (API-based)
*   API → LLM (API-based)

---

## PART 1 – Tech Stack (Cloud Version)

### Frontend (Deploy on Vercel)

*   **Next.js** (recommended instead of plain React)
*   Tailwind CSS
*   ShadCN UI (optional)
*   **Chart.js** (for dashboards)

### Backend (Inside Next.js API routes)

*   Next.js API Routes
*   **TypeScript**
*   Supabase JS SDK

### Database

*   **Supabase PostgreSQL**
*   Supabase Storage (for PDFs)

### Vector Search

Two Options:

**Option A (Recommended):**
Use **Supabase pgvector extension**
It’s free and perfect.
*Docs:* `https://supabase.com/docs/guides/database/extensions/pgvector`

**Option B:**
Use external vector DB (*not needed for competition*)

### LLM & Embeddings

Since Vercel cannot run local models:

Use:

*   **Gemini AI API**

*These work perfectly with serverless.*

---

## How We Build Both Systems Together

*Let’s divide into clean modules.*

---

## MODULE 1 – Policy Ingestion

### Flow:

1.  Upload PDF → **Supabase Storage**
2.  API route extracts text (using `pdf-parse` in Node.js)
3.  Split into chunks
4.  Generate embeddings via API
5.  Store:
    *   chunk text
    *   embedding vector
    *   policy version
    *   metadata

inside Supabase table (with **pgvector**)

### Table: `policy_chunks`

| Fields | Description |
| :--- | :--- |
| `id` | |
| `policy_name` | |
| `chunk_text` | |
| `embedding` | (vector) |
| `version` | |
| `created_at` | |

Now you have searchable policy knowledge base. This completes **RAG foundation**.

---

## MODULE 2 – Interactive Mode (Ask Mode)

User asks: *“Does transaction 123 violate AML rule?”*

### Steps:

1.  Fetch transaction data from Supabase
2.  Convert question to embedding
3.  Perform vector similarity search in `policy_chunks`
4.  Retrieve **top 5 relevant chunks**
5.  Send:
    *   Transaction data
    *   Relevant policy chunks
    to LLM
6.  LLM returns:
    *   Yes/No
    *   Explanation
    *   Citation reference

**That satisfies Problem 1.**

---

## MODULE 3 – Rule Extraction Engine

When policy is uploaded:

Send policy text to LLM:

### Prompt:

*“Extract all compliance rules in structured JSON format.”*

### Store in table: `compliance_rules`

| Fields | Description |
| :--- | :--- |
| `id` | |
| `rule_name` | |
| `condition_expression` | |
| `severity` | |
| `policy_reference` | |
| `version` | |

**Example `condition_expression`:** `amount > 1000000 AND country != "India"`

Now you have structured rules.

---

## MODULE 4 – Automatic Scanning (Auto Mode)

You cannot run background workers on Vercel continuously.

### Solution:

Use Supabase Edge Functions
OR
Use **Vercel Cron Jobs (Recommended)**
Vercel has cron scheduling.

### Flow:

Every 6 hours:

1.  Fetch new transactions
2.  Fetch active rules
3.  Evaluate rules in **TypeScript**
4.  If violation:
    Insert into `violations` table

### Table: `violations`

| Fields | Description |
| :--- | :--- |
| `id` | |
| `transaction_id` | |
| `rule_id` | |
| `explanation` | |
| `status` | (pending / approved / dismissed) |
| `created_at` | |

**That satisfies Problem 2.**

---

## MODULE 5 – Human Review Dashboard

### Frontend page:

*   List violations
*   Show:
    *   Transaction details
    *   Rule violated
    *   Policy citation
*   Buttons:
    *   Approve
    *   Dismiss
    *   Add comment

All connected to Supabase.

---

## MODULE 6 – Reports & Trends

*   Use:
    *   **Chart.js**
    *   Aggregate queries from Supabase
*   Generate PDF using:
    *   `pdf-lib` (Node.js)
*   *Optional:* Export audit report.

---

## FULL STACK (Final Clean Version)

| Component | Technology |
| :--- | :--- |
| **Frontend** | Next.js + Tailwind + **Vercel** |
| **Backend** | Next.js API routes |
| **Database** | Supabase PostgreSQL + **pgvector** |
| **Storage** | Supabase Storage |
| **LLM** | **Gemini AI API** |
| **Scheduler** | Vercel Cron Jobs |

---

## Documentation You Need

*   **Next.js:** `https://nextjs.org/docs`
*   **Supabase:** `https://supabase.com/docs`
*   **pgvector:** `https://supabase.com/docs/guides/database/extensions/pgvector`
*   **Vercel Cron:** `https://vercel.com/docs/cron-jobs`

---

## Important Mindset

You are **NOT** building two systems.

You are building:
**One compliance intelligence platform**

With:

*   Retrieval brain
*   Rule engine
*   Monitoring system
*   Human review workflow

And yes — *this architecture works perfectly with Vercel + Supabase.*