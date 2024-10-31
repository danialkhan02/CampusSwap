"""Remove seller name column from seller profile table

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
    # Drop the seller_name column
    op.drop_column('seller_profiles', 'seller_name')
    

def downgrade() -> None: 
    # Add back the seller_name column with a default value
    op.add_column('seller_profiles',
                  sa.Column('seller_name',
                           sa.String(),
                           server_default="legacy_user",
                           nullable=False))
    
