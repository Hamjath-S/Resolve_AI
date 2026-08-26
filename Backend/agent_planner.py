# ==================================================
# RESOLVEAI AI AGENT PLANNER
# ==================================================

import os
import json

from dotenv import load_dotenv
from google import genai


# ==================================================
# LOAD ENVIRONMENT
# ==================================================

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError(
        "GEMINI_API_KEY not found in .env"
    )


# ==================================================
# GEMINI CLIENT
# ==================================================

client = genai.Client(
    api_key=api_key
)


# ==================================================
# VALID ACTIONS
# ==================================================

VALID_ACTIONS = [
    "knowledge_search",
    "similar_incident_search",
    "ticket_lookup",
    "finish"
]


# ==================================================
# SAFE JSON PARSER
# ==================================================

def parse_planner_response(text):

    if not text:

        raise ValueError(
            "Agent planner returned an empty response."
        )

    text = text.strip()


    # --------------------------------------------------
    # REMOVE MARKDOWN CODE FENCES
    # --------------------------------------------------

    if text.startswith("```json"):

        text = text[len("```json"):].strip()

    elif text.startswith("```"):

        text = text[len("```"):].strip()


    if text.endswith("```"):

        text = text[:-3].strip()


    # --------------------------------------------------
    # PARSE JSON
    # --------------------------------------------------

    try:

        result = json.loads(text)

    except json.JSONDecodeError as e:

        raise ValueError(
            f"Invalid planner JSON: {e}"
        )


    # --------------------------------------------------
    # VALIDATE OBJECT
    # --------------------------------------------------

    if not isinstance(result, dict):

        raise ValueError(
            "Planner response must be a JSON object."
        )


    return result


# ==================================================
# FALLBACK DECISION
# ==================================================

def fallback_decision(
    observations,
    available_tools
):

    """
    Decide what the agent should do when Gemini
    planner is temporarily unavailable.

    This prevents the autonomous agent from
    completely crashing because of an API
    quota/rate-limit problem.
    """

    used_tools = []


    # --------------------------------------------------
    # FIND TOOLS ALREADY USED
    # --------------------------------------------------

    for observation in observations:

        tool = observation.get(
            "tool"
        )

        if tool:

            used_tools.append(tool)


    # ==================================================
    # FALLBACK PRIORITY
    # ==================================================

    # If knowledge search has not happened,
    # use it first.

    if (
        "knowledge_search" in available_tools
        and "knowledge_search" not in used_tools
    ):

        return {

            "action": "knowledge_search",

            "reason": (
                "Gemini planner is temporarily unavailable. "
                "Fallback decision: search the ResolveAI "
                "knowledge base for technical evidence."
            )
        }


    # --------------------------------------------------
    # Similar incident search
    # --------------------------------------------------

    if (
        "similar_incident_search" in available_tools
        and "similar_incident_search" not in used_tools
    ):

        return {

            "action": "similar_incident_search",

            "reason": (
                "Gemini planner is temporarily unavailable. "
                "Fallback decision: search historical incidents "
                "for similar cases."
            )
        }


    # --------------------------------------------------
    # Ticket lookup
    # --------------------------------------------------

    if (
        "ticket_lookup" in available_tools
        and "ticket_lookup" not in used_tools
    ):

        return {

            "action": "ticket_lookup",

            "reason": (
                "Gemini planner is temporarily unavailable. "
                "Fallback decision: inspect the existing ticket."
            )
        }


    # ==================================================
    # FINISH
    # ==================================================

    return {

        "action": "finish",

        "reason": (
            "Gemini planner is temporarily unavailable, "
            "but the agent has already gathered the "
            "available evidence. Proceeding to final AI analysis."
        )
    }


# ==================================================
# AI AGENT PLANNER
# ==================================================

