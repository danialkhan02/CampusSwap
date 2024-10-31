"""Made seller id PK for seller profile table

Revision ID: 4e9651cf8805
Revises: cfe72f4862f1
Create Date: 2024-10-31 12:21:18.366218

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4e9651cf8805'
down_revision: Union[str, None] = 'cfe72f4862f1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop the old primary key constraint
    op.drop_constraint('seller_profiles_pkey', 'seller_profiles', type_='primary')
    
    # Drop the id column and its index
    op.drop_index('ix_seller_profiles_id', table_name='seller_profiles')
    op.drop_column('seller_profiles', 'id')
    
# Drop the seller_name column
    op.drop_column('seller_profiles', 'seller_name')

    # Add seller_id as the primary key
    op.create_primary_key('seller_profiles_pkey', 'seller_profiles', ['seller_id'])

def downgrade() -> None:
    # Remove seller_id as primary key
    op.drop_constraint('seller_profiles_pkey', 'seller_profiles', type_='primary')
    
    # Add back the id column and its index
    op.add_column('seller_profiles', sa.Column('id', sa.UUID(), server_default=sa.text('gen_random_uuid()'), nullable=False))
    op.create_index('ix_seller_profiles_id', 'seller_profiles', ['id'], unique=False)
    
    # Add back the seller_name column
    op.add_column('seller_profiles', sa.Column('seller_name', sa.String(), nullable=False))

    # Restore the original primary key
    op.create_primary_key('seller_profiles_pkey', 'seller_profiles', ['id'])