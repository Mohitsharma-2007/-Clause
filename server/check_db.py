
from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

try:
    # 1. Check Policy Records
    print("--- Policies ---")
    res_p = supabase.table("policies").select("id, name, status").execute()
    print(f"Total policies: {len(res_p.data)}")
    for row in res_p.data:
        print(f"Policy: {row['name']} | ID: {row['id']} | Status: {row['status']}")

    # 2. Check Chunks
    print("\n--- Policy Chunks ---")
    res_c = supabase.table("policy_chunks").select("id, policy_id, chunk_index").limit(5).execute()
    print(f"Total chunks found (limit 5): {len(res_c.data)}")
    for row in res_c.data:
        print(f"Chunk Index: {row['chunk_index']} | Policy ID: {row['policy_id']}")
except Exception as e:
    print(f"Error checking DB: {e}")
