from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
from routers import tickets
from routers import analytics

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Helpdesk Ticket Management System", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tickets.router)
app.include_router(analytics.router)


@app.get("/")
def health_check():
    return {"status": "ok", "message": "HDMS API is running"}
