import sqlite3
from flask import Flask, render_template, request, redirect
import json
import joblib
import csv
from flask import jsonify
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)

CORS(app)
# Create database table if it doesn't exist
conn = sqlite3.connect("tickets.db")
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS tickets(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_text TEXT,
    category TEXT,
    confidence REAL,
    priority TEXT,
    status TEXT,
    probabilities TEXT
)
""")

conn.commit()
conn.close()

model = joblib.load("ticket_model.pkl")
vectorizer = joblib.load("vectorizer.pkl")

priority_keywords = {
    "High": [
        "down", "failure", "website down",
        "crash", "data loss", "breach",
        "server crash", "gateway"
    ],

    "Medium": [
        "payment failed", "unable to access",
        "refund request", "account issue",
        "slow performance", "login issue",
        "error message", "bug report",
        "feature request", "cannot login",
        "password reset", "account locked",
        "billing issue", "subscription problem"
    ],

    "Low": [
        "help", "support", "enquiry",
        "question", "general",
        "information", "request"
    ]
}

def get_priority(ticket):

    ticket_lower = ticket.lower()

    for priority, keywords in priority_keywords.items():

        for keyword in keywords:

            if keyword in ticket_lower:
                return priority

    return "Medium"

def get_response(category):

    responses = {

        "Authentication":
        "It seems you are facing an authentication issue. Please ensure that your username and password are correct. If you have forgotten your password, use the password reset option.",

        "Account":
        "It looks like you have an account-related issue. Please verify your account details and settings.",

        "Payment":
        "It appears you are experiencing a payment issue. Please verify your payment information and contact billing support if the issue persists.",

        "Technical":
        "It seems you are facing a technical issue. Please restart the application and try again. If the issue continues, provide more details.",

        "General":
        "Thank you for contacting us. Our support team will assist you shortly."
    }

    return responses.get(
        category,
        "Thank you for reaching out. We will get back to you shortly."
    )
@app.route("/api/tickets")
def api_tickets():

    conn = sqlite3.connect("tickets.db")
    conn.row_factory = sqlite3.Row

    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM tickets"
    )

    tickets = [
        dict(row)
        for row in cursor.fetchall()
    ]

    conn.close()

    return jsonify(tickets) 

@app.route("/api/ticket/<int:ticket_id>")
def api_ticket(ticket_id):

    conn = sqlite3.connect("tickets.db")
    conn.row_factory = sqlite3.Row

    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM tickets WHERE id=?",
        (ticket_id,)
    )

    ticket = cursor.fetchone()

    conn.close()

    if ticket:
        return jsonify(dict(ticket))

    return jsonify({"error": "Ticket not found"})


@app.route("/api/update_note", methods=["POST"])
def api_update_note():

    data = request.json

    ticket_id = data["ticket_id"]
    note = data["note"]

    conn = sqlite3.connect("tickets.db")

    cursor = conn.cursor()

    cursor.execute(
        """
        UPDATE tickets
        SET notes = ?
        WHERE id = ?
        """,
        (note, ticket_id)
    )

    conn.commit()

    conn.close()

    return jsonify({
        "message": "Note updated successfully"
    })
@app.route("/api/update_status", methods=["POST"])
def api_update_status():

    data = request.json
    
    


    ticket_id = data["ticket_id"]
    status = data["status"]

    conn = sqlite3.connect("tickets.db")
    cursor = conn.cursor()

    cursor.execute(
        """
        UPDATE tickets
        SET status = ?
        WHERE id = ?
        """,
        (status, ticket_id)
    )

    conn.commit()
    conn.close()

    return jsonify({
       "message": "Status updated successfully"

    })
@app.route("/api/dashboard")
def api_dashboard():

    conn = sqlite3.connect("tickets.db")
    conn.row_factory = sqlite3.Row

    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM tickets ORDER BY id DESC LIMIT 5"
    )

    tickets = [
        dict(row)
        for row in cursor.fetchall()
    ]

    total_tickets = len(
        tickets
    ) + (
        cursor.execute(
            "SELECT COUNT(*) FROM tickets"
        ).fetchone()[0]
        - len(tickets)
    )

    cursor.execute(
        "SELECT COUNT(*) FROM tickets WHERE status='Open'"
    )
    open_count = cursor.fetchone()[0]

    cursor.execute(
        "SELECT COUNT(*) FROM tickets WHERE status='In Progress'"
    )
    progress_count = cursor.fetchone()[0]

    cursor.execute(
        "SELECT COUNT(*) FROM tickets WHERE status='Resolved'"
    )
    resolved_count = cursor.fetchone()[0]

    cursor.execute(
        "SELECT COUNT(*) FROM tickets WHERE status='Closed'"
    )
    closed_count = cursor.fetchone()[0]

    conn.close()

    latest_ticket = None

    if tickets:

         latest_ticket = tickets[0]

         latest_ticket["response"] = get_response(
        latest_ticket["category"]
    )   
    results = []

    if latest_ticket and latest_ticket["probabilities"]:
        results = json.loads(
            latest_ticket["probabilities"]
        )

    return jsonify({
        "tickets": tickets,
        "results": results,
        "latest_ticket": latest_ticket,
        "total_tickets": total_tickets,
        "open_count": open_count,
        "progress_count": progress_count,
        "resolved_count": resolved_count,
        "closed_count": closed_count
    })
@app.route("/api/submit_ticket", methods=["POST"])
def api_submit_ticket():

    from datetime import datetime

    data = request.get_json()

    ticket = data["ticket"]

    date_of_creation = datetime.now().strftime(
        "%d-%m-%Y %H:%M"
    )

    transformed = vectorizer.transform([ticket])

    prediction = model.predict(transformed)

    response = get_response(
        prediction[0]
    )

    probabilities = model.predict_proba(
        transformed
    )

    categories = model.classes_

    results = []

    for category, prob in zip(
        categories,
        probabilities[0]
    ):

        results.append({
            "category": category,
            "percentage": round(
                prob * 100,
                2
            )
        })

    results = sorted(
        results,
        key=lambda x: x["percentage"],
        reverse=True
    )

    probabilities_json = json.dumps(
        results
    )

    confidence = round(
        max(probabilities[0]) * 100,
        2
    )

    priority = get_priority(
        ticket
    )

    conn = sqlite3.connect(
        "tickets.db"
    )

    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO tickets (
            ticket_text,
            category,
            confidence,
            priority,
            status,
            probabilities,
            date_of_creation
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            ticket,
            prediction[0],
            confidence,
            priority,
            "Open",
            probabilities_json,
            date_of_creation
        )
    )

    conn.commit()

    ticket_id = cursor.lastrowid

    conn.close()

    return jsonify({
        "success": True,
        "ticket_id": ticket_id,
        "prediction": prediction[0],
        "confidence": confidence,
        "priority": priority,
        "response": response,
        "results": results
    })
@app.route("/api/check_status", methods=["POST"])
def api_check_status():

    data = request.get_json()

    ticket_id = data["ticket_id"]

    conn = sqlite3.connect(
        "tickets.db"
    )

    conn.row_factory = sqlite3.Row

    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM tickets WHERE id=?",
        (ticket_id,)
    )

    ticket = cursor.fetchone()

    conn.close()

    if ticket:

        return jsonify(
            dict(ticket)
        )

    return jsonify({
        "error": "Ticket not found"
    })
@app.route("/api/add_to_dataset", methods=["POST"])
def api_add_to_dataset():

    data = request.get_json()

    ticket_id = data["ticket_id"]

    conn = sqlite3.connect("tickets.db")

    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM tickets WHERE id=?",
        (ticket_id,)
    )

    ticket = cursor.fetchone()

    if not ticket:

        conn.close()

        return jsonify({
            "error": "Ticket not found"
        }), 404

    if ticket[10] == "Yes":

        conn.close()

        return jsonify({
            "message": "Already added"
        })

    with open(
        "ticket.csv",
        "a",
        newline="",
        encoding="utf-8"
    ) as file:

        writer = csv.writer(file)

        writer.writerow([
            ticket[1],
            ticket[2]
        ])

    cursor.execute(
        """
        UPDATE tickets
        SET added_to_dataset='Yes'
        WHERE id=?
        """,
        (ticket_id,)
    )

    conn.commit()

    conn.close()

    return jsonify({
        "success": True,
        "ticket_id": ticket_id
    })
@app.route("/api/export_excel")
def export_excel():

    conn = sqlite3.connect("tickets.db")

    df = pd.read_sql_query(
        "SELECT * FROM tickets",
        conn
    )

    conn.close()

    file_name = "tickets.xlsx"

    df.to_excel(
        file_name,
        index=False
    )

    return send_file(
        file_name,
        as_attachment=True
    )
if __name__ == "__main__":
    app.run(debug=True)