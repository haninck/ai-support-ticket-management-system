import mysql.connector
from flask import Flask, render_template, request, redirect
import json
import joblib
import csv
from flask import jsonify
from flask import Flask
from flask_cors import CORS
import pandas as pd
from flask import send_file
from datetime import timedelta
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity
     )
from werkzeug.security import (
    generate_password_hash,
    check_password_hash
)

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = (
    "support-ticket-management-system-secret-key-2026"
)
app.config[
    "JWT_ACCESS_TOKEN_EXPIRES"
] = timedelta(hours=1)
jwt = JWTManager(app)
@jwt.expired_token_loader
def expired_token_callback(
    jwt_header,
    jwt_payload
):

    return jsonify({

        "success": False,

        "message":
        "Session expired. Please login again."

    }), 401
CORS(app)
def get_db_connection():

    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="Panjara@123",
        database="support_ticket_db"
    )


model = joblib.load("ticket_model.pkl")
vectorizer = joblib.load("vectorizer.pkl")

priority_scores = {

 # Critical Issues
"server down": 5,
"website down": 5,
"service unavailable": 5,
"outage": 5,
"crash": 4,
"server crash": 5,
"database crash": 5,
"data loss": 5,
"breach": 5,
"hacked": 5,
"gateway timeout": 4,
"payment gateway down": 5,
"system failure": 5,
"production issue": 5,
"critical error": 5,
"security vulnerability": 5,
"ransomware": 5,
"unauthorized access": 5,
"api down": 5,
"database unavailable": 5,
"network outage": 5,
"service disruption": 5,
"server not responding" : 5,

# Medium Issues
"payment failed": 3,
"billing issue": 3,
"refund request": 3,
"login issue": 2,
"cannot login": 2,
"account locked": 2,
"password reset": 2,
"unable to access": 2,
"error message": 2,
"bug report": 2,
"slow performance": 2,
"feature request": 2,
"application error": 2,
"timeout error": 2,
"sync issue": 2,
"email not received": 2,
"verification failed": 2,
"authentication failed": 2,
"subscription issue": 3,
"payment processing": 3,
"user access issue": 2,
"page not loading": 2,
"connection issue": 2,
"configuration issue": 2,
"integration issue": 2,

# Low Priority
"help": 1,
"support": 1,
"question": 1,
"general": 1,
"information": 1,
"request": 1,
"enquiry": 1,
"feedback": 1,
"guidance": 1,
"documentation": 1,
"how to": 1,
"clarification": 1,
"suggestion": 1,
"training request": 1,
"demo request": 1,
"enhancement": 1,
"ui improvement": 1,
"cosmetic issue": 1

}


def get_priority(ticket):

    ticket_lower = ticket.lower()

    score = 0

    matched_keywords = []

    for keyword, points in priority_scores.items():

        if keyword in ticket_lower:

            score += points

            matched_keywords.append(keyword)

    print(
        "Priority Score:",
        score,
        "Matched:",
        matched_keywords
    )

    if score >= 7:

        return "High"

    elif score >= 3:

        return "Medium"

    return "Low"
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
def get_combined_guidance(
    primary_category,
    secondary_category
):

    guidance = {

        "Authentication": [
            "Verify user credentials",
            "Check account lock status",
            "Assist with password reset"
        ],

        "Account": [
            "Verify account status",
            "Review account settings",
            "Check user profile information"
        ],

        "Payment": [
            "Verify payment information",
            "Review billing records",
            "Check subscription status"
        ],

        "Technical": [
            "Review system logs",
            "Investigate application errors",
            "Verify service availability"
        ],

        "General": [
            "Gather additional information",
            "Review customer request"
        ]
    }

    actions = []

    actions.extend(
        guidance.get(
            primary_category,
            []
        )
    )

    actions.extend(
        guidance.get(
            secondary_category,
            []
        )
    )

    actions = list(
        dict.fromkeys(actions)
    )

    message = (
        f"This ticket appears to involve both "
        f"{primary_category} and "
        f"{secondary_category} issues.\n\n"
    )

    for action in actions:

        message += f"• {action}\n"

    return message
@app.route("/api/tickets")
@jwt_required()
def api_tickets():

    conn = get_db_connection()

    cursor = conn.cursor(
        dictionary=True
    )

    cursor.execute(
        """
        SELECT *
        FROM tickets
        ORDER BY id DESC
        """
    )

    tickets = cursor.fetchall()

    conn.close()

    return jsonify(tickets)

