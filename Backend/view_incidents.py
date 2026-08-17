import sqlite3

DATABASE_NAME = "resolveai.db"


def view_incidents():
    connection = sqlite3.connect(DATABASE_NAME)
    cursor = connection.cursor()

    cursor.execute("""
        SELECT
            ticket_id,
            title,
            priority,
            status,
            category,
            created_at
        FROM incidents
        ORDER BY id DESC
    """)

    incidents = cursor.fetchall()

    connection.close()

    if not incidents:
        print("No incidents found.")
        return

    print("=" * 100)
    print("                    RESOLVEAI INCIDENT HISTORY")
    print("=" * 100)

    for incident in incidents:
        ticket_id, title, priority, status, category, created_at = incident

        print(f"""
Ticket ID : {ticket_id}
Title     : {title}
Priority  : {priority}
Status    : {status}
Category  : {category}
Created   : {created_at}
{"-" * 100}
""")


if __name__ == "__main__":
    view_incidents()