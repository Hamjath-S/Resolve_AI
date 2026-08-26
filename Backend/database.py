import sqlite3
from datetime import datetime


# ==================================================
# DATABASE CONFIGURATION
# ==================================================

DATABASE_NAME = "resolveai.db"


# ==================================================
# DATABASE CONNECTION
# ==================================================

def get_connection():
    connection = sqlite3.connect(DATABASE_NAME)
    connection.row_factory = sqlite3.Row
    return connection


# ==================================================
# CREATE DATABASE
# ==================================================

def create_database():

    connection = get_connection()
    cursor = connection.cursor()

    # --------------------------------------------------
    # CREATE INCIDENTS TABLE
    # --------------------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS incidents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ticket_id TEXT UNIQUE,
            title TEXT,
            description TEXT,
            priority TEXT,
            status TEXT,
            category TEXT,
            root_cause TEXT,
            resolution TEXT,
            created_at TEXT,
            resolved_at TEXT
        )
    """)

    connection.commit()

    # --------------------------------------------------
    # DATABASE MIGRATION
    # --------------------------------------------------
    # If the old table already exists without resolved_at,
    # add the missing column automatically.
    # --------------------------------------------------

    cursor.execute("PRAGMA table_info(incidents)")

    columns = [column["name"] for column in cursor.fetchall()]

    if "resolved_at" not in columns:

        cursor.execute("""
            ALTER TABLE incidents
            ADD COLUMN resolved_at TEXT
        """)

    if "created_at" not in columns:

        cursor.execute("""
            ALTER TABLE incidents
            ADD COLUMN created_at TEXT
        """)

    connection.commit()
    connection.close()


# ==================================================
# SAVE INCIDENT
# ==================================================

def save_incident(
    ticket_id,
    title,
    description,
    priority,
    status,
    category,
    root_cause,
    resolution,
    created_at=None
):

    connection = get_connection()
    cursor = connection.cursor()

    # --------------------------------------------------
    # USE PROVIDED CREATION TIME
    # --------------------------------------------------

    if created_at is None:
        created_at = datetime.now().isoformat()

    elif hasattr(created_at, "isoformat"):
        created_at = created_at.isoformat()

    # --------------------------------------------------
    # INSERT INCIDENT
    # --------------------------------------------------

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
            created_at,
            resolved_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        ticket_id,
        title,
        description,
        priority,
        status,
        category,
        root_cause,
        resolution,
        created_at,
        None
    ))

    connection.commit()
    connection.close()


# ==================================================
# UPDATE INCIDENT STATUS
# ==================================================

def update_incident_status(
    ticket_id,
    status,
    resolved_at=None
):

    connection = get_connection()
    cursor = connection.cursor()

    # --------------------------------------------------
    # CONVERT DATETIME TO STRING
    # --------------------------------------------------

    if resolved_at is not None and hasattr(resolved_at, "isoformat"):
        resolved_at = resolved_at.isoformat()

    # --------------------------------------------------
    # UPDATE STATUS
    # --------------------------------------------------

    cursor.execute("""
        UPDATE incidents
        SET
            status = ?,
            resolved_at = ?
        WHERE ticket_id = ?
    """, (
        status,
        resolved_at,
        ticket_id
    ))

    connection.commit()
    connection.close()


# ==================================================
# GET SINGLE INCIDENT
# ==================================================

def get_incident(ticket_id):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT *
        FROM incidents
        WHERE ticket_id = ?
    """, (ticket_id,))

    incident = cursor.fetchone()

    connection.close()

    if incident is None:
        return None

    return dict(incident)


# ==================================================
# GET ALL INCIDENTS
# ==================================================

def get_all_incidents():

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT *
        FROM incidents
        ORDER BY id DESC
    """)

    incidents = cursor.fetchall()

    connection.close()

    return [dict(incident) for incident in incidents]


# ==================================================
# DELETE INCIDENT
# ==================================================

def delete_incident(ticket_id):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        DELETE FROM incidents
        WHERE ticket_id = ?
    """, (ticket_id,))

    connection.commit()
    connection.close()