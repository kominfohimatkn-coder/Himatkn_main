from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.database.dependencies import require_permission, require_csrf
from app.models import Admin
from app.schemas.content import SettingIn, SettingsPatchIn
from app.services.audit import log_activity
from app.services.site_settings import (
    SETTINGS_REGISTRY,
    SettingDefinition,
    SettingValidationError,
    admin_settings_payload,
    definition_for,
    normalize_value,
    settings_rows_by_key,
    upsert_setting,
)

router = APIRouter(
    prefix="/admin/settings",
    tags=["admin"],
)


def _request_metadata(request: Request) -> dict[str, str | None]:
    return {
        "ip_address": request.client.host if request.client else None,
        "user_agent": request.headers.get("user-agent", "")[:500],
    }


def _require_definition(key: str) -> SettingDefinition:
    definition = definition_for(key)

    if definition is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Setting tidak dikenal",
        )

    return definition


@router.get("")
def list_settings(
    db: Session = Depends(get_db),
    _: Admin = Depends(require_permission("settings.view")),
):
    items, unknown_keys = admin_settings_payload(db)

    return {
        "items": items,
        "unknown_keys": unknown_keys,
    }


@router.put("/{key}", dependencies=[Depends(require_csrf)])
def update_setting(
    key: str,
    payload: SettingIn,
    request: Request,
    db: Session = Depends(get_db),
    admin: Admin = Depends(require_permission("settings.manage")),
):
    definition = _require_definition(key)

    try:
        value = normalize_value(
            definition,
            payload.setting_value,
        )
    except SettingValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    row = upsert_setting(
        db,
        definition,
        value,
        admin.id,
    )

    log_activity(
        db,
        admin.id,
        "settings.update",
        "site_setting",
        description=f"Mengubah setting {definition.key}",
        **_request_metadata(request),
    )

    db.commit()
    db.refresh(row)

    return {
        "key": row.setting_key,
        "value": row.setting_value,
        "type": row.value_type,
        "updated_by": row.updated_by,
    }


@router.patch("", dependencies=[Depends(require_csrf)])
def update_settings(
    payload: SettingsPatchIn,
    request: Request,
    db: Session = Depends(get_db),
    admin: Admin = Depends(require_permission("settings.manage")),
):
    values = payload.values

    if not values:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Tidak ada setting yang dikirim",
        )

    if len(values) > len(SETTINGS_REGISTRY):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Terlalu banyak setting dalam satu permintaan",
        )

    errors: dict[str, str] = {}
    normalized: dict[str, str] = {}

    for key, raw_value in values.items():
        definition = definition_for(key)

        if definition is None:
            errors[key] = "Setting tidak dikenal"
            continue

        try:
            normalized[key] = normalize_value(
                definition,
                raw_value,
            )
        except SettingValidationError as exc:
            errors[key] = str(exc)

    if errors:
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "detail": "Validasi gagal",
                "errors": errors,
            },
        )

    for key, value in normalized.items():
        upsert_setting(
            db,
            SETTINGS_REGISTRY[key],
            value,
            admin.id,
        )

    changed_keys = list(normalized)

    log_activity(
        db,
        admin.id,
        "settings.update",
        "site_setting",
        description=(
            "Mengubah setting: " + ", ".join(changed_keys)
        ),
        **_request_metadata(request),
    )

    db.commit()

    return {
        "updated": changed_keys,
        "settings": normalized,
    }


@router.delete("/{key}", dependencies=[Depends(require_csrf)])
def delete_setting(
    key: str,
    request: Request,
    db: Session = Depends(get_db),
    admin: Admin = Depends(require_permission("settings.manage")),
):
    definition = definition_for(key)
    rows = settings_rows_by_key(db)
    row = rows.get(key)

    if definition is None and row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Setting tidak ditemukan",
        )

    if row is not None:
        db.delete(row)

        log_activity(
            db,
            admin.id,
            "settings.delete",
            "site_setting",
            description=f"Menghapus setting {key}",
            **_request_metadata(request),
        )

        db.commit()

    return {
        "deleted": key,
        "value": definition.default if definition else None,
    }