@app.route("/api/ticket/<int:ticket_id>")
@jwt_required()
def api_ticket(ticket_id):

    conn = get_db_connection()

    cursor = conn.cursor(
        dictionary=True
    )

    cursor.execute(
        """
        SELECT *
        FROM tickets
        WHERE id=%s
        """,
        (ticket_id,)
    )

    ticket = cursor.fetchone()

    conn.close()

    if ticket:

        if (
            ticket["assigned_at"] and
            ticket["resolved_at"]
        ):

            diff = (
                ticket["resolved_at"] -
                ticket["assigned_at"]
            )

            hours = int(
                diff.total_seconds() // 3600
            )

            minutes = int(
                (
                    diff.total_seconds() % 3600
                ) // 60
            )

            ticket[
                "resolution_time"
            ] = (
                f"{hours}h {minutes}m"
            )

        else:

            ticket[
                "resolution_time"
            ] = "-"

        return jsonify(ticket)

    return jsonify({
        "error":
        "Ticket not found"
    })
@app.route("/api/update_note", methods=["POST"])
@jwt_required()
def api_update_note():

    data = request.json

    ticket_id = data["ticket_id"]
    note = data["note"]

    conn = get_db_connection()

    cursor = conn.cursor()

    cursor.execute(
        """
        UPDATE tickets
        SET notes = %s
        WHERE id = %s
        """,
        (note, ticket_id)
    )

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Note updated successfully"
    })
from datetime import datetime

@app.route(
    "/api/update_status",
    methods=["POST"]
)
def api_update_status():

    data = request.json

    ticket_id = data["ticket_id"]
    status = data["status"]

    conn = get_db_connection()

    cursor = conn.cursor()

    if status == "Resolved":

        cursor.execute(
            """
            UPDATE tickets
            SET
                status=%s,
                resolved_at=%s
            WHERE id=%s
            """,
            (
                status,
                datetime.now(),
                ticket_id
            )
        )

    else:

        cursor.execute(
            """
            UPDATE tickets
            SET
                status=%s,
                resolved_at=NULL
            WHERE id=%s
            """,
            (
                status,
                ticket_id
            )
        )

    conn.commit()

    conn.close()

    return jsonify({
        "message":
        "Status updated successfully"
    })

