from datetime import datetime

from sqlalchemy import CHAR, DateTime, ForeignKey, String, Text, Index, func
from sqlalchemy.dialects.mysql import BIGINT
from sqlalchemy.orm import Mapped, mapped_column

from app.database.connection import Base


ID = BIGINT(unsigned=True).with_variant(
    __import__("sqlalchemy").Integer,
    "sqlite",
)


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(ID, primary_key=True, autoincrement=True)
    created_by: Mapped[int | None] = mapped_column(
        ID,
        ForeignKey(
            "admins.id",
            ondelete="SET NULL",
            onupdate="CASCADE",
            name="fk_notifications_created_by",
        ),
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        server_default="info",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
    )

    __table_args__ = (
        Index("idx_notifications_created_at", "created_at"),
        Index("idx_notifications_type", "type"),
        Index("idx_notifications_created_by", "created_by"),
    )


class NotificationRecipient(Base):
    __tablename__ = "notification_recipients"

    notification_id: Mapped[int] = mapped_column(
        ID,
        ForeignKey(
            "notifications.id",
            ondelete="CASCADE",
            onupdate="CASCADE",
            name="fk_notification_recipients_notification",
        ),
        primary_key=True,
    )
    admin_id: Mapped[int] = mapped_column(
        ID,
        ForeignKey(
            "admins.id",
            ondelete="CASCADE",
            onupdate="CASCADE",
            name="fk_notification_recipients_admin",
        ),
        primary_key=True,
    )
    read_at: Mapped[datetime | None] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
    )

    __table_args__ = (
        Index("idx_notification_recipients_admin", "admin_id"),
        Index(
            "idx_notification_recipients_unread",
            "admin_id",
            "read_at",
        ),
    )


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id: Mapped[int] = mapped_column(ID, primary_key=True, autoincrement=True)
    admin_id: Mapped[int | None] = mapped_column(
        ID,
        ForeignKey(
            "admins.id",
            ondelete="SET NULL",
            onupdate="CASCADE",
            name="fk_activity_logs_admin",
        ),
    )
    action: Mapped[str] = mapped_column(String(50), nullable=False)
    entity_type: Mapped[str | None] = mapped_column(String(100))
    entity_id: Mapped[int | None] = mapped_column(ID)
    description: Mapped[str | None] = mapped_column(Text)
    ip_address: Mapped[str | None] = mapped_column(String(45))
    user_agent: Mapped[str | None] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
    )

    __table_args__ = (
        Index("idx_activity_logs_created_at", "created_at"),
        Index(
            "idx_activity_logs_admin_created",
            "admin_id",
            "created_at",
        ),
        Index(
            "idx_activity_logs_entity",
            "entity_type",
            "entity_id",
        ),
        Index("idx_activity_logs_action", "action"),
    )


class VisitorLog(Base):
    __tablename__ = "visitor_logs"

    id: Mapped[int] = mapped_column(ID, primary_key=True, autoincrement=True)
    page: Mapped[str] = mapped_column(String(500), nullable=False)
    visitor_hash: Mapped[str | None] = mapped_column(
        CHAR(64),
        nullable=True,
    )
    user_agent: Mapped[str | None] = mapped_column(String(500))
    visited_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
    )

    __table_args__ = (
        Index("idx_visitor_logs_visited_at", "visited_at"),
        Index(
            "idx_visitor_logs_page_visited",
            "page",
            "visited_at",
        ),
        Index(
            "idx_visitor_logs_visitor_hash",
            "visitor_hash",
        ),
    )