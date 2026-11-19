from __future__ import annotations

from app.seed import PERMS

SUPERADMIN_ROLE = "superadmin"

SUPERADMIN_ONLY = frozenset(
    {
        "admins.view",
        "admins.manage",
        "roles.manage",
    }
)

ALWAYS_GRANTED = frozenset({"dashboard.view"})


class PermissionValidationError(ValueError):
    """Raised when a permission name cannot be assigned to an account."""


def _permission(name: str, label: str, implies: list[str] | None = None) -> dict:
    return {
        "name": name,
        "label": label,
        "implies": list(implies or []),
    }


PERMISSION_CATALOG = [
    {
        "key": "dashboard",
        "label": "Dashboard",
        "available": True,
        "permissions": [
            _permission("dashboard.view", "Melihat dashboard"),
        ],
    },
    {
        "key": "news",
        "label": "Publikasi",
        "available": True,
        "permissions": [
            _permission("news.view", "Melihat publikasi"),
            _permission(
                "news.create",
                "Membuat publikasi",
                ["news.view"],
            ),
            _permission(
                "news.update",
                "Mengubah publikasi",
                ["news.view"],
            ),
            _permission(
                "news.delete",
                "Menghapus publikasi",
                ["news.view"],
            ),
        ],
    },
    {
        "key": "programs",
        "label": "Program kerja",
        "available": True,
        "permissions": [
            _permission("programs.view", "Melihat program kerja"),
            _permission(
                "programs.manage",
                "Mengelola program kerja",
                ["programs.view"],
            ),
        ],
    },
    {
        "key": "organization",
        "label": "Organisasi",
        "available": True,
        "permissions": [
            _permission("organization.view", "Melihat organisasi"),
            _permission(
                "organization.manage",
                "Mengelola organisasi",
                ["organization.view", "media.manage"],
            ),
        ],
    },
    {
        "key": "settings",
        "label": "Pengaturan situs",
        "available": True,
        "permissions": [
            _permission("settings.view", "Melihat pengaturan"),
            _permission(
                "settings.manage",
                "Mengelola pengaturan",
                ["settings.view", "media.manage"],
            ),
        ],
    },
    {
        "key": "media",
        "label": "Upload gambar",
        "available": True,
        "permissions": [
            _permission("media.manage", "Mengelola upload media"),
        ],
    },
    {
        "key": "activity_logs",
        "label": "Log aktivitas",
        "available": True,
        "permissions": [
            _permission("activity_logs.view", "Melihat log aktivitas"),
        ],
    },
    {
        "key": "visitor_logs",
        "label": "Statistik pengunjung",
        "available": True,
        "permissions": [
            _permission(
                "visitor_logs.view",
                "Melihat statistik pengunjung",
            ),
        ],
    },
    {
        "key": "agendas",
        "label": "Agenda",
        "available": False,
        "permissions": [
            _permission("agendas.view", "Melihat agenda"),
            _permission(
                "agendas.manage",
                "Mengelola agenda",
                ["agendas.view"],
            ),
        ],
    },
    {
        "key": "documents",
        "label": "Dokumen",
        "available": False,
        "permissions": [
            _permission("documents.view", "Melihat dokumen"),
            _permission(
                "documents.manage",
                "Mengelola dokumen",
                ["documents.view"],
            ),
        ],
    },
    {
        "key": "notifications",
        "label": "Notifikasi",
        "available": False,
        "permissions": [
            _permission("notifications.view", "Melihat notifikasi"),
            _permission(
                "notifications.manage",
                "Mengelola notifikasi",
                ["notifications.view"],
            ),
        ],
    },
]


IMPLICATIONS: dict[str, set[str]] = {
    permission["name"]: set(permission["implies"])
    for module in PERMISSION_CATALOG
    for permission in module["permissions"]
}

CATALOG_PERMISSION_NAMES = frozenset(IMPLICATIONS)
SEED_PERMISSION_NAMES = frozenset(name for name, _ in PERMS)


def _validate_catalog() -> None:
    missing_from_seed = CATALOG_PERMISSION_NAMES - SEED_PERMISSION_NAMES

    if missing_from_seed:
        raise RuntimeError(
            "Katalog izin memuat nama yang tidak ada di PERMS seed: "
            f"{sorted(missing_from_seed)}"
        )

    not_assigned = SEED_PERMISSION_NAMES - (
        CATALOG_PERMISSION_NAMES | SUPERADMIN_ONLY
    )

    if not_assigned:
        raise RuntimeError(
            "PERMS seed memuat izin yang tidak ada di katalog maupun "
            f"SUPERADMIN_ONLY: {sorted(not_assigned)}"
        )

    overlapping = CATALOG_PERMISSION_NAMES & SUPERADMIN_ONLY

    if overlapping:
        raise RuntimeError(
            "Izin khusus superadmin tidak boleh ada di katalog: "
            f"{sorted(overlapping)}"
        )

    for permission_name, implied_names in IMPLICATIONS.items():
        unknown = implied_names - CATALOG_PERMISSION_NAMES

        if unknown:
            raise RuntimeError(
                f"Izin implikasi untuk {permission_name} tidak dikenal: "
                f"{sorted(unknown)}"
            )


_validate_catalog()


def expand_permissions(names: set[str]) -> set[str]:
    expanded = set(names)
    pending = list(expanded)

    while pending:
        current = pending.pop()
        for implied in IMPLICATIONS.get(current, set()):
            if implied not in expanded:
                expanded.add(implied)
                pending.append(implied)

    return expanded


def normalize_permissions(names: list[str] | set[str]) -> set[str]:
    normalized: set[str] = set()

    for raw_name in names:
        name = str(raw_name).strip()

        if name in SUPERADMIN_ONLY:
            raise PermissionValidationError(
                f"Izin '{name}' hanya untuk superadmin dan tidak dapat "
                "diberikan ke akun lain."
            )

        if name not in CATALOG_PERMISSION_NAMES:
            raise PermissionValidationError(
                f"Izin tidak dikenal: '{name}'."
            )

        normalized.add(name)

    return expand_permissions(normalized) | ALWAYS_GRANTED
