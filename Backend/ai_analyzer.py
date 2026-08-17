import os
import json
from dotenv import load_dotenv
from google import genai


# ==================================================
# LOAD ENVIRONMENT VARIABLES
# ==================================================

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY not found in .env")


# ==================================================
# GEMINI CLIENT
# ==================================================

client = genai.Client(api_key=api_key)


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
    # Remove Markdown code fences
    # --------------------------------------------------

    if text.startswith("```json"):
        text = text[len("```json"):].strip()

    elif text.startswith("```"):
        text = text[len("```"):].strip()

    if text.endswith("```"):
        text = text[:-3].strip()

    # --------------------------------------------------
    # Try normal JSON first
    # --------------------------------------------------

    try:

        result = json.loads(text)

        if isinstance(result, dict):
            return result

    except json.JSONDecodeError:
        pass

    # --------------------------------------------------
    # Handle extra text / multiple JSON objects
    # --------------------------------------------------

    decoder = json.JSONDecoder()

    start = text.find("{")

    if start == -1:

        raise ValueError(
            "Gemini did not return a JSON object."
        )

    try:

        result, end = decoder.raw_decode(
            text[start:]
        )

    except json.JSONDecodeError as e:

        print("\n========== JSON PARSE ERROR ==========")
        print(text)
        print("======================================\n")

        raise ValueError(
            f"Gemini returned invalid JSON: {e}"
        )

    if not isinstance(result, dict):

        raise ValueError(
            "Gemini response is not a JSON object."
        )

    return result


# ==================================================
# AI INCIDENT ANALYZER
# ==================================================

def analyze_with_ai(incident):

    prompt = f"""
You are ResolveAI, an experienced IT Support Engineer
and AI-powered incident resolution agent.

Analyze the user's IT issue below.

USER ISSUE:

{json.dumps(incident, indent=2)}

Determine the appropriate IT incident information.

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

Possible categories include:

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

Priority MUST be exactly one of:

Low
Medium
High
Critical

Choose priority based only on the actual impact.

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

Be specific to the reported issue.

If the exact cause cannot be confirmed, clearly state
that it is a probable cause.

==================================================
RESOLUTION
==================================================

Provide practical step-by-step troubleshooting instructions.

The steps must directly address the reported issue.

==================================================
STATUS
==================================================

The status MUST ALWAYS be:

"Open"

Gemini must NEVER close the ticket.

Ticket closure is handled separately by ResolveAI
after the user explicitly confirms that the issue
has been resolved.

==================================================
IMPORTANT OUTPUT RULE
==================================================

Return ONLY ONE JSON OBJECT.

Do not return multiple JSON objects.

Do not return Markdown.

Do not use code fences.

Do not add explanations before or after the JSON.

Do not add extra fields.
"""


    try:

        # ==================================================
        # GEMINI REQUEST
        # ==================================================

        print("\n========== GEMINI REQUEST ==========")
        print("Incident:")
        print(json.dumps(incident, indent=2))
        print("====================================\n")


        response = client.models.generate_content(

            model="gemini-3.5-flash",

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
        # PARSE RESPONSE
        # ==================================================

        result = parse_gemini_json(
            response_text
        )


        # ==================================================
        # REQUIRED FIELDS
        # ==================================================

        required_fields = [
            "category",
            "priority",
            "root_cause",
            "resolution",
            "status"
        ]


        for field in required_fields:

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
                        f"Gemini returned an empty value for: {field}"
                    )


        # ==================================================
        # PRIORITY VALIDATION
        # ==================================================

        valid_priorities = [
            "Low",
            "Medium",
            "High",
            "Critical"
        ]


        if result["priority"] not in valid_priorities:

            raise ValueError(
                "Invalid priority returned by Gemini: "
                f"{result['priority']}"
            )


        # ==================================================
        # FORCE STATUS TO OPEN
        # ==================================================
        #
        # Gemini is NEVER allowed to determine ticket closure.
        #
        # Even if Gemini accidentally returns another status,
        # ResolveAI keeps the newly analyzed ticket Open.
        # ==================================================

        result["status"] = "Open"


        # ==================================================
        # FINAL RESULT
        # ==================================================

        print("\n========== VALIDATED GEMINI RESULT ==========")

        print(
            json.dumps(
                result,
                indent=2
            )
        )

        print("=============================================\n")


        return result


    # ==================================================
    # ERROR HANDLING
    # ==================================================

    except Exception as e:

        print("\n========== GEMINI ERROR ==========")

        print(
            "Error type:",
            type(e).__name__
        )

        print(
            "Error message:",
            str(e)
        )

        print("==================================\n")


        raise RuntimeError(
            f"Gemini API error: {str(e)}"
        )