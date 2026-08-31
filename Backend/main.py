# ==================================================
# RESOLVEAI FASTAPI BACKEND
# ==================================================

from fastapi import (
    FastAPI, 
    HTTPException,
    Depends,
)    
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from Backend.agent import run_agent
from Backend.auth import (
    router as auth_router,
    get_current_user,
    require_admin,
)

from Backend.database import (
    create_database,
    save_incident,
    get_incident,
    update_incident_status,
    get_all_incidents,
    get_incidents_by_user,
    get_all_users,
)

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
# AUTHENTICATION ROUTES
# ==================================================

app.include_router(
    auth_router
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
# INITIALIZE DATABASE
# ==================================================

create_database()


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

    current_status = ticket.get(
        "status",
        "Open"
    )


    # --------------------------------------------------
    # CLOSED TICKETS MUST ALWAYS STAY CLOSED
    # --------------------------------------------------

    if current_status == "Closed":

        return "Closed"


    # --------------------------------------------------
    # GET CREATION TIME
    # --------------------------------------------------

    created_at = ticket.get(
        "created_at"
    )


    if not created_at:

        return "Open"


    try:

        # --------------------------------------------------
        # CONVERT STORED STRING TO DATETIME
        # --------------------------------------------------

        created_time = datetime.fromisoformat(
            created_at
        )


        # --------------------------------------------------
        # MAKE DATETIME TIMEZONE AWARE
        # --------------------------------------------------

        if created_time.tzinfo is None:

            created_time = created_time.replace(
                tzinfo=timezone.utc
            )


        # --------------------------------------------------
        # CURRENT UTC TIME
        # --------------------------------------------------

        now = datetime.now(
            timezone.utc
        )


        # --------------------------------------------------
        # CALCULATE TICKET AGE
        # --------------------------------------------------

        age = now - created_time


    except Exception:

        return current_status


    # ==================================================
    # 30-SECOND DEMO RULE
    # ==================================================

    if age >= timedelta(
        seconds=30
    ):

        return "In Progress"


    # ==================================================
    # LESS THAN 30 SECONDS
    # ==================================================

    return "Open"


# ==================================================
# AI AUTONOMOUS INCIDENT ANALYSIS
# ==================================================

@app.post("/analyze")
async def analyze_incident(
    incident: Incident,
    current_user: dict = Depends(get_current_user),
):

    # ==================================================
    # GENERATE TICKET ID
    # ==================================================

    ticket_id = generate_ticket_id()


    # ==================================================
    # RECORD CREATION TIME
    # ==================================================

    created_at = datetime.now(
        timezone.utc
    )


    # ==================================================
    # INCIDENT DATA
    # ==================================================

    incident_data = {

        "ticket_id":
            ticket_id,

        "title":
            incident.title.strip(),

        "description":
            incident.description.strip()

    }


    # ==================================================
    # VALIDATE INPUT
    # ==================================================

    if not incident_data["title"]:

        raise HTTPException(
            status_code=400,
            detail="Incident title is required."
        )


    if not incident_data["description"]:

        raise HTTPException(
            status_code=400,
            detail="Incident description is required."
        )


    try:

        # ==================================================
        # START AUTONOMOUS AGENT
        # ==================================================

        print("\n")
        print("==========================================")
        print("RESOLVEAI → AUTONOMOUS INCIDENT AGENT")
        print("==========================================")

        print(
            f"Ticket ID: {ticket_id}"
        )

        print(
            f"Title: {incident.title}"
        )

        print(
            "Starting autonomous incident analysis..."
        )

        print(
            "==========================================\n"
        )


        # ==================================================
        # RUN AUTONOMOUS AGENT
        # ==================================================

        agent_result = run_agent(

            incident=incident_data,

            top_k=3

        )


        # ==================================================
        # GET FINAL AI RESULT
        # ==================================================

        ai_result = agent_result.get(
            "ai_result",
            {}
        )


        # ==================================================
        # GET AUTONOMOUS EXECUTION TRACE
        # ==================================================

        execution_trace = agent_result.get(
            "execution_trace",
            []
        )


        # ==================================================
        # GET RETRIEVED EVIDENCE
        # ==================================================

        retrieved_knowledge = agent_result.get(
            "retrieved_knowledge",
            []
        )


        similar_incidents = agent_result.get(
            "similar_incidents",
            []
        )


        ticket_results = agent_result.get(
            "ticket_results",
            []
        )


        # ==================================================
        # EXTRACT CATEGORY
        # ==================================================

        category = ai_result.get(
            "category",
            "General IT Incident"
        )


        # ==================================================
        # EXTRACT PRIORITY
        # ==================================================

        priority = ai_result.get(
            "priority",
            "Medium"
        )


        # ==================================================
        # EXTRACT ROOT CAUSE
        # ==================================================

        root_cause = ai_result.get(
            "root_cause",
            "Unable to determine root cause."
        )


        # ==================================================
        # EXTRACT RESOLUTION
        # ==================================================

        resolution = ai_result.get(
            "resolution",
            "Please investigate the incident."
        )


        # ==================================================
        # INITIAL STATUS
        # ==================================================

        # New incidents should ALWAYS start as Open.

        status = "Open"


        # ==================================================
        # AGENT METADATA
        # ==================================================

        tools_used = agent_result.get(
            "tools_used",
            []
        )


        agent_steps = agent_result.get(
            "agent_steps",
            0
        )


        agent_status = agent_result.get(
            "agent_status",
            "completed"
        )


        # ==================================================
        # SAVE INCIDENT TO DATABASE
        # ==================================================

        save_incident(

            ticket_id=ticket_id,

            title=incident.title.strip(),

            description=incident.description.strip(),

            priority=priority,

            status=status,

            category=category,

            root_cause=root_cause,

            resolution=resolution,

            created_at=created_at.isoformat(),

            created_by=current_user["id"]

        )


        # ==================================================
        # LOG FINAL RESULT
        # ==================================================

        print("\n")
        print("==========================================")
        print("AUTONOMOUS AGENT RESULT")
        print("==========================================")

        print(
            f"Ticket ID: {ticket_id}"
        )

        print(
            f"Category: {category}"
        )

        print(
            f"Priority: {priority}"
        )

        print(
            f"Agent status: {agent_status}"
        )

        print(
            f"Agent steps: {agent_steps}"
        )

        print(
            f"Tools used: {tools_used}"
        )

        print(
            f"Execution events: "
            f"{len(execution_trace)}"
        )

        print(
            "==========================================\n"
        )


        # ==================================================
        # RETURN COMPLETE RESULT TO FRONTEND
        # ==================================================

        return {

            # ----------------------------------------------
            # INCIDENT INFORMATION
            # ----------------------------------------------

            "ticket_id":
                ticket_id,

            "title":
                incident.title.strip(),

            "description":
                incident.description.strip(),


            # ----------------------------------------------
            # AI ANALYSIS
            # ----------------------------------------------

            "category":
                category,

            "priority":
                priority,

            "root_cause":
                root_cause,

            "resolution":
                resolution,


            # ----------------------------------------------
            # TICKET STATUS
            # ----------------------------------------------

            "status":
                status,

            "created_at":
                created_at.isoformat(),


            # ----------------------------------------------
            # AUTONOMOUS AGENT INFORMATION
            # ----------------------------------------------

            "agent_status":
                agent_status,

            "agent_steps":
                agent_steps,

            "tools_used":
                tools_used,


            # ----------------------------------------------
            # REAL EXECUTION TRACE
            # ----------------------------------------------

            "execution_trace":
                execution_trace,


            # ----------------------------------------------
            # RETRIEVED EVIDENCE
            # ----------------------------------------------

            "retrieved_knowledge":
                retrieved_knowledge,

            "similar_incidents":
                similar_incidents,

            "ticket_results":
                ticket_results

        }


    except Exception as e:

        # ==================================================
        # ERROR LOG
        # ==================================================

        print("\n")
        print("==========================================")
        print("RESOLVEAI AUTONOMOUS AGENT ERROR")
        print("==========================================")

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


        # ==================================================
        # RETURN ERROR TO FRONTEND
        # ==================================================

        raise HTTPException(

            status_code=500,

            detail=(
                "Autonomous incident analysis failed: "
                f"{str(e)}"
            )

        )


# ==================================================
# CLOSE / RESOLVE TICKET
# ==================================================

@app.post("/tickets/{ticket_id}/resolve")
def resolve_ticket(
    ticket_id: str,
    current_user: dict = Depends(get_current_user),
):

    # ==================================================
    # FIND TICKET
    # ==================================================

    ticket = get_incident(
        ticket_id
    )


    if ticket is None:

        raise HTTPException(

            status_code=404,

            detail="Ticket not found"

        )
    # ==================================================
    # CHECK TICKET OWNERSHIP
    # ==================================================
    user_role = current_user.get(
        "role",
        "USER"
    ).upper()


    # --------------------------------------------------
    # USER → CAN RESOLVE ONLY THEIR OWN TICKET
    # ADMIN → CAN RESOLVE ANY TICKET
    # --------------------------------------------------
    if user_role != "ADMIN":
        if ticket.get("created_by") != current_user["id"]:
            raise HTTPException(
                status_code=403,
                detail="You do not have permission to modify this ticket."
            )

    # ==================================================
    # CHECK IF ALREADY CLOSED
    # ==================================================

    if ticket["status"] == "Closed":

        return {

            "ticket_id":
                ticket_id,

            "status":
                "Closed",

            "message":
                "Ticket is already closed."

        }


    # ==================================================
    # CLOSE TICKET
    # ==================================================

    resolved_at = datetime.now(
        timezone.utc
    ).isoformat()


    update_incident_status(

        ticket_id=ticket_id,

        status="Closed",

        resolved_at=resolved_at

    )


    # ==================================================
    # RESPONSE
    # ==================================================

    return {

        "ticket_id":
            ticket_id,

        "status":
            "Closed",

        "resolved_at":
            resolved_at,

        "message": (
            "Issue confirmed resolved. "
            "Ticket closed successfully."
        )

    }


# ==================================================
# KEEP TICKET OPEN
# ==================================================

@app.post("/tickets/{ticket_id}/keep-open")
def keep_ticket_open(
    ticket_id: str,
    current_user: dict = Depends(get_current_user),
):

    # ==================================================
    # FIND TICKET
    # ==================================================

    ticket = get_incident(
        ticket_id
    )


    if ticket is None:

        raise HTTPException(

            status_code=404,

            detail="Ticket not found"

        )

    # ==================================================
    # CHECK TICKET PERMISSION
    # ==================================================
    user_role = current_user.get(
        "role",
        "USER"
    ).upper()

    # --------------------------------------------------
    # USER → CAN KEEP ONLY THEIR OWN TICKET OPEN
    # ADMIN → CAN KEEP ANY TICKET OPEN
    # --------------------------------------------------
    if user_role != "ADMIN":
        if ticket.get("created_by") != current_user["id"]:
            raise HTTPException(
                status_code=403,
                detail="you do not have permission to modify this ticket."
            )
        
    # ==================================================
    # KEEP TICKET OPEN
    # ==================================================

    update_incident_status(

        ticket_id=ticket_id,

        status="Open",

        resolved_at=None

    )


    # ==================================================
    # RESPONSE
    # ==================================================

    return {

        "ticket_id":
            ticket_id,

        "status":
            "Open",

        "message": (
            "Issue is still unresolved. "
            "Ticket remains open."
        )

    }


# ==================================================
# GET SINGLE TICKET
# ==================================================

@app.get("/tickets/{ticket_id}")
def get_ticket(
    ticket_id: str,
    current_user: dict = Depends(get_current_user),
):

    # ==================================================
    # FIND TICKET
    # ==================================================

    ticket = get_incident(
        ticket_id
    )


    if ticket is None:

        raise HTTPException(

            status_code=404,

            detail="Ticket not found"

        )
    # ==================================================
    # CHECK TICKET OWNERSHIP
    # ==================================================
    user_role = current_user.get(
        "role",
        "USER"
    ).upper()

    # ==================================================
    # NORMAL USER -> OWN TICKETS ONLY
    # ==================================================
    if user_role != "ADMIN":
        if ticket.get("created_by") != current_user["id"]:
            raise HTTPException(
                status_code=403,
                detail="You do not have permission to view this ticket."
            )

    # ==================================================
    # CALCULATE CURRENT STATUS
    # ==================================================

    current_status = get_current_status(
        ticket
    )


    # ==================================================
    # UPDATE DATABASE IF STATUS CHANGED
    # ==================================================

    if ticket["status"] != current_status:

        update_incident_status(

            ticket_id=ticket_id,

            status=current_status,

            resolved_at=ticket.get(
                "resolved_at"
            )

        )


        ticket["status"] = current_status


    # ==================================================
    # RETURN COMPLETE TICKET
    # ==================================================

    return {

        "ticket_id":
            ticket["ticket_id"],

        "title":
            ticket["title"],

        "description":
            ticket["description"],

        "category":
            ticket["category"],

        "priority":
            ticket["priority"],

        "root_cause":
            ticket["root_cause"],

        "resolution":
            ticket["resolution"],

        "status":
            ticket["status"],

        "created_at":
            ticket["created_at"],

        "resolved_at":
            ticket["resolved_at"],

        "created_by":
            ticket.get("created_by")
            

    }


# ==================================================
# GET ALL TICKETS
# ==================================================

@app.get("/tickets")
def get_tickets(
    current_user: dict = Depends(get_current_user),
):
    
    # ==================================================
    # ADMIN → ALL TICKETS
    # USER → OWN TICKETS ONLY
    # ==================================================

    if current_user.get("role", "USER").upper() == "ADMIN":
        incidents = get_all_incidents()

    else:
        incidents = get_incidents_by_user(
            current_user["id"]
        )


    # ==================================================
    # UPDATE AUTOMATIC STATUSES
    # ==================================================

    for ticket in incidents:

        current_status = get_current_status(
            ticket
        )


        if ticket["status"] != current_status:

            update_incident_status(

                ticket_id=ticket["ticket_id"],

                status=current_status,

                resolved_at=ticket.get(
                    "resolved_at"
                )

            )


            ticket["status"] = current_status


    # ==================================================
    # RETURN ALL TICKETS
    # ==================================================

    return {

        "count":
            len(incidents),

        "tickets":
            incidents

    }

# ==================================================
# GET ALL USERS - ADMIN ONLY
# ==================================================
@app.get("/users")
def get_users(
    current_user: dict = Depends(require_admin),
 ):
    users = get_all_users()
    return {
        "count": len(users),
        "users": users
    }
