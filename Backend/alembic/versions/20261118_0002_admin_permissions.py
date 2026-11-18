"""add direct admin permissions and retire legacy roles

Revision ID: 20261118_0002
Revises: 3af2a5dfdd21
Create Date: 2026-11-18
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql


revision = "20261118_0002"
down_revision = "3af2a5dfdd21"
branch_labels = None
depends_on = None


SUPERADMIN_ONLY = ("admins.view", "admins.manage", "roles.manage")
LEGACY_ROLES = ("admin", "editor")

# Match the unsigned BIGINT used by admins.id and permissions.id on MySQL
# while still compiling to a plain INTEGER on SQLite.
ID_TYPE = sa.BigInteger().with_variant(
    mysql.BIGINT(unsigned=True),
    "mysql",
)


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if not inspector.has_table("admin_permissions"):
        op.create_table(
            "admin_permissions",
            sa.Column("admin_id", ID_TYPE, nullable=False),
            sa.Column("permission_id", ID_TYPE, nullable=False),
            sa.Column(
                "created_at",
                sa.DateTime(),
                nullable=False,
                server_default=sa.text("CURRENT_TIMESTAMP"),
            ),
            sa.ForeignKeyConstraint(
                ["admin_id"],
                ["admins.id"],
                name="fk_admin_permissions_admin",
                ondelete="CASCADE",
                onupdate="CASCADE",
            ),
            sa.ForeignKeyConstraint(
                ["permission_id"],
                ["permissions.id"],
                name="fk_admin_permissions_permission",
                ondelete="CASCADE",
                onupdate="CASCADE",
            ),
            sa.PrimaryKeyConstraint("admin_id", "permission_id"),
        )
        op.create_index(
            "idx_admin_permissions_permission",
            "admin_permissions",
            ["permission_id"],
            unique=False,
        )

    metadata = sa.MetaData()
    roles = sa.Table("roles", metadata, autoload_with=bind)
    permissions = sa.Table("permissions", metadata, autoload_with=bind)
    admin_roles = sa.Table("admin_roles", metadata, autoload_with=bind)
    role_permissions = sa.Table(
        "role_permissions",
        metadata,
        autoload_with=bind,
    )
    admin_permissions = sa.Table(
        "admin_permissions",
        metadata,
        autoload_with=bind,
    )

    # Copy permissions from every non-superadmin role to the account.
    # Superadmin-only permissions are intentionally not copied.
    copy_statement = (
        sa.select(
            admin_roles.c.admin_id,
            role_permissions.c.permission_id,
        )
        .select_from(
            admin_roles.join(
                role_permissions,
                role_permissions.c.role_id == admin_roles.c.role_id,
            )
            .join(
                roles,
                roles.c.id == admin_roles.c.role_id,
            )
            .join(
                permissions,
                permissions.c.id
                == role_permissions.c.permission_id,
            )
        )
        .where(
            roles.c.name != "superadmin",
            permissions.c.name.notin_(SUPERADMIN_ONLY),
        )
        .distinct()
    )

    rows = bind.execute(copy_statement).all()

    existing_pairs = set(
        bind.execute(
            sa.select(
                admin_permissions.c.admin_id,
                admin_permissions.c.permission_id,
            )
        ).all()
    )

    inserts = [
        {
            "admin_id": admin_id,
            "permission_id": permission_id,
        }
        for admin_id, permission_id in rows
        if (admin_id, permission_id) not in existing_pairs
    ]

    if inserts:
        bind.execute(sa.insert(admin_permissions), inserts)

    # Direct permissions replace every non-superadmin role assignment.
    non_superadmin_role_ids = sa.select(roles.c.id).where(
        roles.c.name != "superadmin"
    )
    bind.execute(
        sa.delete(admin_roles).where(
            admin_roles.c.role_id.in_(non_superadmin_role_ids)
        )
    )

    # Remove the retired roles and their permission mappings.
    legacy_role_ids = sa.select(roles.c.id).where(
        roles.c.name.in_(LEGACY_ROLES)
    )
    bind.execute(
        sa.delete(role_permissions).where(
            role_permissions.c.role_id.in_(legacy_role_ids)
        )
    )
    bind.execute(
        sa.delete(admin_roles).where(
            admin_roles.c.role_id.in_(legacy_role_ids)
        )
    )
    bind.execute(
        sa.delete(roles).where(
            roles.c.id.in_(legacy_role_ids)
        )
    )


def downgrade() -> None:
    # The old role assignments are intentionally not recreated: data was
    # migrated to direct account permissions and there is no lossless way to
    # infer the original roles. Dropping the table discards those permissions.
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if inspector.has_table("admin_permissions"):
        op.drop_table("admin_permissions")
