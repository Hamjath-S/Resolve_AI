import sqlite3
from datetime import datetime


DATABASE_NAME = "resolveai.db"


def create_database():
    connection = sqlite3.connect(DATABASE_NAME)
    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS incidents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ticket_id TEXT,
            title TEXT,
            description TEXT,
            priority TEXT,
            status TEXT,
            category TEXT,
            root_cause TEXT,
            resolution TEXT,
            created_at TEXT
        )
    """)

    connection.commit()
    connection.close()


def save_incident(
    ticket_id,
    title,
    description,
    priority,
    status,
    category,
    root_cause,
    resolution
):
    connection = sqlite3.connect(DATABASE_NAME)
    cursor = connection.cursor()

    cursor.execute("""
        INSERT INTO incidents (
            ticket_id,
            title,
            description,
            priority,
            status,
            category,
            root_cause,
            resolution,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        ticket_id,
        title,
        description,
        priority,
        status,
        category,
        root_cause,
        resolution,
        datetime.now().isoformat()
    ))

    connection.commit()
    connection.close()