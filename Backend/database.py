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

    connection = sqlite3.connect(
        DATABASE_NAME
    )

    connection.row_factory = sqlite3.Row

    # Enable foreign key support
    connection.execute(
        "PRAGMA foreign_keys = ON"
    )

    return connection


# ==================================================
# CREATE DATABASE
# ==================================================

def create_database():

    connection = get_connection()
    cursor = connection.cursor()

    # ==================================================
    # INCIDENTS TABLE
    # ==================================================

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

            resolved_at TEXT,

            created_by INTEGER

        )
    """)


    # ==================================================
    # USERS TABLE
    # ==================================================

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            username TEXT UNIQUE NOT NULL,

            email TEXT UNIQUE NOT NULL,

            password_hash TEXT NOT NULL,

            role TEXT NOT NULL DEFAULT 'USER',

            created_at TEXT NOT NULL

        )
    """)


    # ==================================================
    # ATTACHMENTS TABLE
    # ==================================================

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS attachments (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            ticket_id TEXT NOT NULL,

            filename TEXT NOT NULL,

            stored_filename TEXT NOT NULL,

            file_path TEXT NOT NULL,

            uploaded_at TEXT NOT NULL,

            FOREIGN KEY (ticket_id)
                REFERENCES incidents(ticket_id)
                ON DELETE CASCADE

        )
    """)


    # ==================================================
    # JWT REVOKED TOKENS TABLE
    # ==================================================

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS revoked_tokens (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            token TEXT UNIQUE NOT NULL,

            revoked_at TEXT NOT NULL

        )
    """)


    connection.commit()


    # ==================================================
    # DATABASE MIGRATION
    # ==================================================

    cursor.execute("""
        PRAGMA table_info(incidents)
    """)

    columns = [
        column["name"]
        for column in cursor.fetchall()
    ]


    # --------------------------------------------------
    # ADD resolved_at IF MISSING
    # --------------------------------------------------

    if "resolved_at" not in columns:

        cursor.execute("""
            ALTER TABLE incidents
            ADD COLUMN resolved_at TEXT
        """)


    # --------------------------------------------------
    # ADD created_at IF MISSING
    # --------------------------------------------------

    if "created_at" not in columns:

        cursor.execute("""
            ALTER TABLE incidents
            ADD COLUMN created_at TEXT
        """)


    # --------------------------------------------------
    # ADD created_by IF MISSING
    # --------------------------------------------------

    if "created_by" not in columns:

        cursor.execute("""
            ALTER TABLE incidents
            ADD COLUMN created_by INTEGER
        """)


    connection.commit()
    connection.close()


# ==================================================
# INCIDENT FUNCTIONS
# ==================================================


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
    created_at=None,
    created_by=None
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
            resolved_at,
            created_by

        )

        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

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

        None,

        created_by

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

    if (
        resolved_at is not None
        and hasattr(resolved_at, "isoformat")
    ):

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
    """, (

        ticket_id,

    ))


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


    return [
        dict(incident)
        for incident in incidents
    ]

# ==================================================
# GET INCIDENTS CREATED BY USER
# ==================================================

def get_incidents_by_user(user_id):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT *
        FROM incidents
        WHERE created_by = ?
        ORDER BY id DESC
    """, (
        user_id,
    ))

    incidents = cursor.fetchall()

    connection.close()

    return [
        dict(incident)
        for incident in incidents
    ]

# ==================================================
# DELETE INCIDENT
# ==================================================

def delete_incident(ticket_id):

    connection = get_connection()
    cursor = connection.cursor()


    cursor.execute("""
        DELETE FROM incidents
        WHERE ticket_id = ?
    """, (

        ticket_id,

    ))


    connection.commit()
    connection.close()


# ==================================================
# USER FUNCTIONS
# ==================================================


# ==================================================
# CREATE USER
# ==================================================

def create_user(
    username,
    email,
    password_hash,
    role="USER"
):

    connection = get_connection()
    cursor = connection.cursor()


    # --------------------------------------------------
    # NORMALIZE USER DATA
    # --------------------------------------------------

    username = username.strip()

    email = email.strip().lower()

    role = role.upper()


    # --------------------------------------------------
    # CREATION TIME
    # --------------------------------------------------

    created_at = datetime.now().isoformat()


    # --------------------------------------------------
    # INSERT USER
    # --------------------------------------------------

    cursor.execute("""
        INSERT INTO users (

            username,
            email,
            password_hash,
            role,
            created_at

        )

        VALUES (?, ?, ?, ?, ?)

    """, (

        username,

        email,

        password_hash,

        role,

        created_at

    ))


    user_id = cursor.lastrowid

    connection.commit()


    # --------------------------------------------------
    # GET CREATED USER
    # --------------------------------------------------

    cursor.execute("""
        SELECT *
        FROM users
        WHERE id = ?
    """, (

        user_id,

    ))


    user = cursor.fetchone()

    connection.close()


    if user is None:

        return None


    return dict(user)


# ==================================================
# GET USER BY ID
# ==================================================

def get_user_by_id(user_id):

    connection = get_connection()
    cursor = connection.cursor()


    cursor.execute("""
        SELECT *
        FROM users
        WHERE id = ?
    """, (

        user_id,

    ))


    user = cursor.fetchone()

    connection.close()


    if user is None:

        return None


    return dict(user)


