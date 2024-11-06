"""add_category_to_items

Revision ID: e231539a90d0
Revises: feb8c28b0234
Create Date: 2024-10-28 19:16:10.455737

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from backend.enums import ItemCategory

# revision identifiers, used by Alembic.
revision: str = 'e231539a90d0'
down_revision: Union[str, None] = 'feb8c28b0234'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create enum type first
    op.execute("""
        CREATE TYPE itemcategory AS ENUM (
            'TEXTBOOKS', 'ELECTRONICS', 'FURNITURE', 'CLOTHING', 
            'SCHOOL_SUPPLIES', 'SPORTS_EQUIPMENT', 'MUSICAL_INSTRUMENTS', 'OTHER'
        )
    """)
    
    # Then add the column using the enum type
    op.add_column('items',
        sa.Column('category', 
                  sa.Enum(ItemCategory, name='itemcategory', create_type=False),
                  server_default='OTHER',
                  nullable=False)
    )


def downgrade() -> None:
    # Drop the column first
    op.drop_column('items', 'category')
    
    # Then drop the enum type
    op.execute('DROP TYPE itemcategory')