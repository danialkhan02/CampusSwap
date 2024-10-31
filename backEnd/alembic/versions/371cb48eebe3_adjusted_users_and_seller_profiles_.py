"""Adjusted users and seller profiles tables

Revision ID: 371cb48eebe3
Revises: 84ce08826576
Create Date: 2024-10-31 14:09:56.104718

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '371cb48eebe3'
down_revision: Union[str, None] = '84ce08826576'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add new columns to users table
    op.add_column('users', sa.Column('profile_image_url', sa.String(), nullable=True))
    op.add_column('users', sa.Column('phone_number', sa.String(), nullable=True))
    op.add_column('users', sa.Column('description', sa.String(), nullable=True))

    # Add num_listings to seller_profiles
    op.add_column('seller_profiles', sa.Column('num_listings', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('users', sa.Column('location', sa.String(), nullable=True))

    # Drop columns from seller_profiles
    op.drop_column('seller_profiles', 'profile_image_url')
    op.drop_column('seller_profiles', 'phone_number')


def downgrade() -> None:
    # Add back columns to seller_profiles
    op.add_column('seller_profiles', sa.Column('profile_image_url', sa.String(), nullable=True))
    op.add_column('seller_profiles', sa.Column('phone_number', sa.String(), nullable=True))

    # Drop columns from users
    op.drop_column('users', 'description')
    op.drop_column('users', 'phone_number')
    op.drop_column('users', 'profile_image_url')

    # Drop num_listings from seller_profiles
    op.drop_column('seller_profiles', 'num_listings')
    op.drop_column('users', 'location')