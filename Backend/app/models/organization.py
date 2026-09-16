from datetime import date, datetime

from sqlalchemy import (
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    Boolean,
    Index,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.mysql import BIGINT
from sqlalchemy.orm import Mapped, mapped_column

from app.database.connection import Base


ID = BIGINT(unsigned=True).with_variant(Integer, "sqlite")


class Period(Base):
    __tablename__ = "periods"

    id: Mapped[int] = mapped_column(ID, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    start_date: Mapped[date | None] = mapped_column(Date)
    end_date: Mapped[date | None] = mapped_column(Date)
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default="0",
    )
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
        UniqueConstraint("name", name="uq_periods_name"),
        Index("idx_periods_active", "is_active"),
        Index("idx_periods_dates", "start_date", "end_date"),
    )


class Division(Base):
    __tablename__ = "divisions"

    id: Mapped[int] = mapped_column(ID, primary_key=True, autoincrement=True)
    period_id: Mapped[int] = mapped_column(
        ID,
        ForeignKey(
            "periods.id",
            ondelete="CASCADE",
            onupdate="CASCADE",
            name="fk_divisions_period",
        ),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    sort_order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        server_default="0",
    )
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
        UniqueConstraint(
            "period_id",
            "name",
            name="uq_divisions_period_name",
        ),
        Index(
            "idx_divisions_period_sort",
            "period_id",
            "sort_order",
        ),
    )


class Position(Base):
    __tablename__ = "positions"

    id: Mapped[int] = mapped_column(ID, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(String(255))
    sort_order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        server_default="0",
    )
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
        UniqueConstraint("name", name="uq_positions_name"),
        Index("idx_positions_sort", "sort_order"),
    )


class Member(Base):
    __tablename__ = "members"

    id: Mapped[int] = mapped_column(ID, primary_key=True, autoincrement=True)
    period_id: Mapped[int] = mapped_column(
        ID,
        ForeignKey(
            "periods.id",
            ondelete="CASCADE",
            onupdate="CASCADE",
            name="fk_members_period",
        ),
        nullable=False,
    )
    division_id: Mapped[int | None] = mapped_column(
        ID,
        ForeignKey(
            "divisions.id",
            ondelete="SET NULL",
            onupdate="CASCADE",
            name="fk_members_division",
        ),
    )
    position_id: Mapped[int] = mapped_column(
        ID,
        ForeignKey(
            "positions.id",
            ondelete="RESTRICT",
            onupdate="CASCADE",
            name="fk_members_position",
        ),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    photo_url: Mapped[str | None] = mapped_column(String(500))
    sort_order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        server_default="0",
    )
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
        Index("idx_members_period_sort", "period_id", "sort_order"),
        Index("idx_members_division", "division_id"),
        Index("idx_members_position", "position_id"),
        Index(
            "idx_members_structure",
            "period_id",
            "division_id",
            "position_id",
            "sort_order",
        ),
    )