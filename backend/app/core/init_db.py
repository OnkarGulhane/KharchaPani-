import asyncio
from sqlalchemy import select, text
from app.core.config import settings
from app.core.database import engine, AsyncSessionLocal
from app.models import Base, User
from app.core.security import get_password_hash
from app.seed.seed_categories import seed_user_starter_categories


async def ensure_postgres_database_exists() -> None:
    """If using PostgreSQL and the target DB doesn't exist, create it automatically."""
    db_url = settings.DATABASE_URL
    if "postgresql" in db_url:
        try:
            import asyncpg
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
            print(f"PostgreSQL connection/DB check status: {e}")


async def init_db() -> None:
    """Initialize database tables, migrate legacy constraints, and seed starter categories."""
    await ensure_postgres_database_exists()

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
        # Ensure all columns and constraints exist on PostgreSQL
        if "postgresql" in settings.DATABASE_URL:
            try:
                # 1. Users table
                await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;"))
                await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;"))
                await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);"))

                # 2. Refresh tokens table
                await conn.execute(text("ALTER TABLE refresh_tokens ADD COLUMN IF NOT EXISTS device_info VARCHAR(255);"))
                await conn.execute(text("ALTER TABLE refresh_tokens ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45);"))
                await conn.execute(text("ALTER TABLE refresh_tokens ADD COLUMN IF NOT EXISTS is_revoked BOOLEAN DEFAULT FALSE;"))
                await conn.execute(text("ALTER TABLE refresh_tokens ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMP WITH TIME ZONE;"))

                # 3. Categories legacy unique constraint fix
                await conn.execute(text("DROP INDEX IF EXISTS ix_categories_name;"))
                await conn.execute(text("ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_name_key;"))
                await conn.execute(text("ALTER TABLE categories DROP CONSTRAINT IF EXISTS uq_categories_name;"))
                await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_categories_name ON categories (name);"))
            except Exception as e:
                print(f"PostgreSQL table/column check notice: {e}")

    async with AsyncSessionLocal() as session:
        # Check if default user 1 exists
        stmt = select(User).where(User.id == 1)
        res = await session.execute(stmt)
        default_user = res.scalar_one_or_none()

        if not default_user:
            default_user = User(
                id=1,
                email="admin@kharchapani.com",
                full_name="Default User",
                hashed_password=get_password_hash("KharchaPani@2026"),
                is_active=True,
                is_verified=True,
            )
            session.add(default_user)
            await session.commit()

        await seed_user_starter_categories(session, user_id=1)
        print("Database initialized successfully and starter categories seeded.")


if __name__ == "__main__":
    asyncio.run(init_db())
