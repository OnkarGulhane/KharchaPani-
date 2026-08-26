import pytest_asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.main import app
from app.core.database import get_db
from app.models import Base
from app.seed.seed_categories import seed_starter_categories


@pytest_asyncio.fixture(autouse=True)
async def setup_test_database():
    """Fixture that creates a fresh in-memory SQLite database per test.
    
    This avoids event-loop reuse issues on Windows asyncpg when running multiple pytest tests.
    """
    test_engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        connect_args={"check_same_thread": False},
        echo=False,
    )
    test_sessionmaker = async_sessionmaker(
        bind=test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False,
    )

    # 1. Create schema
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # 2. Seed starter categories
    async with test_sessionmaker() as session:
        await seed_starter_categories(session)

    # 3. Override get_db FastAPI dependency
    async def override_get_db():
        async with test_sessionmaker() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db

    yield

    # Clean up
    app.dependency_overrides.clear()
    await test_engine.dispose()
