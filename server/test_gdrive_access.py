
import os
import json
import sys

# Ensure we can import from site-packages
sys.path.append(os.path.join(os.path.dirname(__file__), "venv", "Lib", "site-packages"))

try:
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
except ImportError as e:
    print(f"❌ Import Error: {e}")
    sys.exit(1)

CREDENTIALS_FILE = os.path.join(os.path.dirname(__file__), "credentials.json")
FOLDER_ID = "1ip6FGsKtqHMP64EK8Xk25nm8krsrBX8P"

def test_access():
    print(f"Checking credentials at: {CREDENTIALS_FILE}")
    if not os.path.exists(CREDENTIALS_FILE):
        print(f"❌ Credentials file not found at {CREDENTIALS_FILE}")
        return

    try:
        creds = service_account.Credentials.from_service_account_file(CREDENTIALS_FILE)
        service = build('drive', 'v3', credentials=creds)

        # 1. Try to get folder metadata
        print(f"Testing access to folder: {FOLDER_ID}...")
        folder = service.files().get(fileId=FOLDER_ID, fields="id, name").execute()
        print(f"✅ Success! Connected to folder: '{folder.get('name')}'")

        # 2. List files in folder
        print("Listing files...")
        results = service.files().list(
            q=f"'{FOLDER_ID}' in parents and trashed=false",
            pageSize=10, 
            fields="nextPageToken, files(id, name, mimeType)"
        ).execute()
        items = results.get('files', [])

        if not items:
            print("⚠️ No files found in the folder.")
        else:
            print(f"✅ Found {len(items)} files:")
            for item in items:
                print(f"  - {item['name']} ({item['id']})")

    except Exception as e:
        print(f"❌ Error accessing Google Drive: {e}")

if __name__ == "__main__":
    test_access()
