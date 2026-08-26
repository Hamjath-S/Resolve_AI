# ==================================================
# RESOLVEAI AI INCIDENT ANALYZER
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
# VALID VALUES
# ==================================================

VALID_PRIORITIES = [
    "Low",
    "Medium",
    "High",
    "Critical"
]


REQUIRED_FIELDS = [
    "category",
    "priority",
    "root_cause",
    "resolution",
    "status"
]


# ==================================================
# SAFE GEMINI JSON PARSER
# ==================================================

def parse_gemini_json(text):

    if not text:

        raise ValueError(
            "Gemini returned an empty response."
        )

    text = text.strip()


    print("\n========== RAW GEMINI RESPONSE ==========")
    print(text)
    print("=========================================\n")


    # --------------------------------------------------
    # Remove markdown code fences
    # --------------------------------------------------

    if text.startswith("```json"):

        text = text[len("```json"):].strip()

    elif text.startswith("```"):

        text = text[len("```"):].strip()


    if text.endswith("```"):

        text = text[:-3].strip()


    # --------------------------------------------------
    # Normal JSON
    # --------------------------------------------------

    try:

        result = json.loads(text)

        if isinstance(result, dict):

            return result

    except json.JSONDecodeError:

        pass


    # --------------------------------------------------
    # Search for JSON object inside extra text
    # --------------------------------------------------

    decoder = json.JSONDecoder()

    start = text.find("{")


    if start == -1:

        raise ValueError(
            "Gemini did not return a JSON object."
        )


    try:

        result, _ = decoder.raw_decode(
            text[start:]
        )

    except json.JSONDecodeError as e:

        raise ValueError(
            f"Gemini returned invalid JSON: {e}"
        )


    if not isinstance(result, dict):

        raise ValueError(
            "Gemini response is not a JSON object."
        )


    return result


# ==================================================
# VALIDATE AI RESULT
# ==================================================

def validate_ai_result(result):

    if not isinstance(result, dict):

        raise ValueError(
            "AI result must be a JSON object."
        )


    # --------------------------------------------------
    # Required fields
    # --------------------------------------------------

    for field in REQUIRED_FIELDS:

        if field not in result:

            raise ValueError(
                f"Gemini response missing field: {field}"
            )


        if result[field] is None:

            raise ValueError(
                f"Gemini returned null for: {field}"
            )


        if isinstance(result[field], str):

            if not result[field].strip():

                raise ValueError(
                    f"Gemini returned empty value for: {field}"
                )


    # --------------------------------------------------
    # Priority
    # --------------------------------------------------

    if result["priority"] not in VALID_PRIORITIES:

        raise ValueError(
            "Invalid priority returned by Gemini: "
            f"{result['priority']}"
        )


    # --------------------------------------------------
    # Status
    # --------------------------------------------------

    # Gemini is NEVER allowed to close the ticket.

    result["status"] = "Open"


    return result


# ==================================================
# EXTRACT SIMILAR INCIDENT EVIDENCE
# ==================================================

def extract_similar_incident_fallback(
    knowledge_context
):

    if not knowledge_context:

        return None


    try:

        # --------------------------------------------------
        # Try to extract Python-style dictionaries
        # from the retrieved context.
        # --------------------------------------------------

        import ast
        import re


        matches = re.findall(
            r"\{'similarity':.*?\}\s*(?=\n|$)",
            knowledge_context,
            re.DOTALL
        )


        incidents = []


        for match in matches:

            try:

                data = ast.literal_eval(
                    match.strip()
                )

                if isinstance(data, dict):

                    incidents.append(data)

            except Exception:

                continue


        if not incidents:

            return None


        # --------------------------------------------------
        # Select highest similarity incident
        # --------------------------------------------------

        incidents.sort(
            key=lambda x: x.get(
                "similarity",
                0
            ),
            reverse=True
        )


        best = incidents[0]

        incident = best.get(
            "incident",
            {}
        )


        if not isinstance(incident, dict):

            return None


        return {

            "category": incident.get(
                "category",
                "Application"
            ),

            "priority": incident.get(
                "priority",
                "Medium"
            ),

            "root_cause": incident.get(
                "root_cause",
                "Probable cause identified from a similar historical incident."
            ),

            "resolution": incident.get(
                "resolution",
                "Follow the troubleshooting procedure used for the similar historical incident."
            ),

            "status": "Open"

        }


    except Exception as e:

        print(
            "Fallback extraction error:",
            str(e)
        )

        return None