@app.route("/api/dashboard")
@jwt_required()
def api_dashboard():

    username = request.args.get(
        "username"
    )

    role = request.args.get(
        "role"
    )

    conn = get_db_connection()

    cursor = conn.cursor(
        dictionary=True
    )

    if role == "admin":

        cursor.execute(
            """
            SELECT *
            FROM tickets
            ORDER BY id DESC
            LIMIT 5
            """
        )

        tickets = cursor.fetchall()

        cursor.execute(
            """
            SELECT COUNT(*) AS count
            FROM tickets
            """
        )
        total_tickets = cursor.fetchone()["count"]

        cursor.execute(
            """
            SELECT COUNT(*) AS count
            FROM tickets
            WHERE status='Open'
            """
        )
        open_count = cursor.fetchone()["count"]

        cursor.execute(
            """
            SELECT COUNT(*) AS count
            FROM tickets
            WHERE status='In Progress'
            """
        )
        progress_count = cursor.fetchone()["count"]

        cursor.execute(
            """
            SELECT COUNT(*) AS count
            FROM tickets
            WHERE status='Resolved'
            """
        )
        resolved_count = cursor.fetchone()["count"]

        cursor.execute(
            """
            SELECT COUNT(*) AS count
            FROM tickets
            WHERE status='Closed'
            """
        )
        closed_count = cursor.fetchone()["count"]

    else:

        cursor.execute(
            """
            SELECT *
            FROM tickets
            WHERE assigned_to=%s
            ORDER BY id DESC
            LIMIT 5
            """,
            (username,)
        )

        tickets = cursor.fetchall()

        cursor.execute(
            """
            SELECT COUNT(*) AS count
            FROM tickets
            WHERE assigned_to=%s
            """,
            (username,)
        )
        total_tickets = cursor.fetchone()["count"]

        cursor.execute(
            """
            SELECT COUNT(*) AS count
            FROM tickets
            WHERE assigned_to=%s
            AND status='Open'
            """,
            (username,)
        )
        open_count = cursor.fetchone()["count"]

        cursor.execute(
            """
            SELECT COUNT(*) AS count
            FROM tickets
            WHERE assigned_to=%s
            AND status='In Progress'
            """,
            (username,)
        )
        progress_count = cursor.fetchone()["count"]

        cursor.execute(
            """
            SELECT COUNT(*) AS count
            FROM tickets
            WHERE assigned_to=%s
            AND status='Resolved'
            """,
            (username,)
        )
        resolved_count = cursor.fetchone()["count"]

        cursor.execute(
            """
            SELECT COUNT(*) AS count
            FROM tickets
            WHERE assigned_to=%s
            AND status='Closed'
            """,
            (username,)
        )
        closed_count = cursor.fetchone()["count"]

    conn.close()

    latest_ticket = None

    if tickets:

        latest_ticket = tickets[0]

        latest_ticket["response"] = get_response(
            latest_ticket["category"]
        )

    results = []

    if (
        latest_ticket and
        latest_ticket["probabilities"]
    ):

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
@jwt_required()
def api_submit_ticket():

    from datetime import datetime

    data = request.get_json()

    ticket = data["ticket"]
    
    username = get_jwt_identity()

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

    print(results)

    primary_category = results[0]["category"]

    primary_confidence = results[0]["percentage"]

    primary_response = get_response(
        primary_category
    )
    combined_guidance = None

    secondary_category = None

    secondary_confidence = 0

    secondary_response = None

    if len(results) > 1:

        secondary_category = results[1]["category"]

        secondary_confidence = results[1]["percentage"]

        difference = (
            primary_confidence -
            secondary_confidence
        )

        if difference <= 25:

            secondary_response = get_response(
                secondary_category
            )

            combined_guidance = (
                get_combined_guidance(
                    primary_category,
                    secondary_category
                )
            )

        else:

            secondary_category = None

            secondary_confidence = 0
    

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

    conn = get_db_connection()

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
        date_of_creation,
        created_by
    )
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """,
(
        ticket,
        prediction[0],
        confidence,
        priority,
        "Open",
        probabilities_json,
        date_of_creation,
        username
    )
)

    conn.commit()

    ticket_id = cursor.lastrowid

    conn.close()

    return jsonify({
    "success": True,

    "ticket_id": ticket_id,

    "prediction": primary_category,

    "confidence": primary_confidence,

    "priority": priority,

    "response": primary_response,

    "primary_category":
        primary_category,

    "primary_confidence":
        primary_confidence,

    "secondary_category":
        secondary_category,

    "secondary_confidence":
        secondary_confidence,

    "secondary_response":
        secondary_response,
    
    "combined_guidance":
    combined_guidance,
    
    "results": results
})
    
@app.route("/api/check_status", methods=["POST"])
@jwt_required()
def api_check_status():

    data = request.get_json()

    ticket_id = data["ticket_id"]

    conn = get_db_connection()

    cursor = conn.cursor(
    dictionary=True
    )

    cursor.execute(
        "SELECT * FROM tickets WHERE id=%s",
        (ticket_id,)
    )

    ticket = cursor.fetchone()

    conn.close()

    if ticket:

        return jsonify(ticket)

    return jsonify({
        "error": "Ticket not found"
    })
@app.route("/api/add_to_dataset", methods=["POST"])
@jwt_required()
def api_add_to_dataset():

    data = request.get_json()

    ticket_id = data["ticket_id"]

    conn = get_db_connection()

    cursor = conn.cursor(
        dictionary=True
    )

    cursor.execute(
        "SELECT * FROM tickets WHERE id=%s",
        (ticket_id,)
    )

    ticket = cursor.fetchone()

    if not ticket:

        conn.close()

        return jsonify({
            "error": "Ticket not found"
        }), 404

    if ticket["added_to_dataset"] == "Yes":

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
             ticket["ticket_text"],
             ticket["category"],
             ticket["priority"]
        ])

    cursor.execute(
        """
        UPDATE tickets
        SET added_to_dataset=%s
        WHERE id=%s
        """,
        ("Yes", ticket_id)
    )

    conn.commit()

    conn.close()

    return jsonify({
        "success": True,
        "ticket_id": ticket_id
    })
    
@app.route(
    "/api/delete_selected",
    methods=["POST"]
)
@jwt_required()
def delete_selected():

    data = request.get_json()

    ticket_ids = data.get(
        "ticket_ids",
        []
    )

    if not ticket_ids:

        return jsonify({
            "success": False,
            "message": "No tickets selected"
        }), 400

    conn = get_db_connection()

    cursor = conn.cursor()

    placeholders = ",".join(
        ["%s"] * len(ticket_ids)
    )

    query = f"""
    DELETE FROM tickets
    WHERE id IN ({placeholders})
    """

    cursor.execute(
        query,
        ticket_ids
    )

    conn.commit()

    conn.close()

    return jsonify({
        "success": True
    })
@app.route("/api/export_excel")
@jwt_required()
def export_excel():

    conn = get_db_connection()

    df = pd.read_sql(
        "SELECT * FROM tickets",
        conn
    )

    conn.close()

    if "probabilities" in df.columns:
        df = df.drop(
            columns=["probabilities"]
        )

    file_name = "tickets.xlsx"

    df.to_excel(
        file_name,
        index=False
    )

    return send_file(
        file_name,
        as_attachment=True
    )
from werkzeug.security import (
    check_password_hash
)

@app.route(
    "/api/login",
    methods=["POST"]
)
def login():

    data = request.get_json()

    username = data["username"]
    password = data["password"]

    conn = get_db_connection()

    cursor = conn.cursor(
        dictionary=True
    )

    cursor.execute(
        """
        SELECT *
        FROM admin_users
        WHERE username=%s
        """,
        (username,)
    )

    user = cursor.fetchone()

    conn.close()

    if (
        user and
        check_password_hash(
            user["password"],
            password
        )
    ):

        token = create_access_token(
            identity=user["username"]
        )

        return jsonify({
            "success": True,
            "username": user["username"],
            "role": user["role"],
            "token": token
        })

    return jsonify({
        "success": False,
        "message": "Invalid credentials"
    })
from datetime import datetime

@app.route(
    "/api/assign_ticket",
    methods=["POST"]
)
@jwt_required()
def assign_ticket():

    username = get_jwt_identity()

    conn = get_db_connection()

    cursor = conn.cursor(
        dictionary=True
    )

    cursor.execute(
        """
        SELECT *
        FROM admin_users
        WHERE username=%s
        """,
        (username,)
    )

    user = cursor.fetchone()

    if not user or user["role"] != "admin":

        conn.close()

        return jsonify({
            "success": False,
            "message": "Unauthorized"
        }), 403

    data = request.get_json()

    ticket_id = data["ticket_id"]

    assigned_to = data["assigned_to"]

    cursor = conn.cursor()

    cursor.execute(
        """
        UPDATE tickets
        SET
            assigned_to=%s,
            assigned_at=%s
        WHERE id=%s
        """,
        (
            assigned_to,
            datetime.now(),
            ticket_id
        )
    )

    conn.commit()

    conn.close()

    return jsonify({
        "success": True
    })
@app.route("/api/agents")
def get_agents():

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT username
        FROM admin_users
        WHERE role='agent'
    """)

    agents = cursor.fetchall()

    conn.close()

    return jsonify(agents)
