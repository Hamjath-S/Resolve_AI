from Rag.retriever import retrieve_knowledge
from Backend.ai_analyzer import analyze_with_ai


# ==================================================
# BUILD RAG CONTEXT
# ==================================================

def build_context(query, top_k=3):

    results = retrieve_knowledge(
        query,
        top_k=top_k
    )

    if not results:

        return "", []


    context_parts = []


    for index, result in enumerate(
        results,
        start=1
    ):

        context_parts.append(

            f"""
Knowledge Source {index}:
Source: {result['source']}
Chunk ID: {result['chunk_id']}

{result['text']}
"""
        )


    context = "\n".join(
        context_parts
    )


    return context, results


# ==================================================
# RAG PIPELINE
# ==================================================

def run_rag_pipeline(
    incident,
    top_k=3
):

    # --------------------------------------------------
    # Convert incident into searchable text
    # --------------------------------------------------

    query = f"""
    {incident.get("title", "")}

    {incident.get("description", "")}
    """


    # --------------------------------------------------
    # RETRIEVE KNOWLEDGE
    # --------------------------------------------------

    context, results = build_context(
        query,
        top_k=top_k
    )


    # --------------------------------------------------
    # SEND INCIDENT + KNOWLEDGE TO GEMINI
    # --------------------------------------------------

    ai_result = analyze_with_ai(
        incident,
        knowledge_context=context
    )


    # --------------------------------------------------
    # RETURN COMPLETE RAG RESULT
    # --------------------------------------------------

    return {

        "ai_result": ai_result,

        "retrieved_knowledge": results,

        "knowledge_context": context
    }


# ==================================================
# TEST COMPLETE RAG PIPELINE
# ==================================================

if __name__ == "__main__":

    incident = {

        "title": (
            "Users unable to log in after deployment"
        ),

        "description": (
            "Users are unable to log in after "
            "today's deployment. "
            "The application returns HTTP 500."
        )
    }


    print("\n")
    print("==========================================")
    print("COMPLETE RAG PIPELINE TEST")
    print("==========================================")


    result = run_rag_pipeline(
        incident,
        top_k=3
    )


    # --------------------------------------------------
    # DISPLAY RETRIEVED KNOWLEDGE
    # --------------------------------------------------

    print("\n")
    print("==========================================")
    print("RETRIEVED KNOWLEDGE")
    print("==========================================")


    for index, knowledge in enumerate(
        result["retrieved_knowledge"],
        start=1
    ):

        print(
            f"\nResult #{index}"
        )

        print(
            f"Source: {knowledge['source']}"
        )

        print(
            f"Chunk ID: {knowledge['chunk_id']}"
        )


    # --------------------------------------------------
    # DISPLAY AI RESULT
    # --------------------------------------------------

    print("\n")
    print("==========================================")
    print("RAG AI ANALYSIS")
    print("==========================================")


    print(
        result["ai_result"]
    )


    print("\n")
    print("==========================================")
    print("RAG PIPELINE COMPLETED")
    print("==========================================")