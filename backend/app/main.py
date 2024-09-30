from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import SECRET_KEY

from .src.routers.scheduler import scheduler, start_scheduler, stop_scheduler
# import routers
from .src.routers import auth
from .src.routers import settings
from .src.routers import push
from .src.routers import project
from .src.routers import milestone
from .src.routers import team
from .src.routers import tki
from .src.routers import neoffi
from .src.routers import clicks

from .src.routers import ai
from .src.routers import avatar
from .src.routers import calendar
from .src.routers import kanban
from .src.routers import language
from .src.routers import timeline
from .src.routers import notification
from .src.routers import chat

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

# Define the middleware to limit upload size
class LimitUploadSizeMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        content_length = request.headers.get('content-length')
        max_size = 10 * 1024 * 1024  # 10 MB limit
        if content_length and int(content_length) > max_size:
            return JSONResponse({"error": "File too large"}, status_code=413)
        return await call_next(request)

# Define the lifespan context manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    start_scheduler()
    yield
    # Shutdown
    stop_scheduler()


def application_setup() -> FastAPI:
    ''' Configure, start, and return the application '''

    # Start FastApi App
    application = FastAPI(lifespan=lifespan)


    application.add_middleware(LimitUploadSizeMiddleware)
    
    # Mapping api routes with '/api' prefix
    application.include_router(auth.router, prefix="/api")
    #application.include_router(celery.router, prefix="/api")
    application.include_router(settings.router, prefix="/api")
    application.include_router(push.router, prefix="/api")
    application.include_router(project.router, prefix="/api")
    application.include_router(milestone.router, prefix="/api")
    application.include_router(team.router, prefix="/api")
    application.include_router(tki.router, prefix="/api")
    application.include_router(neoffi.router, prefix="/api")
    application.include_router(clicks.router, prefix="/api")

    application.include_router(chat.router, prefix="/api")
    application.include_router(avatar.router, prefix="/api")
    application.include_router(ai.router, prefix="/api")
    application.include_router(calendar.router, prefix="/api")
    application.include_router(kanban.router, prefix="/api")
    application.include_router(language.router, prefix="/api")
    application.include_router(timeline.router, prefix="/api")
    application.include_router(notification.router, prefix="/api")

    # Allow CORS
    application.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    return application


app = application_setup()


app.openapi_schema = None
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="FastAPI OAuth2 JWT",
        version="1.0.0",
        description="Dies ist eine sehr sichere App mit OAuth2 JWT Authentifizierung",
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "OAuth2PasswordBearer": {
            "type": "oauth2",
            "flows": {
                "password": {
                    "tokenUrl": "/api/login",
                    "scopes": {}
                }
            }
        }
    }
    for path in openapi_schema["paths"].values():
        for method in path.values():
            method["security"] = [{"OAuth2PasswordBearer": []}]
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi


# Abhängigkeitsimport für OpenAPI
from fastapi.openapi.utils import get_openapi
