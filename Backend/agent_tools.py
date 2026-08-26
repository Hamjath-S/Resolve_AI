# ==================================================
# RESOLVEAI AGENT TOOLS
# ==================================================

from Rag.rag_pipeline import run_rag_pipeline

from Backend.database import (
    get_incident,
    get_all_incidents
)

from sentence_transformers import SentenceTransformer

import numpy as np


# ==================================================
# EMBEDDING MODEL
# ==================================================

print("\nLoading incident memory embedding model...")

embedding_model = SentenceTransformer(
    "sentence-transformers/all-MiniLM-L6-v2"
)

print("Incident memory embedding model loaded.")


# ==================================================
# TOOL 1 — KNOWLEDGE SEARCH
# ==================================================

def knowledge_search(query, top_k=3):

    """
    Search the ResolveAI IT knowledge base.

    Input:
        query: IT incident or technical question

    Output:
        Relevant knowledge retrieved using RAG.
    """

    print("\n==========================================")
    print("KNOWLEDGE SEARCH TOOL")
    print("==========================================")

    print("\nQuery:")
    print(query)

    result = run_rag_pipeline(

        {
            "title": "Agent Knowledge Search",

            "description": query
        },

        top_k=top_k
    )

    knowledge = result.get(
        "retrieved_knowledge",
        []
    )

    print(
        f"\nRetrieved {len(knowledge)} knowledge chunks."
    )

    return knowledge


# ==================================================
# TOOL 2 — TICKET LOOKUP
# ==================================================

def ticket_lookup(ticket_id):

    """
    Retrieve a ResolveAI ticket from SQLite.

    Input:
        ticket_id: ResolveAI incident ticket ID

    Output:
        Complete ticket information.
    """

    print("\n==========================================")
    print("TICKET LOOKUP TOOL")
    print("==========================================")

    print("\nTicket ID:")
    print(ticket_id)

    ticket = get_incident(ticket_id)

    if ticket is None:

        print("\nTicket not found.")

        return {
            "found": False,

            "ticket_id": ticket_id,

            "message": "Ticket not found."
        }

    print("\nTicket found.")

    print(
        f"Title: {ticket.get('title')}"
    )

    print(
        f"Status: {ticket.get('status')}"
    )

    print(
        f"Priority: {ticket.get('priority')}"
    )

    print(
        f"Category: {ticket.get('category')}"
    )

    return {

        "found": True,

        "ticket": ticket
    }


# ==================================================
# HELPER — BUILD INCIDENT TEXT
# ==================================================

def build_incident_text(incident):

    """
    Convert an incident into text suitable
    for semantic similarity comparison.
    """

    title = incident.get(
        "title",
        ""
    )

    description = incident.get(
        "description",
        ""
    )

    category = incident.get(
        "category",
        ""
    )

    root_cause = incident.get(
        "root_cause",
        ""
    )

    return (
        f"Title: {title}\n"
        f"Description: {description}\n"
        f"Category: {category}\n"
        f"Root Cause: {root_cause}"
    )


# ==================================================
# HELPER — COSINE SIMILARITY
# ==================================================

def cosine_similarity(vector_a, vector_b):

    denominator = (
        np.linalg.norm(vector_a)
        *
        np.linalg.norm(vector_b)
    )

    if denominator == 0:

        return 0.0

    return float(
        np.dot(vector_a, vector_b)
        /
        denominator
    )


# ==================================================
# TOOL 3 — SIMILAR INCIDENT SEARCH
# ==================================================

