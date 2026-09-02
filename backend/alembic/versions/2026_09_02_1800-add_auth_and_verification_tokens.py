"""add_auth_and_verification_tokens

Revision ID: e3a91b2c4d5e
Revises: 4dcb8fe12dd9
Create Date: 2026-09-02 18:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e3a91b2c4d5e'
down_revision: Union[str, None] = '4dcb8fe12dd9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = inspector.get_table_names()

    # 1. users table
    if 'users' not in existing_tables:
        op.create_table(
            'users',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('email', sa.String(length=255), nullable=False),
            sa.Column('hashed_password', sa.String(length=255), nullable=True),
            sa.Column('full_name', sa.String(length=150), nullable=False),
            sa.Column('google_id', sa.String(length=255), nullable=True),
            sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
            sa.Column('is_verified', sa.Boolean(), nullable=False, server_default=sa.text('false')),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
        op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
        op.create_index(op.f('ix_users_google_id'), 'users', ['google_id'], unique=True)
    else:
        columns = [c['name'] for c in inspector.get_columns('users')]
        if 'is_verified' not in columns:
            op.add_column('users', sa.Column('is_verified', sa.Boolean(), nullable=False, server_default=sa.text('false')))

    # 2. refresh_tokens table
    if 'refresh_tokens' not in existing_tables:
        op.create_table(
            'refresh_tokens',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=False),
            sa.Column('token_hash', sa.String(length=64), nullable=False),
            sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
            sa.Column('is_revoked', sa.Boolean(), nullable=False, server_default=sa.text('false')),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
            sa.Column('revoked_at', sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_refresh_tokens_id'), 'refresh_tokens', ['id'], unique=False)
        op.create_index(op.f('ix_refresh_tokens_user_id'), 'refresh_tokens', ['user_id'], unique=False)
        op.create_index(op.f('ix_refresh_tokens_token_hash'), 'refresh_tokens', ['token_hash'], unique=True)

    # 3. password_reset_tokens table
    if 'password_reset_tokens' not in existing_tables:
        op.create_table(
            'password_reset_tokens',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=False),
            sa.Column('token_hash', sa.String(length=64), nullable=False),
            sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
            sa.Column('is_used', sa.Boolean(), nullable=False, server_default=sa.text('false')),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_password_reset_tokens_id'), 'password_reset_tokens', ['id'], unique=False)
        op.create_index(op.f('ix_password_reset_tokens_user_id'), 'password_reset_tokens', ['user_id'], unique=False)
        op.create_index(op.f('ix_password_reset_tokens_token_hash'), 'password_reset_tokens', ['token_hash'], unique=True)

    # 4. email_verification_tokens table
    if 'email_verification_tokens' not in existing_tables:
        op.create_table(
            'email_verification_tokens',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=False),
            sa.Column('token_hash', sa.String(length=64), nullable=False),
            sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
            sa.Column('is_used', sa.Boolean(), nullable=False, server_default=sa.text('false')),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_email_verification_tokens_id'), 'email_verification_tokens', ['id'], unique=False)
        op.create_index(op.f('ix_email_verification_tokens_user_id'), 'email_verification_tokens', ['user_id'], unique=False)
        op.create_index(op.f('ix_email_verification_tokens_token_hash'), 'email_verification_tokens', ['token_hash'], unique=True)


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = inspector.get_table_names()

    if 'email_verification_tokens' in existing_tables:
        op.drop_index(op.f('ix_email_verification_tokens_token_hash'), table_name='email_verification_tokens')
        op.drop_index(op.f('ix_email_verification_tokens_user_id'), table_name='email_verification_tokens')
        op.drop_index(op.f('ix_email_verification_tokens_id'), table_name='email_verification_tokens')
        op.drop_table('email_verification_tokens')

    if 'password_reset_tokens' in existing_tables:
        op.drop_index(op.f('ix_password_reset_tokens_token_hash'), table_name='password_reset_tokens')
        op.drop_index(op.f('ix_password_reset_tokens_user_id'), table_name='password_reset_tokens')
        op.drop_index(op.f('ix_password_reset_tokens_id'), table_name='password_reset_tokens')
        op.drop_table('password_reset_tokens')

    if 'refresh_tokens' in existing_tables:
        op.drop_index(op.f('ix_refresh_tokens_token_hash'), table_name='refresh_tokens')
        op.drop_index(op.f('ix_refresh_tokens_user_id'), table_name='refresh_tokens')
        op.drop_index(op.f('ix_refresh_tokens_id'), table_name='refresh_tokens')
        op.drop_table('refresh_tokens')

    if 'users' in existing_tables:
        op.drop_index(op.f('ix_users_google_id'), table_name='users')
        op.drop_index(op.f('ix_users_email'), table_name='users')
        op.drop_index(op.f('ix_users_id'), table_name='users')
        op.drop_table('users')
