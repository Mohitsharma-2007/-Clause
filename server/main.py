import uvicorn
from app import app

if __name__ == "__main__":
    print("Starting Clause Backend Service...")
    uvicorn.run(app, host="0.0.0.0", port=8001)
