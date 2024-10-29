"""Add condition column to items table

Revision ID: cfe72f4862f1
Revises: 32d6c7989f5c
Create Date: 2024-10-29 13:00:11.443285

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cfe72f4862f1'
down_revision: Union[str, None] = '32d6c7989f5c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create the enum type if it doesn't exist
    itemcondition_enum = sa.Enum('CONDITION_NEW', 'CONDITION_USED', name='itemcondition')
    itemcondition_enum.create(op.get_bind(), checkfirst=True)

    # Add the condition column to the items table
    op.add_column('items', sa.Column('condition', itemcondition_enum, nullable=False, server_default='CONDITION_NEW'))

def downgrade() -> None:
    # Drop the condition column
    op.drop_column('items', 'condition')

    # Drop the enum type
    itemcondition_enum = sa.Enum('CONDITION_NEW', 'CONDITION_USED', name='itemcondition')
    itemcondition_enum.drop(op.get_bind(), checkfirst=True)