from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.init_db import init_db
from app.core.security import AccessKeyMiddleware
from app.routers import auth, budget, categories, dashboard, expenses, health


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await init_db()
    except Exception as e:
        print(f"Database initialization warning: {e}")
    yield


app = FastAPI(
    title="Kharcha Pani API",
    description="Personal Expense Tracker REST API with Multi-User Authentication & Data Isolation",
    version="3.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# 1. Access Key Middleware (Runs inner)
app.add_middleware(AccessKeyMiddleware)

# 2. CORS Middleware (Added last so it wraps all responses and handles preflight OPTIONS & errors first)
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
    allow_origin_regex=r"https://.*\.vercel\.app|http://localhost:\d+|http://127\.0\.0\.1:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Health router (unprotected)
app.include_router(health.router)

from starlette.responses import JSONResponse

# Global exception handler for actionable error diagnostics
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    import traceback
    print(f"Unhandled Exception on {request.url.path}: {exc}")
    traceback.print_exc()
    origin = request.headers.get("origin")
    headers = {}
    if origin:
        headers = {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        }
    return JSONResponse(
        status_code=500,
        headers=headers,
        content={
            "success": False,
            "error": "InternalServerError",
            "detail": str(exc),
        },
    )

# API Routers under /api/v1
api_v1_prefix = settings.API_V1_PREFIX
app.include_router(auth.router, prefix=api_v1_prefix)
app.include_router(categories.router, prefix=api_v1_prefix)
app.include_router(expenses.router, prefix=api_v1_prefix)
app.include_router(budget.router, prefix=api_v1_prefix)
app.include_router(dashboard.router, prefix=api_v1_prefix)


@app.get("/")
async def root():
    return {
        "app": "Kharcha Pani API",
        "version": "3.0",
        "docs": "/docs",
        "health": "/health",
        "api_v1": api_v1_prefix,
    }
