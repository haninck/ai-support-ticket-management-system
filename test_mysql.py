import mysql.connector

conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Panjara@123",
    database="support_ticket_db"
)

print("Connected Successfully!")

conn.close()
