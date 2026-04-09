from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.models.movement import init_db
from src.api.routes import router

app = FastAPI(title="TORO_Prime API", version="0.1.0", description="Motor financiero inteligente", docs_url="/docs")

app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:7000", "http://localhost:3000"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

init_db()

app.include_router(router)

@app.get("/")
def root():
    return {"message": "TORO_Prime API v0.1.0", "docs": "http://localhost:9000/docs", "status": "ready"}

@app.get("/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=9000, reload=True)
