from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

def register_exception_handlers(app: FastAPI):
    @app.exception_handler(RequestValidationError)
    async def validation_handler(_request: Request, exc: RequestValidationError):
        return JSONResponse(status_code=422, content={"detail":"Validation error", "errors": exc.errors()})
    @app.exception_handler(StarletteHTTPException)
    async def http_handler(_request: Request, exc: StarletteHTTPException):
        detail = exc.detail if isinstance(exc.detail, str) else "Request error"
        return JSONResponse(status_code=exc.status_code, content={"detail": detail}, headers=exc.headers or None)
    @app.exception_handler(Exception)
    async def generic_handler(_request: Request, _exc: Exception):
        return JSONResponse(status_code=500, content={"detail":"Terjadi kesalahan pada server"})
