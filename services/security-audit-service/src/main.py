from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import scan, reports

# Créer l'application FastAPI
app = FastAPI(
    title="SecureBank Security Audit Service",
    description="Service d'audit de sécurité automatisé avec OWASP, Bandit et Trivy",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8080"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclure les routes
app.include_router(scan.router, prefix="/api")
app.include_router(reports.router, prefix="/api")


@app.get("/", tags=["Root"])
async def root():
    """
    Endpoint racine - Informations sur le service
    """
    return {
        "service": "SecureBank Security Audit Service",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "docs": "/docs",
            "scan": "/api/scan",
            "reports": "/api/reports"
        }
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint
    """
    return {
        "status": "healthy",
        "service": "security-audit-service"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8085,
        reload=True,
        log_level="info"
    )