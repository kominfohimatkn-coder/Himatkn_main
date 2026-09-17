from datetime import date, datetime

from sqlalchemy import (
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    Index,
    UniqueConstraint,
    func,
)

from sqlalchemy.dialects.mysql import BIGINT, LONGTEXT
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.connection import Base


ID = BIGINT(unsigned=True).with_variant(Integer, "sqlite")
NEWS_CONTENT_TYPE = LONGTEXT().with_variant(Text(), "sqlite")

class News(Base):
    __tablename__ = "news"

    id: Mapped[int] = mapped_column(ID, primary_key=True, autoincrement=True)
    author_id: Mapped[int | None] = mapped_column(
        ID,
        ForeignKey(
            "admins.id",
            ondelete="SET NULL",
            onupdate="CASCADE",
            name="fk_news_author",
        ),
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(
    NEWS_CONTENT_TYPE,
    nullable=False,
    )
    featured_image: Mapped[str | None] = mapped_column(String(500))
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        server_default="draft",
    )
    published_at: Mapped[datetime | None] = mapped_column(DateTime)
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

    images: Mapped[list["NewsImage"]] = relationship(
        "NewsImage",
        back_populates="news",
        cascade="all, delete-orphan",
        order_by="NewsImage.sort_order",
    )

    __table_args__ = (
        UniqueConstraint("slug", name="uq_news_slug"),
        Index("idx_news_status_published", "status", "published_at"),
        Index("idx_news_created_at", "created_at"),
        Index("idx_news_author", "author_id"),
    )


class NewsImage(Base):
    __tablename__ = "news_images"

    id: Mapped[int] = mapped_column(
        ID,
        primary_key=True,
        autoincrement=True,
    )

    news_id: Mapped[int] = mapped_column(
    ID,
    ForeignKey(
        "news.id",
        ondelete="CASCADE",
        onupdate="CASCADE",
        name="fk_news_images_news",
    ),
    nullable=False,
)

    storage_key: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    caption: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    sort_order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        server_default="0",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )

    news: Mapped["News"] = relationship(
        "News",
        back_populates="images",
    )

    __table_args__ = (
        Index("idx_news_images_news_sort", "news_id", "sort_order"),
    )

class Tag(Base):
    __tablename__ = "tags"

    id: Mapped[int] = mapped_column(ID, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
    )

    __table_args__ = (
        UniqueConstraint("name", name="uq_tags_name"),
        UniqueConstraint("slug", name="uq_tags_slug"),
    )


class NewsTag(Base):
    __tablename__ = "news_tags"

    news_id: Mapped[int] = mapped_column(
        ID,
        ForeignKey(
            "news.id",
            ondelete="CASCADE",
            onupdate="CASCADE",
            name="fk_news_tags_news",
        ),
        primary_key=True,
    )
    tag_id: Mapped[int] = mapped_column(
        ID,
        ForeignKey(
            "tags.id",
            ondelete="CASCADE",
            onupdate="CASCADE",
            name="fk_news_tags_tag",
        ),
        primary_key=True,
    )

    __table_args__ = (
        Index("idx_news_tags_tag", "tag_id"),
    )


class Program(Base):
    __tablename__ = "programs"

    id: Mapped[int] = mapped_column(ID, primary_key=True, autoincrement=True)
    period_id: Mapped[int] = mapped_column(
        ID,
        ForeignKey(
            "periods.id",
            ondelete="RESTRICT",
            onupdate="CASCADE",
            name="fk_programs_period",
        ),
        nullable=False,
    )
    division_id: Mapped[int | None] = mapped_column(
        ID,
        ForeignKey(
            "divisions.id",
            ondelete="SET NULL",
            onupdate="CASCADE",
            name="fk_programs_division",
        ),
    )
    created_by: Mapped[int | None] = mapped_column(
        ID,
        ForeignKey(
            "admins.id",
            ondelete="SET NULL",
            onupdate="CASCADE",
            name="fk_programs_created_by",
        ),
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        server_default="planned",
    )
    start_date: Mapped[date | None] = mapped_column(Date)
    end_date: Mapped[date | None] = mapped_column(Date)
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
        UniqueConstraint("slug", name="uq_programs_slug"),
        Index("idx_programs_period_status", "period_id", "status"),
        Index("idx_programs_division", "division_id"),
        Index("idx_programs_dates", "start_date", "end_date"),
        Index("idx_programs_created_by", "created_by"),
    )


class Agenda(Base):
    __tablename__ = "agendas"

    id: Mapped[int] = mapped_column(ID, primary_key=True, autoincrement=True)
    created_by: Mapped[int | None] = mapped_column(
        ID,
        ForeignKey(
            "admins.id",
            ondelete="SET NULL",
            onupdate="CASCADE",
            name="fk_agendas_created_by",
        ),
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    start_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
    )
    end_at: Mapped[datetime | None] = mapped_column(DateTime)
    location: Mapped[str | None] = mapped_column(String(255))
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
        Index("idx_agendas_start_end", "start_at", "end_at"),
        Index("idx_agendas_created_by", "created_by"),
    )


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(ID, primary_key=True, autoincrement=True)
    uploaded_by: Mapped[int | None] = mapped_column(
        ID,
        ForeignKey(
            "admins.id",
            ondelete="SET NULL",
            onupdate="CASCADE",
            name="fk_documents_uploaded_by",
        ),
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str | None] = mapped_column(String(100))
    storage_key: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )
    original_filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    size_bytes: Mapped[int] = mapped_column(ID, nullable=False)
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
            "storage_key",
            name="uq_documents_storage_key",
        ),
        Index(
            "idx_documents_category_created",
            "category",
            "created_at",
        ),
        Index("idx_documents_uploaded_by", "uploaded_by"),
    )


class SiteSetting(Base):
    __tablename__ = "site_settings"

    id: Mapped[int] = mapped_column(ID, primary_key=True, autoincrement=True)
    setting_key: Mapped[str] = mapped_column(String(150), nullable=False)
    setting_value: Mapped[str | None] = mapped_column(Text)
    value_type: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        server_default="string",
    )
    updated_by: Mapped[int | None] = mapped_column(
        ID,
        ForeignKey(
            "admins.id",
            ondelete="SET NULL",
            onupdate="CASCADE",
            name="fk_site_settings_updated_by",
        ),
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
            "setting_key",
            name="uq_site_settings_key",
        ),
        Index("idx_site_settings_type", "value_type"),
        Index("idx_site_settings_updated_by", "updated_by"),
    )