@app.route(
    "/api/customer_signup",
    methods=["POST"]
)
def customer_signup():

    data = request.get_json()

    username = data["username"]

    password = generate_password_hash(
        data["password"]
    )

    conn = get_db_connection()

    cursor = conn.cursor(
        dictionary=True
    )

    cursor.execute(
        """
        SELECT *
        FROM admin_users
        WHERE username=%s
        """,
        (username,)
    )

    existing = cursor.fetchone()

    if existing:

        conn.close()

        return jsonify({
            "success": False,
            "message": "Username already exists"
        })

    cursor.execute(
        """
        INSERT INTO admin_users
        (
            username,
            password,
            role
        )
        VALUES (%s,%s,%s)
        """,
        (
            username,
            password,
            "customer"
        )
    )

    conn.commit()

    conn.close()

    return jsonify({
        "success": True
    })
@app.route("/api/customer_tickets")
@jwt_required()
def customer_tickets():

    username = request.args.get(
        "username"
    )

    conn = get_db_connection()

    cursor = conn.cursor(
        dictionary=True
    )

    cursor.execute(
        """
        SELECT
            id,
            ticket_text,
            date_of_creation,
            assigned_to,
            category,
            status,
            notes
        FROM tickets
        WHERE created_by=%s
        ORDER BY id DESC
        """,
        (username,)
    )

    tickets = cursor.fetchall()

    conn.close()

    return jsonify(tickets)   
