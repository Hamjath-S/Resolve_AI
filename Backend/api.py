# ==================================================
# RESOLVEAI BACKEND API
# ==================================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from Backend.agent import run_agent


# ==================================================
# FASTAPI APPLICATION
# ==================================================

app = FastAPI(
    title="ResolveAI API",
    description="Backend API for ResolveAI Autonomous Incident Agent",
    version="1.0.0"
)


# ==================================================
# CORS
# ==================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]
)


# ==================================================
# INCIDENT REQUEST MODEL
# ==================================================

class IncidentRequest(BaseModel):

    title: str

    description: str

    ticket_id: str | None = None


# ==================================================
# ROOT ENDPOINT
# ==================================================

@app.get("/")
def root():

    return {
        "service": "ResolveAI",
        "status": "online",
        "message": "ResolveAI backend is running."
    }


# ==================================================
# HEALTH CHECK
# ==================================================

@app.get("/health")
def health_check():

    return {
        "status": "healthy"
    }


# ==================================================
# RUN AUTONOMOUS AGENT
# ==================================================

@app.post("/api/agent/run")
def execute_agent(
    incident_request: IncidentRequest
):

    # --------------------------------------------------
    # BUILD INCIDENT OBJECT
    # --------------------------------------------------

    incident = {

        "title":
            incident_request.title,

        "description":
            incident_request.description
    }


    # --------------------------------------------------
    # ADD TICKET ID IF PROVIDED
    # --------------------------------------------------

    if incident_request.ticket_id:

        incident["ticket_id"] = (
            incident_request.ticket_id
        )


    # --------------------------------------------------
    # RUN RESOLVEAI AGENT
    # --------------------------------------------------

    try:

        result = run_agent(

            incident=incident,

            top_k=3

        )


        # --------------------------------------------------
        # RETURN SUCCESS RESPONSE
        # --------------------------------------------------

        return {

            "success": True,

            "data": result

        }


    except Exception as e:

        # --------------------------------------------------
        # LOG ERROR
        # --------------------------------------------------

        print(
            "\n=========================================="
        )

        print(
            "RESOLVEAI API ERROR"
        )

        print(
            "=========================================="
        )

        print(
            "Error type:",
            type(e).__name__
        )

        print(
            "Error message:",
            str(e)
        )

        print(
            "==========================================\n"
        )


        # --------------------------------------------------
        # RETURN ERROR RESPONSE
        # --------------------------------------------------

        return {

            "success": False,

            "error": str(e)

        }