def similar_incident_search(
    incident,
    top_k=3
):

    """
    Search previous ResolveAI incidents
    using semantic similarity.

    Input:
        incident:
            Dictionary containing title and description.

    Output:
        Most similar historical incidents.
    """

    print("\n==========================================")
    print("SIMILAR INCIDENT SEARCH TOOL")
    print("==========================================")

    # --------------------------------------------------
    # GET HISTORICAL INCIDENTS
    # --------------------------------------------------

    historical_incidents = get_all_incidents()

    print(
        f"\nHistorical incidents available: "
        f"{len(historical_incidents)}"
    )

    # --------------------------------------------------
    # NO HISTORY
    # --------------------------------------------------

    if not historical_incidents:

        print(
            "\nNo previous incidents available."
        )

        return []


    # --------------------------------------------------
    # BUILD CURRENT INCIDENT TEXT
    # --------------------------------------------------

    current_text = build_incident_text(
        incident
    )


    # --------------------------------------------------
    # CREATE CURRENT INCIDENT EMBEDDING
    # --------------------------------------------------

    current_embedding = embedding_model.encode(
        current_text
    )


    scored_incidents = []


    # --------------------------------------------------
    # COMPARE WITH HISTORICAL INCIDENTS
    # --------------------------------------------------

    for historical_incident in historical_incidents:

        historical_text = build_incident_text(
            historical_incident
        )

        historical_embedding = embedding_model.encode(
            historical_text
        )

        similarity = cosine_similarity(
            current_embedding,
            historical_embedding
        )

        scored_incidents.append(
            (
                similarity,
                historical_incident
            )
        )


    # --------------------------------------------------
    # SORT BY SIMILARITY
    # --------------------------------------------------

    scored_incidents.sort(
        key=lambda item: item[0],
        reverse=True
    )


    # --------------------------------------------------
    # SELECT TOP RESULTS
    # --------------------------------------------------

    results = []


    for similarity, incident_data in scored_incidents[:top_k]:

        results.append({

            "similarity": round(
                similarity,
                4
            ),

            "incident": incident_data
        })


    # --------------------------------------------------
    # DISPLAY RESULTS
    # --------------------------------------------------

    print(
        f"\nFound {len(results)} similar incidents."
    )


    for index, result in enumerate(
        results,
        start=1
    ):

        incident_data = result["incident"]

        print("\n------------------------------------------")

        print(
            f"Result #{index}"
        )

        print(
            f"Similarity: "
            f"{result['similarity']}"
        )

        print(
            f"Ticket ID: "
            f"{incident_data.get('ticket_id')}"
        )

        print(
            f"Title: "
            f"{incident_data.get('title')}"
        )

        print(
            f"Status: "
            f"{incident_data.get('status')}"
        )

        print(
            f"Priority: "
            f"{incident_data.get('priority')}"
        )


    return results


# ==================================================
# TEST ALL TOOLS
# ==================================================

if __name__ == "__main__":

    # ==================================================
    # TEST 1 — KNOWLEDGE SEARCH
    # ==================================================

    print("\n\n")
    print("##########################################")
    print("# TEST 1 — KNOWLEDGE SEARCH")
    print("##########################################")

    test_query = (
        "Users are unable to log in "
        "after deployment and receive HTTP 500."
    )

    knowledge_results = knowledge_search(
        test_query,
        top_k=3
    )

    print("\nKnowledge results:")

    for index, result in enumerate(
        knowledge_results,
        start=1
    ):

        print(
            f"\nResult #{index}"
        )

        print(
            f"Source: {result.get('source')}"
        )

        print(
            f"Chunk ID: {result.get('chunk_id')}"
        )


    # ==================================================
    # TEST 2 — TICKET LOOKUP
    # ==================================================

    print("\n\n")
    print("##########################################")
    print("# TEST 2 — TICKET LOOKUP")
    print("##########################################")

    print(
        "\nEnter an existing ticket ID."
    )

    test_ticket_id = input(
        "\nTicket ID: "
    ).strip()

    ticket_result = ticket_lookup(
        test_ticket_id
    )

    print("\nTicket lookup result:")

    print(
        ticket_result
    )


    # ==================================================
    # TEST 3 — SIMILAR INCIDENT SEARCH
    # ==================================================

    print("\n\n")
    print("##########################################")
    print("# TEST 3 — SIMILAR INCIDENT SEARCH")
    print("##########################################")

    test_incident = {

        "title": (
            "Users unable to authenticate "
            "after deployment"
        ),

        "description": (
            "Users cannot log in after the "
            "latest application deployment. "
            "The application returns HTTP 500."
        )
    }


    similar_results = similar_incident_search(

        test_incident,

        top_k=3
    )


    print("\n==========================================")
    print("SIMILAR INCIDENT RESULTS")
    print("==========================================")


    for index, result in enumerate(
        similar_results,
        start=1
    ):

        incident_data = result["incident"]

        print(
            f"\nResult #{index}"
        )

        print(
            f"Similarity: "
            f"{result['similarity']}"
        )

        print(
            f"Ticket ID: "
            f"{incident_data.get('ticket_id')}"
        )

        print(
            f"Title: "
            f"{incident_data.get('title')}"
        )

    print("\n==========================================")
    print("ALL AGENT TOOLS TEST COMPLETED")
    print("==========================================")