# ==================================================
# GET USER BY EMAIL
# ==================================================

def get_user_by_email(email):

    connection = get_connection()
    cursor = connection.cursor()


    cursor.execute("""
        SELECT *
        FROM users
        WHERE email = ?
    """, (

        email.strip().lower(),

    ))


    user = cursor.fetchone()

    connection.close()


    if user is None:

        return None


    return dict(user)


# ==================================================
# GET USER BY USERNAME
# ==================================================

def get_user_by_username(username):

    connection = get_connection()
    cursor = connection.cursor()


    cursor.execute("""
        SELECT *
        FROM users
        WHERE username = ?
    """, (

        username.strip(),

    ))


    user = cursor.fetchone()

    connection.close()


    if user is None:

        return None


    return dict(user)


# ==================================================
# GET ALL USERS
# ==================================================

def get_all_users():

    connection = get_connection()
    cursor = connection.cursor()


    cursor.execute("""
        SELECT
            id,
            username,
            email,
            role,
            created_at

        FROM users

        ORDER BY id DESC
    """)


    users = cursor.fetchall()

    connection.close()


    return [
        dict(user)
        for user in users
    ]


# ==================================================
# UPDATE USER ROLE
# ==================================================

def update_user_role(
    user_id,
    role
):

    connection = get_connection()
    cursor = connection.cursor()


    role = role.upper()


    cursor.execute("""
        UPDATE users

        SET role = ?

        WHERE id = ?
    """, (

        role,

        user_id

    ))


    connection.commit()
    connection.close()


# ==================================================
# DELETE USER
# ==================================================

def delete_user(user_id):

    connection = get_connection()
    cursor = connection.cursor()


    cursor.execute("""
        DELETE FROM users
        WHERE id = ?
    """, (

        user_id,

    ))


    connection.commit()
    connection.close()


# ==================================================
# ATTACHMENT FUNCTIONS
# ==================================================


# ==================================================
# SAVE ATTACHMENT
# ==================================================

def save_attachment(
    ticket_id,
    filename,
    stored_filename,
    file_path,
    uploaded_at=None
):

    connection = get_connection()
    cursor = connection.cursor()


    if uploaded_at is None:

        uploaded_at = datetime.now().isoformat()

    elif hasattr(uploaded_at, "isoformat"):

        uploaded_at = uploaded_at.isoformat()


    cursor.execute("""
        INSERT INTO attachments (

            ticket_id,
            filename,
            stored_filename,
            file_path,
            uploaded_at

        )

        VALUES (?, ?, ?, ?, ?)

    """, (

        ticket_id,

        filename,

        stored_filename,

        file_path,

        uploaded_at

    ))


    attachment_id = cursor.lastrowid

    connection.commit()

    connection.close()


    return attachment_id


# ==================================================
# GET ATTACHMENTS FOR TICKET
# ==================================================

def get_ticket_attachments(ticket_id):

    connection = get_connection()
    cursor = connection.cursor()


    cursor.execute("""
        SELECT *

        FROM attachments

        WHERE ticket_id = ?

        ORDER BY id ASC

    """, (

        ticket_id,

    ))


    attachments = cursor.fetchall()

    connection.close()


    return [
        dict(attachment)
        for attachment in attachments
    ]


# ==================================================
# GET SINGLE ATTACHMENT
# ==================================================

def get_attachment(attachment_id):

    connection = get_connection()
    cursor = connection.cursor()


    cursor.execute("""
        SELECT *

        FROM attachments

        WHERE id = ?

    """, (

        attachment_id,

    ))


    attachment = cursor.fetchone()

    connection.close()


    if attachment is None:

        return None


    return dict(attachment)


# ==================================================
# DELETE ATTACHMENT
# ==================================================

def delete_attachment(attachment_id):

    connection = get_connection()
    cursor = connection.cursor()


    cursor.execute("""
        DELETE FROM attachments

        WHERE id = ?

    """, (

        attachment_id,

    ))


    connection.commit()
    connection.close()


# ==================================================
# JWT TOKEN FUNCTIONS
# ==================================================


# ==================================================
# REVOKE TOKEN
# ==================================================

def revoke_token(token):

    connection = get_connection()
    cursor = connection.cursor()


    cursor.execute("""
        INSERT OR IGNORE INTO revoked_tokens (

            token,
            revoked_at

        )

        VALUES (?, ?)

    """, (

        token,

        datetime.now().isoformat()

    ))


    connection.commit()
    connection.close()


# ==================================================
# CHECK IF TOKEN IS REVOKED
# ==================================================

def is_token_revoked(token):

    connection = get_connection()
    cursor = connection.cursor()


    cursor.execute("""
        SELECT id

        FROM revoked_tokens

        WHERE token = ?

        LIMIT 1

    """, (

        token,

    ))


    result = cursor.fetchone()

    connection.close()


    return result is not None


# ==================================================
# DATABASE INITIALIZATION
# ==================================================

if __name__ == "__main__":

    create_database()

    print(
        "ResolveAI database initialized successfully."
    )