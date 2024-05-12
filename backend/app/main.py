from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


# import routers
from .src.routers import ai
from .src.routers import db
# from .src.routers import language
# from .src.routers import chat
from .src.routers import auth
from .src.routers import celery


def application_setup() -> FastAPI:
    ''' Configure, start and return the application '''

    # Start FastApi App
    application = FastAPI()

    # Mapping api routes
    application.include_router(ai.router)
    application.include_router(db.router)
   # application.include_router(chat.router)
    # application.include_router(language.router)
    application.include_router(auth.router)
    application.include_router(celery.router)

    # Allow cors
    application.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    return application


app = application_setup()
