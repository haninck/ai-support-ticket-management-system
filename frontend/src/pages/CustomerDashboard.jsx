import "./customer.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

function CustomerDashboard() {

  const navigate = useNavigate();

  const username =
    localStorage.getItem(
      "username"
    );

  const [tickets, setTickets] =
    useState([]);

  useEffect(() => {

    axios
      .get(
        `http://127.0.0.1:5000/api/customer_tickets?username=${username}`
      )
      .then((response) => {

        setTickets(
          response.data
        );

      })
      .catch((error) => {

        console.error(error);

      });

  }, [username]);

  return (

    <div className="customer-dashboard">

      <div className="dashboard-header">

        <h1>
          Welcome, {username}
        </h1>

        <p>
          Customer Support Portal
        </p>

      </div>

      <div className="action-section">

        <button
          className="submit-ticket-btn"
          onClick={() =>
            navigate("/")
          }
        >
          Submit New Ticket
        </button>

      </div>

      <div className="tickets-section">

        <h2>
          My Tickets
        </h2>

        {tickets.length === 0 ? (

          <div className="empty-state">

            No tickets found.

          </div>

        ) : (

          tickets.map((ticket) => (

            <div
              className="ticket-card"
              key={ticket.id}
            >

              <p>
                <strong>Ticket ID:</strong>
                {ticket.id}
              </p>

              <p>
                <strong>Ticket:</strong>
                {ticket.ticket_text}
              </p>

              <p>
                <strong>Created On:</strong>
                {ticket.date_of_creation}
              </p>

              <p>
                <strong>Assigned To:</strong>
                {ticket.assigned_to || "Unassigned"}
              </p>

              <p>
                <strong>Category:</strong>
                {ticket.category}
              </p>

              <p>
                <strong>Status:</strong>
                {ticket.status}
              </p>

              <button
                className="notes-btn"
                onClick={() =>
                  alert(
                    ticket.notes ||
                    "No notes available"
                  )
                }
              >
                View Notes
              </button>

            </div>

          ))

        )}

      </div>

    </div>

  );

}

export default CustomerDashboard;