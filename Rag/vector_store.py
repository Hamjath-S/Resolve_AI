import chromadb
from sentence_transformers import SentenceTransformer

from Rag.knowledge_loader import create_knowledge_chunks


# ==================================================
# CONFIGURATION
# ==================================================

COLLECTION_NAME = "resolveai_knowledge"

MODEL_NAME = "all-MiniLM-L6-v2"


# ==================================================
# LOAD EMBEDDING MODEL
# ==================================================

print("\nLoading embedding model...")

embedding_model = SentenceTransformer(
    MODEL_NAME
)

print("Embedding model loaded.")


# ==================================================
# CREATE CHROMA CLIENT
# ==================================================

client = chromadb.PersistentClient(
    path="./chroma_db"
)


# ==================================================
# CREATE / GET COLLECTION
# ==================================================

collection = client.get_or_create_collection(
    name=COLLECTION_NAME
)


# ==================================================
# ADD KNOWLEDGE TO VECTOR STORE
# ==================================================

def build_vector_store():

    print("\nLoading knowledge documents...")

    knowledge_chunks = create_knowledge_chunks()

    print(
        f"Found {len(knowledge_chunks)} knowledge chunks."
    )


    if not knowledge_chunks:

        raise ValueError(
            "No knowledge chunks found."
        )


    # --------------------------------------------------
    # Prepare data
    # --------------------------------------------------

    documents = []

    embeddings = []

    ids = []

    metadatas = []


    # --------------------------------------------------
    # Create embeddings
    # --------------------------------------------------

    for chunk in knowledge_chunks:

        text = chunk["text"]

        embedding = embedding_model.encode(
            text,
            normalize_embeddings=True
        )


        documents.append(text)

        embeddings.append(
            embedding.tolist()
        )

        ids.append(
            f"{chunk['source']}_{chunk['chunk_id']}"
        )

        metadatas.append({
            "source": chunk["source"],
            "chunk_id": str(chunk["chunk_id"])
        })


    # --------------------------------------------------
    # Store in ChromaDB
    # --------------------------------------------------

    collection.upsert(

        ids=ids,

        documents=documents,

        embeddings=embeddings,

        metadatas=metadatas
    )


    print("\nVector store created successfully.")

    print(
        f"Stored {len(documents)} chunks."
    )


# ==================================================
# TEST VECTOR STORE
# ==================================================

if __name__ == "__main__":

    build_vector_store()

    print("\nChromaDB is ready.")

    print(
        f"Collection: {COLLECTION_NAME}"
    )

    print(
        f"Total documents: "
        f"{collection.count()}"
    )