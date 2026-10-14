import logging

from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger(__name__)


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(RequestValidationError)
    async def validation_handler(
        _request: Request,
        exc: RequestValidationError,
    ) -> JSONResponse:
        errors = [
            {
                "loc": error.get("loc", ()),
                "msg": error.get("msg", "Invalid value"),
                "type": error.get("type", "validation_error"),
            }
            for error in exc.errors()
        ]

        return JSONResponse(
            status_code=422,
            content=jsonable_encoder(
                {
                    "detail": "Validation error",
                    "errors": errors,
                }
            ),
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_handler(
        _request: Request,
        exc: StarletteHTTPException,
    ) -> JSONResponse:
        detail = (
            exc.detail
            if isinstance(exc.detail, str)
            else "Request error"
        )

        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": detail},
            headers=exc.headers or None,
        )

    @app.exception_handler(Exception)
    async def generic_handler(
        request: Request,
        exc: Exception,
    ) -> JSONResponse:
        logger.error(
            "Unhandled exception during %s %s",
            request.method,
            request.url.path,
            exc_info=(type(exc), exc, exc.__traceback__),
        )

        return JSONResponse(
            status_code=500,
            content={"detail": "Terjadi kesalahan pada server"},
        )