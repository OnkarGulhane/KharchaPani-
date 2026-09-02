import pytest
import pytest_asyncio
import httpx
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.main import app
from app.core.database import get_db
from app.models import Base, User
from app.core.security import create_access_token, get_password_hash
from app.seed.seed_categories import seed_user_starter_categories


@pytest_asyncio.fixture(autouse=True)
async def setup_test_database():
    """Fixture that creates a fresh in-memory SQLite database per test."""
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

    # 2. Seed default user 1 and starter categories
    async with test_sessionmaker() as session:
        user1 = User(
            id=1,
            email="testuser@example.com",
            full_name="Test User 1",
            hashed_password=get_password_hash("Password123!"),
            is_active=True,
            is_verified=True,
        )
        session.add(user1)
        await session.commit()
        await seed_user_starter_categories(session, user_id=1)

    # 3. Override get_db FastAPI dependency
    async def override_get_db():
        async with test_sessionmaker() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db

    yield

    # Clean up
    app.dependency_overrides.clear()
    await test_engine.dispose()


@pytest_asyncio.fixture
async def async_client():
    """Async HTTP client for testing API endpoints."""
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


@pytest.fixture
def auth_headers_user1():
    """Generate valid JWT Authorization header for User 1."""
    token = create_access_token(data={"sub": "1", "email": "testuser@example.com"})
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
async def db_session():
    """Yield test async database session."""
    override = app.dependency_overrides.get(get_db)
    if override:
        async for session in override():
            yield session


@pytest_asyncio.fixture
async def test_user(db_session: AsyncSession):
    """Retrieve test user 1."""
    from sqlalchemy import select
    stmt = select(User).where(User.id == 1)
    res = await db_session.execute(stmt)
    return res.scalar_one()

