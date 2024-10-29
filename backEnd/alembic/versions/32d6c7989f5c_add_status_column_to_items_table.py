"""Add status column to items table

Revision ID: 32d6c7989f5c
Revises: 96b7fd9ae88d
Create Date: 2024-10-29 12:48:55.195790

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '32d6c7989f5c'
down_revision: Union[str, None] = '96b7fd9ae88d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # Create the enum type if it doesn't exist
    itemstatus_enum = sa.Enum('STATUS_NEW', 'STATUS_INTERESTED', 'STATUS_NEGOTIATIONS', 'STATUS_CLOSED', name='itemstatus')
    itemstatus_enum.create(op.get_bind(), checkfirst=True)

    # Add the status column to the items table
    op.add_column('items', sa.Column('status', itemstatus_enum, nullable=False, server_default='STATUS_NEW'))

def downgrade():
    # Drop the status column
    op.drop_column('items', 'status')

    # Drop the enum type
    itemstatus_enum = sa.Enum('STATUS_NEW', 'STATUS_INTERESTED', 'STATUS_NEGOTIATIONS', 'STATUS_CLOSED', name='itemstatus')
    itemstatus_enum.drop(op.get_bind(), checkfirst=True)