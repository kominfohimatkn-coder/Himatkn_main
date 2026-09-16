
"""Canonical HIMATKN V2 schema baseline."""

revision = "20260916_0001"
down_revision = None
branch_labels = None
depends_on = None
from alembic import op

def upgrade():
    from app.database.connection import Base
    from app import models  # noqa: F401 - register mappings
    Base.metadata.create_all(op.get_bind())

def downgrade():
    from app.database.connection import Base
    from app import models  # noqa: F401 - register mappings
    Base.metadata.drop_all(op.get_bind())
