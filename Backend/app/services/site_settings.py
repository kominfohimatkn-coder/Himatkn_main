"""Registry and validation for site settings.

This module is the single source of truth for which ``site_settings`` keys may
be written. Rows in the database whose key is not in ``SETTINGS_REGISTRY`` are
ignored by public reads and reported as ``unknown_keys`` to the admin API.

The registry intentionally mirrors the public copy/data contract. Values are
plain text; the frontend is responsible for rendering text keys as text and
never as HTML.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from urllib.parse import urlsplit

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import SiteSetting

TEXT = "text"
MULTILINE = "multiline"
URL = "url"
EMAIL = "email"
IMAGE = "image"

TEXT_MAX_LENGTH = 300
DESCRIPTION_MAX_LENGTH = 1000
URL_MAX_LENGTH = 2048
EMAIL_MAX_LENGTH = 254
ADDRESS_MAX_LENGTH = 500
IMAGE_MAX_LENGTH = 500

MEDIA_IMAGE_PREFIX = "/api/v1/media/images/"

_EMAIL_PATTERN = re.compile(
    r"^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+"
    r"@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?"
    r"(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$"
)

# Storage keys produced by POST /media/images: images/<name>.<image ext>.
_IMAGE_KEY_PATTERN = re.compile(
    r"^images/[A-Za-z0-9][A-Za-z0-9_-]*\.(?:jpg|jpeg|png|webp)$"
)

# C0 controls except newline (tab is rejected too).
_CONTROL_PATTERN = re.compile(r"[\x00-\x09\x0b-\x1f\x7f]")


class SettingValidationError(ValueError):
    """Raised when a value does not satisfy its registry definition."""


@dataclass(frozen=True)
class SettingDefinition:
    key: str
    group: str
    type: str
    label: str
    default: str = ""
    max_length: int = TEXT_MAX_LENGTH
    public: bool = True
    allowed_hosts: tuple[str, ...] = ()
    path_prefix: str | None = None
    host_path_prefixes: tuple[tuple[str, str], ...] = ()


def _text(
    key: str,
    group: str,
    label: str,
    default: str = "",
    *,
    max_length: int = TEXT_MAX_LENGTH,
) -> SettingDefinition:
    return SettingDefinition(
        key=key,
        group=group,
        type=TEXT,
        label=label,
        default=default,
        max_length=max_length,
    )


def _multiline(
    key: str,
    group: str,
    label: str,
    default: str = "",
    *,
    max_length: int = DESCRIPTION_MAX_LENGTH,
) -> SettingDefinition:
    return SettingDefinition(
        key=key,
        group=group,
        type=MULTILINE,
        label=label,
        default=default,
        max_length=max_length,
    )


def _url(
    key: str,
    group: str,
    label: str,
    allowed_hosts: tuple[str, ...],
    *,
    path_prefix: str | None = None,
    host_path_prefixes: dict[str, str] | None = None,
) -> SettingDefinition:
    return SettingDefinition(
        key=key,
        group=group,
        type=URL,
        label=label,
        max_length=URL_MAX_LENGTH,
        allowed_hosts=allowed_hosts,
        path_prefix=path_prefix,
        host_path_prefixes=tuple(
            sorted((host_path_prefixes or {}).items())
        ),
    )


def _image(
    key: str,
    group: str,
    label: str,
    *,
    max_length: int = IMAGE_MAX_LENGTH,
) -> SettingDefinition:
    return SettingDefinition(
        key=key,
        group=group,
        type=IMAGE,
        label=label,
        max_length=max_length,
    )


_REGISTRY_ORDER: tuple[SettingDefinition, ...] = (
    _text("brand_name", "brand", "Nama brand", "HIMA TEKNOKIMIA NUKLIR"),
    _text(
        "brand_subtitle",
        "brand",
        "Subjudul brand",
        "POLITEKNIK TEKNOLOGI NUKLIR",
    ),
    _text("footer_copyright", "brand", "Teks hak cipta footer"),
    _text("footer_institution", "brand", "Nama institusi footer"),
    _url(
        "bank_soal_url",
        "links",
        "URL Bank Soal",
        ("drive.google.com",),
    ),
    _url(
        "instagram_url",
        "links",
        "URL Instagram",
        ("instagram.com", "www.instagram.com"),
    ),
    _text("instagram_label", "links", "Label Instagram"),
    SettingDefinition(
        key="contact_email",
        group="contact",
        type=EMAIL,
        label="Email kontak",
        max_length=EMAIL_MAX_LENGTH,
    ),
    _multiline(
        "secretariat_address",
        "contact",
        "Alamat sekretariat",
        max_length=ADDRESS_MAX_LENGTH,
    ),
    _url(
        "maps_url",
        "contact",
        "URL peta (buka di Google Maps)",
        (
            "maps.app.goo.gl",
            "www.google.com",
            "google.com",
            "maps.google.com",
        ),
        host_path_prefixes={
            "www.google.com": "/maps",
            "google.com": "/maps",
            "maps.google.com": "/maps",
        },
    ),
    _url(
        "maps_embed_url",
        "contact",
        "URL embed Google Maps",
        ("www.google.com",),
        path_prefix="/maps/embed",
    ),
    _text("hero_eyebrow", "hero", "Label kecil hero", "HIMATKN"),
    _text("hero_title", "hero", "Judul hero", "Himpunan Mahasiswa"),
    _text("hero_emphasis", "hero", "Kata penekanan hero", "Teknokimia Nuklir"),
    _text(
        "hero_description",
        "hero",
        "Deskripsi hero",
        "Wadah mahasiswa Teknokimia Nuklir untuk belajar, berkarya, "
        "dan berkontribusi.",
        max_length=DESCRIPTION_MAX_LENGTH,
    ),
    _image("hero_image", "hero", "Foto hero"),
    _text(
        "hero_image_alt",
        "hero",
        "Deskripsi foto hero (untuk pembaca layar)",
        max_length=200,
    ),
    _text("hero_primary_label", "hero", "Label tombol utama hero", "Lihat Program Kerja"),
    _text("hero_secondary_label", "hero", "Label tombol kedua hero", "Kenali Kami"),
    _text("about_eyebrow", "about", "Label kecil Tentang"),
    _text("about_title", "about", "Judul Tentang", "Ruang Tumbuh Mahasiswa"),
    _text(
        "about_description",
        "about",
        "Deskripsi Tentang",
        "Himpunan mahasiswa yang menjadi ruang belajar, berkarya, "
        "dan berkolaborasi.",
        max_length=DESCRIPTION_MAX_LENGTH,
    ),
    _text("about_item_1_tag", "about", "Tag poin Tentang 1", "Komunitas"),
    _text("about_item_1_title", "about", "Judul poin Tentang 1", "Komunitas"),
    _text(
        "about_item_1_description",
        "about",
        "Deskripsi poin Tentang 1",
        "Tempat bertemu dan bertukar gagasan antaranggota.",
        max_length=DESCRIPTION_MAX_LENGTH,
    ),
    _text("about_item_2_tag", "about", "Tag poin Tentang 2", "Karya"),
    _text("about_item_2_title", "about", "Judul poin Tentang 2", "Karya"),
    _text(
        "about_item_2_description",
        "about",
        "Deskripsi poin Tentang 2",
        "Wadah mengembangkan karya dan kompetensi.",
        max_length=DESCRIPTION_MAX_LENGTH,
    ),
    _text("about_item_3_tag", "about", "Tag poin Tentang 3", "Kolaborasi"),
    _text("about_item_3_title", "about", "Judul poin Tentang 3", "Kolaborasi"),
    _text(
        "about_item_3_description",
        "about",
        "Deskripsi poin Tentang 3",
        "Ruang bekerja sama dengan berbagai pihak.",
        max_length=DESCRIPTION_MAX_LENGTH,
    ),
    _text("program_eyebrow", "program", "Label kecil Program", "Program"),
    _text("program_title", "program", "Judul Program", "Program Kerja"),
    _text(
        "program_empty_text",
        "program",
        "Teks kosong Program",
        "Belum ada program kerja.",
    ),
    _text("news_eyebrow", "news", "Label kecil Publikasi", "Publikasi"),
    _text("news_title", "news", "Judul Publikasi", "Kabar Terbaru"),
    _text(
        "news_empty_text",
        "news",
        "Teks kosong Publikasi",
        "Belum ada publikasi.",
    ),
    _text("news_more_label", "news", "Label tautan semua Publikasi", "Lihat semua"),
    _text("structure_eyebrow", "structure", "Label kecil Kepengurusan", "Organisasi"),
    _text(
        "structure_title",
        "structure",
        "Judul Kepengurusan",
        "Susunan Kepengurusan",
    ),
    _text(
        "structure_description",
        "structure",
        "Deskripsi Kepengurusan",
        "Kenali struktur dan anggota kepengurusan.",
        max_length=DESCRIPTION_MAX_LENGTH,
    ),
    _text(
        "structure_note",
        "structure",
        "Catatan Kepengurusan",
        max_length=DESCRIPTION_MAX_LENGTH,
    ),
    _text(
        "structure_button_label",
        "structure",
        "Label tombol Kepengurusan",
        "Selengkapnya",
    ),
    _text("contact_eyebrow", "contact", "Label kecil Kontak", "Kontak"),
    _text("contact_title", "contact", "Judul Kontak", "Hubungi Kami"),
    _text(
        "contact_description",
        "contact",
        "Deskripsi Kontak",
        "Sampaikan pertanyaan atau kolaborasi melalui kanal resmi.",
        max_length=DESCRIPTION_MAX_LENGTH,
    ),
    _text(
        "contact_button_label",
        "contact",
        "Label tombol Kontak",
        "Kirim Email",
    ),
)

SETTINGS_REGISTRY: dict[str, SettingDefinition] = {
    definition.key: definition for definition in _REGISTRY_ORDER
}

PUBLIC_SETTING_KEYS: tuple[str, ...] = tuple(
    definition.key
    for definition in _REGISTRY_ORDER
    if definition.public
)


def definition_for(key: str) -> SettingDefinition | None:
    return SETTINGS_REGISTRY.get(key)


def normalize_value(
    definition: SettingDefinition,
    raw: str | None,
) -> str:
    """Trim and validate a value, returning the value to persist."""

    value = "" if raw is None else str(raw)

    if definition.type == MULTILINE:
        value = value.replace("\r\n", "\n").replace("\r", "\n")

    value = value.strip()

    if _CONTROL_PATTERN.search(value) or (
        definition.type != MULTILINE and "\n" in value
    ):
        raise SettingValidationError(
            "Nilai memuat karakter yang tidak diizinkan."
        )

    if len(value) > definition.max_length:
        raise SettingValidationError(
            "Nilai terlalu panjang (maksimal "
            f"{definition.max_length} karakter)."
        )

    if not value:
        return ""

    if definition.type == URL:
        _validate_url(definition, value)
    elif definition.type == EMAIL:
        _validate_email(value)
    elif definition.type == IMAGE:
        value = _normalize_image(value)

    return value


def media_image_path(storage_key: str) -> str:
    """Return the public media path for an image storage key."""

    if storage_key.startswith("images/"):
        return f"/api/v1/media/{storage_key}"

    return f"{MEDIA_IMAGE_PREFIX}{storage_key}"


def _normalize_image(value: str) -> str:
    if value.startswith(MEDIA_IMAGE_PREFIX):
        value = f"images/{value[len(MEDIA_IMAGE_PREFIX):]}"

    if not _IMAGE_KEY_PATTERN.fullmatch(value):
        raise SettingValidationError(
            "Nilai harus berupa storage key gambar yang valid."
        )

    return value


def _validate_url(definition: SettingDefinition, value: str) -> None:
    if any(character.isspace() for character in value):
        raise SettingValidationError("URL tidak boleh memuat spasi.")

    if "\\" in value:
        raise SettingValidationError("URL tidak boleh memuat backslash.")

    try:
        parts = urlsplit(value)
        port = parts.port
    except ValueError as exc:
        raise SettingValidationError("Format URL tidak valid.") from exc

    if parts.scheme != "https":
        raise SettingValidationError("URL wajib memakai skema https.")

    if not parts.netloc or not parts.hostname:
        raise SettingValidationError("Format URL tidak valid.")

    if parts.username or parts.password:
        raise SettingValidationError("URL tidak boleh memuat kredensial.")

    if port not in (None, 443):
        raise SettingValidationError("URL tidak boleh memakai port khusus.")

    if parts.hostname not in definition.allowed_hosts:
        raise SettingValidationError("Host URL tidak diizinkan.")

    required_prefix = definition.path_prefix

    if required_prefix is None and definition.host_path_prefixes:
        required_prefix = dict(definition.host_path_prefixes).get(
            parts.hostname
        )

    if required_prefix and not re.match(
        rf"^{re.escape(required_prefix)}(?:/|$)",
        parts.path or "",
    ):
        raise SettingValidationError(
            f"Path URL harus diawali {required_prefix}."
        )


def _validate_email(value: str) -> None:
    if not _EMAIL_PATTERN.fullmatch(value):
        raise SettingValidationError("Format email tidak valid.")


def settings_rows_by_key(db: Session) -> dict[str, SiteSetting]:
    rows = db.scalars(
        select(SiteSetting).order_by(SiteSetting.id)
    ).all()

    return {row.setting_key: row for row in rows}


def resolve_public_settings(db: Session) -> dict[str, str]:
    rows = settings_rows_by_key(db)

    resolved: dict[str, str] = {}

    for definition in _REGISTRY_ORDER:
        if not definition.public:
            continue

        row = rows.get(definition.key)

        resolved[definition.key] = (
            row.setting_value
            if row is not None and row.setting_value is not None
            else definition.default
        )

    return resolved


def admin_settings_payload(
    db: Session,
) -> tuple[list[dict], list[str]]:
    rows = settings_rows_by_key(db)
    items: list[dict] = []

    for definition in _REGISTRY_ORDER:
        row = rows.get(definition.key)

        value = (
            row.setting_value
            if row is not None and row.setting_value is not None
            else definition.default
        )

        item = {
            "key": definition.key,
            "group": definition.group,
            "type": definition.type,
            "label": definition.label,
            "value": value,
            "default": definition.default,
            "max_length": definition.max_length,
            "allowed_hosts": list(definition.allowed_hosts),
            "updated_by": row.updated_by if row is not None else None,
            "updated_at": row.updated_at if row is not None else None,
        }

        if definition.type == IMAGE:
            item["preview_url"] = media_image_path(value) if value else ""

        items.append(item)

    unknown_keys = sorted(
        key for key in rows if key not in SETTINGS_REGISTRY
    )

    return items, unknown_keys


def upsert_setting(
    db: Session,
    definition: SettingDefinition,
    value: str,
    admin_id: int | None,
) -> SiteSetting:
    row = db.scalar(
        select(SiteSetting).where(
            SiteSetting.setting_key == definition.key
        )
    )

    if row is None:
        row = SiteSetting(
            setting_key=definition.key,
            setting_value=value,
            value_type=definition.type,
            updated_by=admin_id,
        )
        db.add(row)
    else:
        row.setting_value = value
        row.value_type = definition.type
        row.updated_by = admin_id

    return row
