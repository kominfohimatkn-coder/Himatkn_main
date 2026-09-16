import os
os.environ.update({'APP_ENV':'test','DATABASE_URL':'sqlite:///./test_himatkn.sqlite3','JWT_SECRET_KEY':'test-secret-'+'x'*40,'COOKIE_SECURE':'false','RATE_LIMIT_BACKEND':'memory','STORAGE_BACKEND':'local','STORAGE_LOCAL_DIR':'storage/test-uploads'})
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database.connection import Base, engine
from app.core.security import hash_password
from app.models import Admin, AdminRole, Permission, Role, RolePermission

@pytest.fixture(scope='session', autouse=True)
def db_setup():
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    Session=sessionmaker(bind=engine, expire_on_commit=False)
    db=Session()
    superadmin=Role(name='superadmin', description='test'); db.add(superadmin); db.flush()
    perms=['dashboard.view',
           'news.view','news.create',
           'news.update','news.delete',
           'organization.view',
           'organization.manage',
           'programs.view',
           'programs.manage',
           'agendas.view',
           'agendas.manage',
           'documents.view',
           'documents.manage',
           'settings.view',
           'settings.manage',
           'notifications.view',
           'notifications.manage',
           'activity_logs.view',
           'admins.view',
           'admins.manage',
           'roles.manage',
           'visitor_logs.view']
    for name in perms:
        p=Permission(name=name, description=name); db.add(p); db.flush(); db.add(RolePermission(role_id=superadmin.id,permission_id=p.id))
    editor=Role(name='editor', description='limited'); db.add(editor); db.flush()
    news_view=db.scalar(__import__('sqlalchemy').select(Permission).where(Permission.name=='news.view'))
    db.add(RolePermission(role_id=editor.id, permission_id=news_view.id))
    admin=Admin(username='admin', password_hash=hash_password('admin-password-1234')); db.add(admin); db.flush(); db.add(AdminRole(admin_id=admin.id,role_id=superadmin.id))
    limited=Admin(username='limited', password_hash=hash_password('limited-password-1234')); db.add(limited); db.flush(); db.add(AdminRole(admin_id=limited.id,role_id=editor.id))
    db.commit(); db.close()
    yield
    Base.metadata.drop_all(engine)
    engine.dispose()
    try: os.remove('test_himatkn.sqlite3')
    except FileNotFoundError: pass

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture(autouse=True)
def reset_rate_limiter():
    from app.core.rate_limit import limiter
    limiter._events.clear()
    yield
