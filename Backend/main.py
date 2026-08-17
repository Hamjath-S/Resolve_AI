from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from Backend.ai_analyzer import analyze_with_ai

from datetime import datetime, timezone, timedelta


# ==================================================
# APPLICATION
# ==================================================

app = FastAPI(
    title="ResolveAI API",
    description="AI-Powered IT Incident Resolution Agent",
    version="1.0.0"
)


# ==================================================
# CORS
# ==================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================================================
# TEMPORARY TICKET STORAGE
# ==================================================

tickets = {}


# ==================================================
# INCIDENT REQUEST MODEL
# ==================================================

class Incident(BaseModel):
    title: str
    description: str


# ==================================================
# ROOT ENDPOINT
# ==================================================

@app.get("/")
def root():
    return {
        "message": "ResolveAI API is running",
        "status": "online"
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
# GENERATE TICKET ID
# ==================================================

def generate_ticket_id():

    now = datetime.now()

    return (
        f"INC-{now.year}-"
        f"{now.strftime('%m%d%H%M%S%f')}"
    )


# ==================================================
# CALCULATE CURRENT TICKET STATUS
# ==================================================

def get_current_status(ticket):

    current_status = ticket.get("status", "Open")

    # --------------------------------------------------
    # CLOSED TICKETS MUST ALWAYS STAY CLOSED
    # --------------------------------------------------

    if current_status == "Closed":
        return "Closed"


    # --------------------------------------------------
    # GET TICKET CREATION TIME
    # --------------------------------------------------

    created_at = ticket["created_at"]

    now = datetime.now(timezone.utc)

    age = now - created_at


    # --------------------------------------------------
    # ONE-HOUR RULE
    # --------------------------------------------------

    if age >= timedelta(seconds=30):

        return "In Progress"


    # --------------------------------------------------
    # LESS THAN ONE HOUR
    # --------------------------------------------------

    return "Open"


# ==================================================
# AI INCIDENT ANALYSIS
# ==================================================

@app.post("/analyze")
async def analyze_incident(incident: Incident):

    # --------------------------------------------------
    # GENERATE TICKET AUTOMATICALLY
    # --------------------------------------------------

    ticket_id = generate_ticket_id()


    # --------------------------------------------------
    # RECORD CREATION TIME
    # --------------------------------------------------

    created_at = datetime.now(timezone.utc)


    # --------------------------------------------------
    # SEND ONLY USER ISSUE TO GEMINI
    # --------------------------------------------------

    incident_data = {
        "title": incident.title,
        "description": incident.description
    }


    try:

        # ==================================================
        # AI ANALYSIS
        # ==================================================

        ai_result = analyze_with_ai(incident_data)


        # ==================================================
        # CREATE TICKET
        # ==================================================

        tickets[ticket_id] = {

            "created_at": created_at,

            "status": "Open",

            "category": ai_result.get("category"),

            "priority": ai_result.get("priority"),

            "root_cause": ai_result.get("root_cause"),

            "resolution": ai_result.get("resolution"),

            "title": incident.title,

            "description": incident.description
        }


        # ==================================================
        # RETURN RESULT TO FRONTEND
        # ==================================================

        return {

            "ticket_id": ticket_id,

            "category": ai_result.get("category"),

            "priority": ai_result.get("priority"),

            "root_cause": ai_result.get("root_cause"),

            "resolution": ai_result.get("resolution"),

            "status": "Open",

            "created_at": created_at.isoformat()
        }


    except Exception as e:

        error_message = str(e).lower()


        # ==================================================
        # GEMINI QUOTA / RATE LIMIT
        # ==================================================

        if (
            "429" in error_message
            or "quota" in error_message
            or "rate limit" in error_message
        ):

            tickets[ticket_id] = {

                "created_at": created_at,

                "status": "Open",

                "category": "General IT Incident",

                "priority": "Medium",

                "root_cause": (
                    "AI analysis is temporarily unavailable "
                    "because the Gemini API quota has been exceeded."
                ),

                "resolution": (
                    "Please retry the AI analysis after the "
                    "Gemini API quota resets."
                ),

                "title": incident.title,

                "description": incident.description
            }


            return {

                "ticket_id": ticket_id,

                "category": "General IT Incident",

                "priority": "Medium",

                "root_cause": (
                    "AI analysis is temporarily unavailable "
                    "because the Gemini API quota has been exceeded."
                ),

                "resolution": (
                    "Please retry the AI analysis after the "
                    "Gemini API quota resets."
                ),

                "status": "Open",

                "created_at": created_at.isoformat()
            }


        # ==================================================
        # OTHER AI ERRORS
        # ==================================================

        raise HTTPException(
            status_code=500,
            detail=f"AI analysis failed: {str(e)}"
        )


# ==================================================
# USER CONFIRMS ISSUE IS RESOLVED
# ==================================================

@app.post("/tickets/{ticket_id}/resolve")
def resolve_ticket(ticket_id: str):

    if ticket_id not in tickets:

        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )


    ticket = tickets[ticket_id]


    # --------------------------------------------------
    # EXPLICIT USER CONFIRMATION
    # --------------------------------------------------

    ticket["status"] = "Closed"

    ticket["resolved_at"] = datetime.now(timezone.utc)


    return {

        "ticket_id": ticket_id,

        "status": "Closed",

        "message": (
            "Issue confirmed resolved. "
            "Ticket closed successfully."
        )
    }


# ==================================================
# USER SAYS ISSUE IS NOT RESOLVED
# ==================================================

@app.post("/tickets/{ticket_id}/keep-open")
def keep_ticket_open(ticket_id: str):

    if ticket_id not in tickets:

        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )


    ticket = tickets[ticket_id]


    # --------------------------------------------------
    # USER SAYS ISSUE IS STILL UNRESOLVED
    # --------------------------------------------------

    ticket["status"] = "Open"


    return {

        "ticket_id": ticket_id,

        "status": "Open",

        "message": (
            "Issue is still unresolved. "
            "Ticket remains open."
        )
    }


# ==================================================
# GET CURRENT TICKET STATUS
# ==================================================

@app.get("/tickets/{ticket_id}")
def get_ticket(ticket_id: str):

    if ticket_id not in tickets:

        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )


    ticket = tickets[ticket_id]


    # --------------------------------------------------
    # CALCULATE CURRENT STATUS
    # --------------------------------------------------

    current_status = get_current_status(ticket)


    # --------------------------------------------------
    # UPDATE STATUS
    # --------------------------------------------------

    if ticket["status"] != "Closed":

        ticket["status"] = current_status


    # --------------------------------------------------
    # RETURN COMPLETE TICKET
    # --------------------------------------------------

    return {

        "ticket_id": ticket_id,

        "title": ticket.get("title"),

        "description": ticket.get("description"),

        "category": ticket.get("category"),

        "priority": ticket.get("priority"),

        "root_cause": ticket.get("root_cause"),

        "resolution": ticket.get("resolution"),

        "status": ticket["status"],

        "created_at": ticket["created_at"].isoformat(),

        "resolved_at": (
            ticket["resolved_at"].isoformat()
            if ticket.get("resolved_at")
            else None
        )
    }