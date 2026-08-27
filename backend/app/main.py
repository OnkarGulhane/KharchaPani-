from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.security import AccessKeyMiddleware
from app.routers import health, categories, expenses, budget, dashboard

app = FastAPI(
    title="Kharcha Pani API",
    description="Personal Expense Tracker REST API (V1 / MVP)",
    version="2.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware - Ensure all local dev ports and origins are allowed
dev_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]
configured_origins = settings.ALLOWED_ORIGINS if isinstance(settings.ALLOWED_ORIGINS, list) else [settings.ALLOWED_ORIGINS]
allowed_origins = list(set(dev_origins + configured_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Shared Access Key Middleware (V1 Public Exposure Protection)
app.add_middleware(AccessKeyMiddleware)

# Health router (unprotected)
app.include_router(health.router)

# API Routers under /api/v1
api_v1_prefix = settings.API_V1_PREFIX
app.include_router(categories.router, prefix=api_v1_prefix)
app.include_router(expenses.router, prefix=api_v1_prefix)
app.include_router(budget.router, prefix=api_v1_prefix)
app.include_router(dashboard.router, prefix=api_v1_prefix)


@app.get("/")
async def root():
    return {
        "app": "Kharcha Pani API",
        "version": "2.0",
        "docs": "/docs",
        "health": "/health",
        "api_v1": api_v1_prefix,
    }