@app.route("/api/agent_analytics")
@jwt_required()
def agent_analytics():

    conn = get_db_connection()

    cursor = conn.cursor(
        dictionary=True
    )

    cursor.execute(
        """
        SELECT
            assigned_to,

            COUNT(*) AS total_assigned,

            SUM(
                CASE
                    WHEN status='Resolved'
                    THEN 1
                    ELSE 0
                END
            ) AS resolved_count,

            SUM(
                CASE
                    WHEN status='Open'
                    THEN 1
                    ELSE 0
                END
            ) AS open_count,

            SUM(
                CASE
                    WHEN status='In Progress'
                    THEN 1
                    ELSE 0
                END
            ) AS progress_count,

            SUM(
                CASE
                    WHEN status='Closed'
                    THEN 1
                    ELSE 0
                END
            ) AS closed_count

        FROM tickets

        WHERE assigned_to IS NOT NULL
        AND assigned_to <> ''

        GROUP BY assigned_to

        ORDER BY total_assigned DESC
        """
    )

    analytics = cursor.fetchall()

    for agent in analytics:

        cursor.execute(
            """
            SELECT
                assigned_at,
                resolved_at
            FROM tickets
            WHERE assigned_to=%s
            AND assigned_at IS NOT NULL
            AND resolved_at IS NOT NULL
            """,
            (
                agent["assigned_to"],
            )
        )

        resolved_tickets = (
            cursor.fetchall()
        )

        total_seconds = 0

        count = 0

        for ticket in resolved_tickets:

            diff = (
                ticket["resolved_at"]
                -
                ticket["assigned_at"]
            )

            total_seconds += (
                diff.total_seconds()
            )

            count += 1

        if count > 0:

            avg_seconds = (
                total_seconds
                /
                count
            )

            hours = int(
                avg_seconds // 3600
            )

            minutes = int(
                (
                    avg_seconds % 3600
                ) // 60
            )

            agent[
                "avg_resolution_time"
            ] = (
                f"{hours}h {minutes}m"
            )

        else:

            agent[
                "avg_resolution_time"
            ] = "-"

    conn.close()

    return jsonify(
        analytics
    )
@app.route("/api/home_stats")
def home_stats():

    conn = get_db_connection()

    cursor = conn.cursor(
        dictionary=True
    )

    # Total Tickets
    cursor.execute(
        """
        SELECT COUNT(*) AS count
        FROM tickets
        """
    )

    total_tickets = (
        cursor.fetchone()["count"]
    )

    # Resolved Tickets
    cursor.execute(
        """
        SELECT COUNT(*) AS count
        FROM tickets
        WHERE status='Resolved'
        """
    )

    resolved_tickets = (
        cursor.fetchone()["count"]
    )

    # Total Users
    cursor.execute(
        """
        SELECT COUNT(*) AS count
        FROM admin_users
        """
    )

    total_users = (
        cursor.fetchone()["count"]
    )

    # Total Agents
    cursor.execute(
        """
        SELECT COUNT(*) AS count
        FROM admin_users
        WHERE role='agent'
        """
    )

    total_agents = (
        cursor.fetchone()["count"]
    )

    # Resolution Rate
    resolution_rate = 0

    if total_tickets > 0:

        resolution_rate = round(
            (
                resolved_tickets /
                total_tickets
            ) * 100
        )

    # Average Resolution Time
    cursor.execute(
        """
        SELECT
            AVG(
                TIMESTAMPDIFF(
                    MINUTE,
                    assigned_at,
                    resolved_at
                )
            ) AS avg_minutes
        FROM tickets
        WHERE assigned_at IS NOT NULL
        AND resolved_at IS NOT NULL
        """
    )

    result = cursor.fetchone()

    avg_minutes = result["avg_minutes"]

    if avg_minutes is not None:

        avg_minutes = int(
            avg_minutes
        )

        hours = (
            avg_minutes // 60
        )

        minutes = (
            avg_minutes % 60
        )

        avg_resolution_time = (
            f"{hours}h {minutes}m"
        )

    else:

        avg_resolution_time = "-"

    conn.close()

    return jsonify({

        "total_tickets":
            total_tickets,

        "resolved_tickets":
            resolved_tickets,

        "total_users":
            total_users,

        "total_agents":
            total_agents,

        "resolution_rate":
            resolution_rate,

        "avg_resolution_time":
            avg_resolution_time

    })
if __name__ == "__main__":
    app.run(debug=True)













































