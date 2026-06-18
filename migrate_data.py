import sqlite3
import mysql.connector

# SQLite connection
sqlite_conn = sqlite3.connect("tickets.db")
sqlite_cursor = sqlite_conn.cursor()

# MySQL connection
mysql_conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Panjara@123",
    database="support_ticket_db"
)

mysql_cursor = mysql_conn.cursor()

sqlite_cursor.execute(
    "SELECT * FROM tickets"
)

tickets = sqlite_cursor.fetchall()

for ticket in tickets:

    mysql_cursor.execute(
        """
        INSERT INTO tickets (
            id,
            ticket_text,
            category,
            confidence,
            priority,
            status,
            probabilities,
            notes,
            creation_date,
            date_of_creation,
            add_to_dataset,
            added_to_dataset
        )
        VALUES (
            %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s
        )
        """,
        ticket
    )

mysql_conn.commit()

print(
    f"{len(tickets)} tickets migrated successfully!"
)

sqlite_conn.close()
mysql_conn.close()