# ==================================================
# GENERATE KNOWLEDGE FALLBACK
# ==================================================

def generate_knowledge_fallback(
    incident,
    knowledge_context=None
):

    """
    Safe fallback used when Gemini is unavailable.

    It does NOT pretend that Gemini generated the result.

    It uses the strongest available evidence from
    ResolveAI's retrieved knowledge and historical incidents.
    """


    print("\n==========================================")
    print("RESOLVEAI FALLBACK ANALYZER")
    print("==========================================")

    print(
        "Gemini unavailable."
    )

    print(
        "Generating evidence-based fallback result."
    )


    # ==================================================
    # TRY HISTORICAL INCIDENT FIRST
    # ==================================================

    historical_result = (
        extract_similar_incident_fallback(
            knowledge_context
        )
    )


    if historical_result:

        print(
            "Fallback source: Similar historical incident"
        )


        return historical_result


    # ==================================================
    # GENERIC SAFE FALLBACK
    # ==================================================

    title = incident.get(
        "title",
        ""
    ).lower()


    description = incident.get(
        "description",
        ""
    ).lower()


    combined_text = (
        title
        + " "
        + description
    )


    # ==================================================
    # BASIC CATEGORY DETECTION
    # ==================================================

    category = "Application"


    if any(
        keyword in combined_text
        for keyword in [
            "login",
            "log in",
            "authentication",
            "password",
            "account"
        ]
    ):

        category = "Account Access"


    elif any(
        keyword in combined_text
        for keyword in [
            "network",
            "wifi",
            "internet",
            "connection",
            "dns"
        ]
    ):

        category = "Network"


    elif any(
        keyword in combined_text
        for keyword in [
            "email",
            "mail",
            "outlook"
        ]
    ):

        category = "Email"


    elif any(
        keyword in combined_text
        for keyword in [
            "database",
            "sql",
            "db"
        ]
    ):

        category = "Database"


    elif any(
        keyword in combined_text
        for keyword in [
            "slow",
            "performance",
            "cpu",
            "memory"
        ]
    ):

        category = "System Performance"


    # ==================================================
    # BASIC PRIORITY DETECTION
    # ==================================================

    priority = "Medium"


    if any(
        keyword in combined_text
        for keyword in [
            "all users",
            "everyone",
            "production down",
            "outage",
            "complete outage"
        ]
    ):

        priority = "Critical"


    elif any(
        keyword in combined_text
        for keyword in [
            "users unable",
            "many users",
            "production",
            "500 error",
            "server error"
        ]
    ):

        priority = "High"


    # ==================================================
    # ROOT CAUSE
    # ==================================================

    root_cause = (
        "Probable technical cause could not be confirmed "
        "because the Gemini AI analyzer was temporarily "
        "unavailable. Further investigation is required."
    )


    # ==================================================
    # RESOLUTION
    # ==================================================

    resolution = (
        "1. Review the affected application's logs.\n"
        "2. Identify the specific error or exception.\n"
        "3. Verify application configuration and environment variables.\n"
        "4. Check dependent services such as authentication "
        "and database connectivity.\n"
        "5. Review recent deployment changes.\n"
        "6. Roll back the deployment if a confirmed "
        "deployment-related failure is identified."
    )


    # ==================================================
    # FINAL FALLBACK
    # ==================================================

    return {

        "category": category,

        "priority": priority,

        "root_cause": root_cause,

        "resolution": resolution,

        "status": "Open"

    }


# ==================================================
# AI INCIDENT ANALYZER
# ==================================================

