from sqlalchemy import select

from app.core.config import settings
from app.core.security import hash_password
from app.database.connection import SessionLocal
from app.models import Admin, AdminRole, Permission, Role, RolePermission


ROLE_SEEDS = {
    "superadmin": "Akses penuh seluruh backend.",
}

PERMS = [
    ("dashboard.view", "Melihat dashboard"),
    ("news.view", "Melihat publikasi"),
    ("news.create", "Membuat publikasi"),
    ("news.update", "Mengubah publikasi"),
    ("news.delete", "Menghapus publikasi"),
    ("organization.view", "Melihat organisasi"),
    ("organization.manage", "Mengelola organisasi"),
    ("programs.view", "Melihat program kerja"),
    ("programs.manage", "Mengelola program kerja"),
    ("agendas.view", "Melihat agenda"),
    ("agendas.manage", "Mengelola agenda"),
    ("documents.view", "Melihat dokumen"),
    ("documents.manage", "Mengelola dokumen"),
    ("settings.view", "Melihat pengaturan"),
    ("settings.manage", "Mengelola pengaturan"),
    ("notifications.view", "Melihat notifikasi"),
    ("notifications.manage", "Mengelola notifikasi"),
    ("activity_logs.view", "Melihat audit log"),
    ("admins.view", "Melihat administrator"),
    ("admins.manage", "Mengelola administrator"),
    ("roles.manage", "Mengelola role dan permission"),
    ("visitor_logs.view", "Melihat statistik pengunjung"),
    ("media.manage", "Mengelola upload media"),
]


def seed() -> None:
    db = SessionLocal()

    try:
        roles: dict[str, Role] = {}

        # Seed roles
        for name, description in ROLE_SEEDS.items():
            row = db.scalar(select(Role).where(Role.name == name))

            if row is None:
                row = Role(
                    name=name,
                    description=description,
                )
                db.add(row)
                db.flush()

            roles[name] = row

        # Seed permissions
        perms: dict[str, Permission] = {}

        for name, description in PERMS:
            row = db.scalar(
                select(Permission).where(Permission.name == name)
            )

            if row is None:
                row = Permission(
                    name=name,
                    description=description,
                )
                db.add(row)
                db.flush()

            perms[name] = row

        # Assign all permissions to the superadmin role.
        all_permissions = list(perms.values())

        for role in roles.values():
            for permission in all_permissions:
                existing = db.get(
                    RolePermission,
                    {
                        "role_id": role.id,
                        "permission_id": permission.id,
                    },
                )

                if existing is None:
                    db.add(
                        RolePermission(
                            role_id=role.id,
                            permission_id=permission.id,
                        )
                    )

        # Seed default admin only when no admin exists
        if db.scalar(select(Admin).limit(1)) is None:
            password = settings.admin_default_password

            if not password:
                raise RuntimeError(
                    "ADMIN_DEFAULT_PASSWORD wajib diisi untuk seed admin."
                )

            role_name = settings.admin_default_role
            role = roles.get(role_name)

            if role is None:
                raise RuntimeError(
                    f"Role default '{role_name}' tidak ditemukan."
                )

            admin = Admin(
                username=settings.admin_default_username.strip(),
                password_hash=hash_password(password),
            )

            db.add(admin)
            db.flush()

            db.add(
                AdminRole(
                    admin_id=admin.id,
                    role_id=role.id,
                )
            )

            print(
                f"Admin berhasil dibuat: "
                f"{settings.admin_default_username}"
            )
        else:
            print("Admin sudah ada, seed admin dilewati.")

        db.commit()

        print("Seed berhasil.")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed()