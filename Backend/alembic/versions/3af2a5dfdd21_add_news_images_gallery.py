"""add news images gallery"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql


revision = "3af2a5dfdd21"
down_revision = "20260916_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    # Create news_images only when it does not already exist.
    # This keeps the migration safe for the current local database,
    # where the table was already created before the migration was fixed.
    if not inspector.has_table("news_images"):
        op.create_table(
            "news_images",
            sa.Column(
                "id",
                mysql.BIGINT(unsigned=True),
                nullable=False,
            ),
            sa.Column(
                "news_id",
                mysql.BIGINT(unsigned=True),
                nullable=False,
            ),
            sa.Column(
                "storage_key",
                sa.String(length=500),
                nullable=False,
            ),
            sa.Column(
                "caption",
                sa.String(length=500),
                nullable=True,
            ),
            sa.Column(
                "sort_order",
                sa.Integer(),
                nullable=False,
                server_default="0",
            ),
            sa.Column(
                "created_at",
                sa.DateTime(),
                nullable=False,
                server_default=sa.text("CURRENT_TIMESTAMP"),
            ),
            sa.ForeignKeyConstraint(
                ["news_id"],
                ["news.id"],
                name="fk_news_images_news_id",
                ondelete="CASCADE",
                onupdate="CASCADE",
            ),
            sa.PrimaryKeyConstraint("id"),
        )

        op.create_index(
            "idx_news_images_news_sort",
            "news_images",
            ["news_id", "sort_order"],
            unique=False,
        )

    # Remove the redundant single-column index if it exists.
    inspector = sa.inspect(bind)
    existing_indexes = {
        index["name"]
        for index in inspector.get_indexes("news_images")
    }

    if "idx_news_images_news_id" in existing_indexes:
        op.drop_index(
            "idx_news_images_news_id",
            table_name="news_images",
        )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if inspector.has_table("news_images"):
        op.drop_table("news_images")