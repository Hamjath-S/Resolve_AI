from pathlib import Path
import chromadb
from sentence_transformers import SentenceTransformer


# ==================================================
# CONFIGURATION
# ==================================================

CHROMA_PATH = Path(__file__).parent/"chroma_db"

COLLECTION_NAME = "resolveai_knowledge"

TOP_K = 3


# ==================================================
# LOAD EMBEDDING MODEL
# ==================================================

print("\nLoading embedding model...")

embedding_model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)

print("Embedding model loaded.")


# ==================================================
# CONNECT TO CHROMADB
# ==================================================

print("\nConnecting to ChromaDB...")

client = chromadb.PersistentClient(
    path=CHROMA_PATH
)

collection = client.get_collection(
    name=COLLECTION_NAME
)

print("Connected to ChromaDB.")

print(
    f"Knowledge chunks available: "
    f"{collection.count()}"
)


# ==================================================
# RETRIEVE RELEVANT KNOWLEDGE
# ==================================================

def retrieve_knowledge(query, top_k=TOP_K):

    # ----------------------------------------------
    # Convert query into embedding
    # ----------------------------------------------

    query_embedding = embedding_model.encode(
        query
    ).tolist()

    # ----------------------------------------------
    # Search ChromaDB
    # ----------------------------------------------

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k
    )

    # ----------------------------------------------
    # Prepare results
    # ----------------------------------------------

    knowledge_results = []

    documents = results.get(
        "documents",
        [[]]
    )[0]

    metadatas = results.get(
        "metadatas",
        [[]]
    )[0]

    distances = results.get(
        "distances",
        [[]]
    )[0]

    for document, metadata, distance in zip(
        documents,
        metadatas,
        distances
    ):

        knowledge_results.append({

            "source": metadata.get(
                "source",
                "unknown"
            ),

            "chunk_id": metadata.get(
                "chunk_id",
                "unknown"
            ),

            "text": document,

            "distance": distance
        })

    return knowledge_results


# ==================================================
# TEST RETRIEVER
# ==================================================

if __name__ == "__main__":

    query = """
    Users are unable to log in after today's deployment.
    The application returns HTTP 500.
    """

    print("\n")
    print("===================================")
    print("SEMANTIC SEARCH TEST")
    print("===================================")

    print("\nQuery:")
    print(query)

    results = retrieve_knowledge(query)

    print(
        f"\nFound {len(results)} relevant chunks."
    )

    for index, result in enumerate(
        results,
        start=1
    ):

        print("\n-----------------------------------")

        print(
            f"Result #{index}"
        )

        print(
            f"Source: {result['source']}"
        )

        print(
            f"Chunk ID: {result['chunk_id']}"
        )

        print(
            f"Distance: {result['distance']:.4f}"
        )

        print("\nKnowledge:")

        print(
            result["text"]
        )

    print("\n-----------------------------------")