def plan_next_action(
    incident,
    observations=None,
    available_tools=None
):

    """
    Ask Gemini to decide what the ResolveAI
    autonomous agent should do next.

    If Gemini is unavailable because of quota,
    rate limits, or temporary API failure,
    a deterministic fallback decision is used.
    """

    if observations is None:

        observations = []


    if available_tools is None:

        available_tools = [
            "knowledge_search",
            "similar_incident_search",
            "ticket_lookup"
        ]


    # ==================================================
    # DETERMINE USED TOOLS
    # ==================================================

    tools_used = []

    for observation in observations:

        tool = observation.get(
            "tool"
        )

        if tool and tool not in tools_used:

            tools_used.append(
                tool
            )


    # ==================================================
    # DETERMINE REMAINING TOOLS
    # ==================================================

    tools_remaining = [

        tool

        for tool in available_tools

        if tool not in tools_used

    ]


    print("\n==========================================")

    print("AI AGENT PLANNER")

    print("==========================================")


    print("\nTools already used:")

    print(
        tools_used
    )


    print("\nTools remaining:")

    print(
        tools_remaining
    )


    # ==================================================
    # PREVENT UNNECESSARY REPEATED SEARCH
    # ==================================================

    # If the agent already has both major sources
    # of evidence, there is usually no reason to
    # ask Gemini for another search.

    if (
        "knowledge_search" in tools_used
        and "similar_incident_search" in tools_used
    ):

        print(
            "\nEnough evidence gathered."
        )

        print(
            "Planner decision: finish"
        )

        return {

            "action": "finish",

            "reason": (
                "Knowledge base evidence and historical "
                "incident evidence have already been gathered."
            )
        }


    # ==================================================
    # NO TOOLS REMAINING
    # ==================================================

    if not tools_remaining:

        print(
            "\nNo additional tools remain."
        )

        print(
            "Planner decision: finish"
        )

        return {

            "action": "finish",

            "reason": (
                "All available investigation tools "
                "have already been used."
            )
        }


    # ==================================================
    # BUILD OBSERVATION CONTEXT
    # ==================================================

    observation_text = json.dumps(
        observations,
        indent=2,
        default=str
    )


    # ==================================================
    # BUILD PROMPT
    # ==================================================

    prompt = f"""
You are the planning brain of ResolveAI,
an AI-powered IT incident resolution agent.

Your job is to decide what the agent should do NEXT.

==================================================
INCIDENT
==================================================

{json.dumps(incident, indent=2)}

==================================================
TOOLS AVAILABLE
==================================================

{json.dumps(tools_remaining, indent=2)}

==================================================
TOOLS ALREADY USED
==================================================

{json.dumps(tools_used, indent=2)}

==================================================
PREVIOUS OBSERVATIONS
==================================================

{observation_text}

==================================================
AVAILABLE ACTIONS
==================================================

You may choose exactly ONE:

knowledge_search
similar_incident_search
ticket_lookup
finish

==================================================
TOOL PURPOSES
==================================================

knowledge_search:

Use this when the agent needs technical knowledge
from the ResolveAI IT knowledge base.


similar_incident_search:

Use this when previous incidents could help identify
a similar problem or previous solution.


ticket_lookup:

Use this only when an existing ticket ID is available
and historical ticket information is required.


finish:

Use this when enough information has been gathered
and the incident can be sent for final diagnosis.

==================================================
DECISION RULES
==================================================

1. Do not choose a tool that has already been used
   unless there is a strong reason.

2. If technical troubleshooting knowledge is needed,
   choose knowledge_search.

3. If historical incidents could provide useful evidence,
   choose similar_incident_search.

4. Only choose ticket_lookup when a valid ticket ID
   exists.

5. If both knowledge-base evidence and historical
   incident evidence have already been gathered,
   choose finish.

6. Do not repeatedly call the same tool unnecessarily.

7. Never invent tool results.

8. The final diagnosis will be performed separately
   by ResolveAI's AI analyzer.

==================================================
OUTPUT
==================================================

Return ONLY ONE JSON OBJECT.

Required format:

{{
    "action": "knowledge_search",
    "reason": "brief explanation"
}}

The action MUST be exactly one of:

knowledge_search
similar_incident_search
ticket_lookup
finish

Do not add extra fields.
"""


    # ==================================================
    # GEMINI REQUEST
    # ==================================================

    print(
        "\nAsking Gemini to decide next action..."
    )


    try:

        response = client.models.generate_content(

            model="gemini-3.6-flash",

            contents=prompt,

            config={
                "response_mime_type": "application/json"
            }
        )


        # ==================================================
        # CHECK RESPONSE
        # ==================================================

        if not response:

            raise ValueError(
                "Planner received no response."
            )


        # ==================================================
        # PARSE RESPONSE
        # ==================================================

        result = parse_planner_response(
            response.text
        )


        # ==================================================
        # VALIDATE ACTION
        # ==================================================

        action = result.get(
            "action"
        )


        if action not in VALID_ACTIONS:

            raise ValueError(
                f"Invalid planner action: {action}"
            )


        # ==================================================
        # MAKE SURE ACTION IS AVAILABLE
        # ==================================================

        if (
            action != "finish"
            and action not in tools_remaining
        ):

            raise ValueError(
                f"Planner selected unavailable tool: {action}"
            )


        # ==================================================
        # REASON
        # ==================================================

        reason = result.get(
            "reason",
            "No reason provided."
        )


        # ==================================================
        # DISPLAY DECISION
        # ==================================================

        print(
            "\nAgent decision:"
        )

        print(
            f"Action: {action}"
        )

        print(
            f"Reason: {reason}"
        )


        print(
            "==========================================\n"
        )


        return {

            "action": action,

            "reason": reason
        }


    # ==================================================
    # GEMINI QUOTA / API ERROR
    # ==================================================

    except Exception as e:

        error_message = str(e)

        error_type = type(e).__name__


        print(
            "\n========== PLANNER ERROR =========="
        )

        print(
            "Error type:",
            error_type
        )

        print(
            "Error message:",
            error_message
        )


        # ==================================================
        # DETECT GEMINI 429
        # ==================================================

        is_quota_error = (

            "429" in error_message

            or

            "RESOURCE_EXHAUSTED"
            in error_message

            or

            "quota"
            in error_message.lower()

            or

            "rate limit"
            in error_message.lower()
        )


        if is_quota_error:

            print(
                "\nGemini quota/rate limit detected."
            )

            print(
                "Using deterministic agent fallback."
            )


            fallback = fallback_decision(

                observations=observations,

                available_tools=tools_remaining
            )


            print(
                "\nFallback agent decision:"
            )

            print(
                f"Action: {fallback['action']}"
            )

            print(
                f"Reason: {fallback['reason']}"
            )


            print(
                "==================================\n"
            )


            return fallback


        # ==================================================
        # OTHER TEMPORARY API ERRORS
        # ==================================================

        print(
            "\nGemini planner unavailable."
        )

        print(
            "Using safe fallback decision."
        )


        fallback = fallback_decision(

            observations=observations,

            available_tools=tools_remaining
        )


        print(
            "\nFallback agent decision:"
        )

        print(
            f"Action: {fallback['action']}"
        )

        print(
            f"Reason: {fallback['reason']}"
        )


        print(
            "==================================\n"
        )


        return fallback