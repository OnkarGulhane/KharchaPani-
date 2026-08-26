from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.security import AccessKeyMiddleware
from app.routers import health

app = FastAPI(
    title="Kharcha Pani API",
    description="Personal Expense Tracker REST API (V1 / MVP)",
    version="2.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Shared Access Key Middleware (V1 Public Exposure Protection)
app.add_middleware(AccessKeyMiddleware)

# Include Routers
app.include_router(health.router)


@app.get("/")
async def root():
    return {
        "app": "Kharcha Pani API",
        "version": "2.0",
        "docs": "/docs",
        "health": "/health",
    }