def analyze_with_ai(
    incident,
    knowledge_context=None
):


    # ==================================================
    # KNOWLEDGE SECTION
    # ==================================================

    if knowledge_context:

        knowledge_section = f"""
RELEVANT KNOWLEDGE FROM RESOLVEAI KNOWLEDGE BASE:

{knowledge_context}

==================================================
"""

    else:

        knowledge_section = """
NO RELEVANT KNOWLEDGE WAS FOUND.

Use general IT troubleshooting knowledge,
but clearly identify uncertain root causes.
"""


    # ==================================================
    # PROMPT
    # ==================================================

    prompt = f"""
You are ResolveAI, an experienced IT Support Engineer
and AI-powered incident resolution agent.

Analyze the user's IT issue below.

USER ISSUE:

{json.dumps(incident, indent=2)}

==================================================
KNOWLEDGE BASE
==================================================

{knowledge_section}

Use the relevant ResolveAI knowledge when determining
the root cause and resolution.

Do not blindly copy the knowledge.

Apply it to the actual user's incident.

If the knowledge does not completely explain the
incident, clearly state that the root cause is probable.

Return ONLY ONE JSON OBJECT.

The JSON must contain exactly these five fields:

{{
    "category": "incident category",
    "priority": "Low",
    "root_cause": "most likely technical cause",
    "resolution": "practical step-by-step solution",
    "status": "Open"
}}

==================================================
CATEGORY
==================================================

Choose the most appropriate category.

Possible categories:

Hardware
Software
Network
Account Access
Security
Email
System Performance
Application
Database
Operating System

==================================================
PRIORITY
==================================================

Priority MUST be exactly:

Low
Medium
High
Critical

Choose based on actual impact.

Low:
Minor issue with little or no user impact.

Medium:
Affects one or some users or a non-critical feature.

High:
Affects many users or an important business function.

Critical:
Complete production outage, major security incident,
major data loss, or business-critical system failure.

Do not automatically assign High or Critical.

==================================================
ROOT CAUSE
==================================================

Identify the most likely technical cause.

Use the knowledge base and historical incidents
when relevant.

If the exact cause cannot be confirmed,
clearly state that it is probable.

==================================================
RESOLUTION
==================================================

Provide practical step-by-step troubleshooting instructions.

The steps must directly address the reported issue.

==================================================
STATUS
==================================================

Status MUST ALWAYS be:

"Open"

Gemini must NEVER close the ticket.

==================================================
OUTPUT
==================================================

Return ONLY ONE JSON OBJECT.

Do not return Markdown.

Do not use code fences.

Do not add explanations.

Do not add extra fields.
"""


    # ==================================================
    # GEMINI REQUEST
    # ==================================================

    print("\n========== GEMINI REQUEST ==========")

    print("Incident:")

    print(
        json.dumps(
            incident,
            indent=2
        )
    )


    print("\nRAG Knowledge Context:")

    print(
        knowledge_context
        if knowledge_context
        else "No knowledge context."
    )

    print(
        "====================================\n"
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
                "Gemini returned no response."
            )


        response_text = response.text


        if not response_text:

            raise ValueError(
                "Gemini returned an empty response."
            )


        # ==================================================
        # PARSE
        # ==================================================

        result = parse_gemini_json(
            response_text
        )


        # ==================================================
        # VALIDATE
        # ==================================================

        result = validate_ai_result(
            result
        )


        # ==================================================
        # SUCCESS
        # ==================================================

        print(
            "\n========== VALIDATED GEMINI RESULT =========="
        )

        print(
            json.dumps(
                result,
                indent=2
            )
        )

        print(
            "=============================================\n"
        )


        return result


    # ==================================================
    # GEMINI QUOTA / RATE LIMIT
    # ==================================================

    except Exception as e:

        error_text = str(e)

        print(
            "\n========== GEMINI ERROR =========="
        )

        print(
            "Error type:",
            type(e).__name__
        )

        print(
            "Error message:",
            error_text
        )

        print(
            "==================================\n"
        )


        # --------------------------------------------------
        # Detect 429 quota/rate limit
        # --------------------------------------------------

        if (
            "429" in error_text
            or
            "RESOURCE_EXHAUSTED" in error_text
            or
            "quota" in error_text.lower()
        ):

            print(
                "\n=========================================="
            )

            print(
                "GEMINI QUOTA/RATE LIMIT DETECTED"
            )

            print(
                "Using ResolveAI evidence-based fallback."
            )

            print(
                "==========================================\n"
            )


            fallback_result = (
                generate_knowledge_fallback(
                    incident=incident,
                    knowledge_context=knowledge_context
                )
            )


            return fallback_result


        # --------------------------------------------------
        # Other Gemini errors
        # --------------------------------------------------

        print(
            "\nGemini analysis failed."
        )

        print(
            "Attempting safe fallback..."
        )


        fallback_result = (
            generate_knowledge_fallback(
                incident=incident,
                knowledge_context=knowledge_context
            )
        )


        return fallback_result