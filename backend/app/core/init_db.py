import asyncio
from app.core.config import settings
from app.core.database import engine, AsyncSessionLocal
from app.models import Base
from app.seed.seed_categories import seed_starter_categories


async def ensure_postgres_database_exists() -> None:
    """If using PostgreSQL and the target DB doesn't exist, create it automatically."""
    db_url = settings.DATABASE_URL
    if "postgresql" in db_url:
        import asyncpg

        try:
            # Parse connection details
            url_without_scheme = db_url.split("://", 1)[1]
            params_part = url_without_scheme.split("?")[0]
            conn_credentials, db_name = params_part.split("/")
            
            user_pass, host_port = conn_credentials.split("@")
            user_parts = user_pass.split(":")
            user = user_parts[0]
            password = user_parts[1] if len(user_parts) > 1 else ""

            host_parts = host_port.split(":")
            host = host_parts[0]
            port = int(host_parts[1]) if len(host_parts) > 1 else 5432

            if db_name and db_name != "postgres":
                conn = await asyncpg.connect(user=user, password=password, host=host, port=port, database="postgres")
                db_exists = await conn.fetchval("SELECT 1 FROM pg_database WHERE datname = $1", db_name)
                if not db_exists:
                    await conn.execute(f'CREATE DATABASE "{db_name}"')
                    print(f"PostgreSQL database '{db_name}' created successfully.")
                await conn.close()
        except Exception as e:
            # If error during DB check, print warning and let engine attempt connection
            print(f"PostgreSQL connection/DB check status: {e}")


async def init_db() -> None:
    """Initialize database tables and seed starter categories."""
    await ensure_postgres_database_exists()

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    async with AsyncSessionLocal() as session:
        await seed_starter_categories(session)
        print("Database initialized successfully and starter categories seeded.")


if __name__ == "__main__":
    asyncio.run(init_db())
