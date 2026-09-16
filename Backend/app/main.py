from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from app.core.config import settings
from app.database.connection import SessionLocal
from app.middleware.security import install_security_middleware
from app.services.auth import purge_expired
from app.utils.errors import register_exception_handlers
from app.routers import (
    activity, agenda, admins, auth, dashboard, documents, health, media, news,
    notifications, organization, programs, public, settings as settings_router,
)

@asynccontextmanager
async def lifespan(_app: FastAPI):
    if settings.app_env != 'test':
        with SessionLocal() as db:
            purge_expired(db)
            db.commit()
    yield

app = FastAPI(
    title=settings.app_name,
    debug=settings.debug and not settings.production,
    lifespan=lifespan,
    docs_url=None if settings.production else '/docs',
    redoc_url=None if settings.production else '/redoc',
    openapi_url=None if settings.production else '/openapi.json',
)
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allow_headers=['Accept','Content-Type','X-CSRF-Token'],
)
install_security_middleware(app)
register_exception_handlers(app)

from fastapi import APIRouter
api_router = APIRouter(prefix='/api/v1')
for router in [
    auth.router, admins.router, dashboard.router, organization.router, news.router,
    programs.router, agenda.router, documents.router, settings_router.router,
    notifications.router, activity.router, media.router, public.router, health.router,
]:
    api_router.include_router(router)
app.include_router(api_router)

@app.get('/', include_in_schema=False)
def root():
    return {'name': settings.app_name, 'status': 'ok'}

