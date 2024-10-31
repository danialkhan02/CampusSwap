"""Made seller id PK for seller profile table

Revision ID: 84ce08826576
Revises: cfe72f4862f1
Create Date: 2024-10-31 12:46:09.116001

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '84ce08826576'
down_revision: Union[str, None] = 'cfe72f4862f1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop the old primary key constraint
    op.drop_constraint('seller_profiles_pkey', 'seller_profiles', type_='primary')
    
    # Drop the id column if it exists
    op.drop_column('seller_profiles', 'id')
    
    # Drop the seller_name column
    op.drop_column('seller_profiles', 'seller_name')
    
    # Make seller_id the primary key
    op.create_primary_key('seller_profiles_pkey', 'seller_profiles', ['seller_id'])

def downgrade() -> None:
    # Drop the primary key constraint
    op.drop_constraint('seller_profiles_pkey', 'seller_profiles', type_='primary')
    
    # Add back the id column
    op.add_column('seller_profiles', 
                  sa.Column('id', 
                           sa.UUID(), 
                           server_default=sa.text('gen_random_uuid()'), 
                           nullable=False))
    
    # Add back the seller_name column with a default value
    op.add_column('seller_profiles',
                  sa.Column('seller_name',
                           sa.String(),
                           server_default="legacy_user",
                           nullable=False))
    
    # Create composite primary key with both id and seller_id
    op.create_primary_key('seller_profiles_pkey', 'seller_profiles', ['id', 'seller_id'])
