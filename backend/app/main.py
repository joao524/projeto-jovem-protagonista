import sys
import types

# Shim de compatibilidade para ambientes com política restritiva de DLLs no Windows
if "greenlet" not in sys.modules:
    try:
        import greenlet  # noqa
    except Exception:
        g = types.ModuleType("greenlet")
        class _DummyGreenlet:
            gr_context = None
            def __init__(self, run=None, parent=None):
                self.run = run
                self.parent = parent
            def switch(self, *a, **k):
                return self.run(*a, **k) if self.run else None
        g.greenlet = _DummyGreenlet
        g.getcurrent = lambda: _DummyGreenlet()
        g._C_API = None
        g.GreenletExit = type("GreenletExit", (Exception,), {})
        g.error = type("error", (Exception,), {})
        sys.modules["greenlet"] = g

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.modules.identity.router import router as identity_router
from app.modules.public.router import router as public_router
from app.modules.bookings.router import router as bookings_router
from app.modules.payments.router import router as payments_router
from app.modules.tickets.router import router as tickets_router
from app.modules.boarding.router import router as boarding_router
from app.modules.refunds.router import router as refunds_router
from app.modules.notifications.router import router as notifications_router
from app.modules.operations.router import router as operations_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API de Gestão e Comercialização de Travessias Ferry-Boat - Projeto Jovem Protagonista",
    version="0.2.0",
    # Documentação interativa desabilitada em produção
    docs_url=None if settings.is_production else "/docs",
    redoc_url=None if settings.is_production else "/redoc",
    openapi_url=None if settings.is_production else "/openapi.json",
)

# CORS: apenas origens explicitamente autorizadas (ver CORS_ORIGINS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Webhook-Token", "X-Signature"],
)

# Inclui rotas de todos os módulos
app.include_router(identity_router, prefix=settings.API_V1_PREFIX)
app.include_router(public_router, prefix=settings.API_V1_PREFIX)
app.include_router(bookings_router, prefix=settings.API_V1_PREFIX)
app.include_router(payments_router, prefix=settings.API_V1_PREFIX)
app.include_router(tickets_router, prefix=settings.API_V1_PREFIX)
app.include_router(boarding_router, prefix=settings.API_V1_PREFIX)
app.include_router(refunds_router, prefix=settings.API_V1_PREFIX)
app.include_router(notifications_router, prefix=settings.API_V1_PREFIX)
app.include_router(operations_router, prefix=settings.API_V1_PREFIX)


@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
    }
