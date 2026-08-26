from pathlib import Path


# ==================================================
# CONFIGURATION
# ==================================================

DOCUMENTS_DIR = Path(__file__).parent / "documents"

CHUNK_SIZE = 500
CHUNK_OVERLAP = 100


# ==================================================
# LOAD DOCUMENTS
# ==================================================

def load_documents():

    documents = []

    for file_path in DOCUMENTS_DIR.glob("*.md"):

        text = file_path.read_text(
            encoding="utf-8"
        )

        documents.append({
            "source": file_path.name,
            "text": text
        })

    return documents


# ==================================================
# SPLIT DOCUMENT INTO CHUNKS
# ==================================================

def split_into_chunks(text):

    chunks = []

    start = 0

    while start < len(text):

        end = start + CHUNK_SIZE

        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        start += CHUNK_SIZE - CHUNK_OVERLAP

    return chunks


# ==================================================
# CREATE KNOWLEDGE CHUNKS
# ==================================================

def create_knowledge_chunks():

    documents = load_documents()

    knowledge_chunks = []

    for document in documents:

        chunks = split_into_chunks(
            document["text"]
        )

        for index, chunk in enumerate(chunks):

            knowledge_chunks.append({

                "source": document["source"],

                "chunk_id": index,

                "text": chunk
            })

    return knowledge_chunks


# ==================================================
# TEST
# ==================================================

if __name__ == "__main__":

    chunks = create_knowledge_chunks()

    print(
        f"\nLoaded {len(chunks)} knowledge chunks.\n"
    )

    for chunk in chunks[:5]:

        print("-----------------------------------")

        print(
            f"Source: {chunk['source']}"
        )

        print(
            f"Chunk ID: {chunk['chunk_id']}"
        )

        print(
            chunk["text"]
        )

    print("-----------------------------------")