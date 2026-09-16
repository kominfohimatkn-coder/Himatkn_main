from datetime import datetime

from sqlalchemy import Boolean, CHAR, DateTime, ForeignKey, String, func
from sqlalchemy.dialects.mysql import BIGINT
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Index, UniqueConstraint

from app.database.connection import Base


ID = BIGINT(unsigned=True).with_variant(
    __import__("sqlalchemy").Integer,
    "sqlite",
)


class Admin(Base):
    __tablename__ = "admins"

    id: Mapped[int] = mapped_column(ID, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(50), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default="1",
    )
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    __table_args__ = (
        UniqueConstraint("username", name="uq_admins_username"),
        Index("idx_admins_active", "is_active"),
    )


class Role(Base):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(ID, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[str | None] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    __table_args__ = (
        UniqueConstraint("name", name="uq_roles_name"),
    )


class Permission(Base):
    __tablename__ = "permissions"

    id: Mapped[int] = mapped_column(ID, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
    )

    __table_args__ = (
        UniqueConstraint("name", name="uq_permissions_name"),
    )


class AdminRole(Base):
    __tablename__ = "admin_roles"

    admin_id: Mapped[int] = mapped_column(
        ID,
        ForeignKey(
            "admins.id",
            ondelete="CASCADE",
            onupdate="CASCADE",
            name="fk_admin_roles_admin",
        ),
        primary_key=True,
    )
    role_id: Mapped[int] = mapped_column(
        ID,
        ForeignKey(
            "roles.id",
            ondelete="CASCADE",
            onupdate="CASCADE",
            name="fk_admin_roles_role",
        ),
        primary_key=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
    )

    __table_args__ = (
        Index("idx_admin_roles_role", "role_id"),
    )


class RolePermission(Base):
    __tablename__ = "role_permissions"

    role_id: Mapped[int] = mapped_column(
        ID,
        ForeignKey(
            "roles.id",
            ondelete="CASCADE",
            onupdate="CASCADE",
            name="fk_role_permissions_role",
        ),
        primary_key=True,
    )
    permission_id: Mapped[int] = mapped_column(
        ID,
        ForeignKey(
            "permissions.id",
            ondelete="CASCADE",
            onupdate="CASCADE",
            name="fk_role_permissions_permission",
        ),
        primary_key=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
    )

    __table_args__ = (
        Index("idx_role_permissions_permission", "permission_id"),
    )


class AuthSession(Base):
    __tablename__ = "auth_sessions"

    id: Mapped[int] = mapped_column(
        ID,
        primary_key=True,
        autoincrement=True,
    )
    admin_id: Mapped[int] = mapped_column(
        ID,
        ForeignKey(
            "admins.id",
            ondelete="CASCADE",
            onupdate="CASCADE",
            name="fk_auth_sessions_admin",
        ),
        nullable=False,
    )
    jti: Mapped[str] = mapped_column(String(100), nullable=False)
    token_hash: Mapped[str] = mapped_column(
        CHAR(64),
        nullable=False,
    )
    expires_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
    )
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime)

    __table_args__ = (
        UniqueConstraint("jti", name="uq_auth_sessions_jti"),
        UniqueConstraint("token_hash", name="uq_auth_sessions_token_hash"),
        Index("idx_auth_sessions_admin", "admin_id"),
        Index("idx_auth_sessions_expiry", "expires_at"),
        Index("idx_auth_sessions_revoked", "revoked_at"),
    )