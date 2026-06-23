import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/ticket-details.css";
function TicketDetails() {
const navigate = useNavigate();
  const { id } = useParams();

  const [ticket, setTicket] = useState(null);
  const [notes, setNotes] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
const [agents, setAgents] = useState([]);
const role =
  localStorage.getItem("role");


 useEffect(() => {

  const token =
    localStorage.getItem("token");

  axios
    .get(
      `http://127.0.0.1:5000/api/ticket/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
    .then((response) => {

      setTicket(response.data);

      setNotes(
        response.data.notes || ""
      );

      setAssignedTo(
        response.data.assigned_to || ""
      );

    })
    .catch((error) => {

      console.error(error);

    });

  axios
    .get("http://127.0.0.1:5000/api/agents")
    .then((response) => {

      setAgents(response.data);

    })
    .catch((error) => {

      console.error(error);

    });

}, [id]);

  if (!ticket) {
    return <h2>Loading...</h2>;
  }

  let results = [];

  try {

    results = ticket?.probabilities
      ? JSON.parse(ticket.probabilities)
      : [];

  } catch {

    results = [];

  }

  const saveNotes = () => {

  const token =
    localStorage.getItem("token");

  axios
    .post(
      "http://127.0.0.1:5000/api/update_note",
      {
        ticket_id: ticket.id,
        note: notes
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
    .then(() => {

      alert("Notes saved successfully");

    })
    .catch((error) => {

      console.error(error);

    });

};

const assignTicket = () => {

  const token =
    localStorage.getItem("token");

  axios.post(
    "http://127.0.0.1:5000/api/assign_ticket",
    {
      ticket_id: ticket.id,
      assigned_to: assignedTo
    },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )
  .then(() => {

    alert("Ticket assigned successfully");

  })
  .catch((error) => {

    console.error(error);

  });

};

  return (

    <div className="container ticket-details-page">

      <div className="header">

        <div className="logo">
          🎫
        </div>

        <h1>Ticket Details</h1>

        <p className="subtitle">
          Support Ticket Analysis & Notes
        </p>

      </div>

      <div className="note-card">

  <div className="ticket-header">

    <h2>🎫 Ticket #{ticket.id}</h2>

    <span
      className={`status-badge status-${ticket.status
        .toLowerCase()
        .replace(" ", "-")}`}
    >
      {ticket.status}
    </span>

  </div>

  <div className="ticket-info-grid">

    <div className="info-box">
      <span className="info-label">
        Created On
      </span>

      <span className="info-value">
        {ticket.date_of_creation}
      </span>
    </div>

    <div className="info-box">
      <span className="info-label">
        Created By
      </span>

      <span className="info-value">
        {ticket.created_by || "Unknown"}
      </span>
    </div>

    <div className="info-box">
      <span className="info-label">
        Category
      </span>

      <span className="info-value">
        {ticket.category}
      </span>
    </div>

    <div className="info-box">
      <span className="info-label">
        Confidence
      </span>

      <span className="info-value">
        {ticket.confidence}%
      </span>
    </div>

    <div className="info-box">
      <span className="info-label">
        Priority
      </span>

      <span className="info-value">
        {ticket.priority}
      </span>
    </div>
    <div className="detail-row">

  <strong>
    Assigned At:
  </strong>

  <span>
    {ticket.assigned_at || "-"}
  </span>

</div>

<div className="detail-row">

  <strong>
    Resolved At:
  </strong>

  <span>
    {ticket.resolved_at || "-"}
  </span>

</div>

<div className="detail-row">

  <strong>
    Resolution Time:
  </strong>

  <span>
    {ticket.resolution_time}
  </span>

</div>

  </div>

  <div className="ticket-description">

    <h3>Ticket Description</h3>

    <p>
      {ticket.ticket_text}
    </p>

  </div>

{role === "admin" && (

  <div className="assign-section">

    <label>
      Assign Agent
    </label>

    <select
      value={assignedTo}
      onChange={(e) => {

        const selected =
          e.target.value;

        setAssignedTo(
          selected
        );

        const token =
          localStorage.getItem("token");

        axios.post(
          "http://127.0.0.1:5000/api/assign_ticket",
          {
            ticket_id: ticket.id,
            assigned_to: selected
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
        .then(() => {

          console.log(
            "Assignment saved"
          );

        })
        .catch((error) => {

          console.error(error);

        });

      }}
    >

      <option value="">
        Unassigned
      </option>

      {agents.map((agent) => (

        <option
          key={agent.username}
          value={agent.username}
        >
          {agent.username}
        </option>

      ))}

    </select>

  </div>

)}
</div>
      <div className="probability-card">

        <h2>📊 Category Probabilities</h2>

        {results.map((item, index) => (

          <div
            key={index}
            className="probability-row"
          >

            <div className="probability-label">
              {item.category}
            </div>

            <div className="progress-bar">

              <div
                className="progress-fill"
                style={{
                  width: `${item.percentage}%`
                }}
              />

            </div>

            <div className="probability-value">
              {item.percentage}%
            </div>

          </div>

        ))}

      </div>

      <div className="note-card">

        <h3>📝 Support Notes</h3>

        <textarea
          className="notes-textarea"
          placeholder="Add support notes here..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <button
          className="save-note-btn"
          onClick={saveNotes}
        >
          Save Notes
        </button>

      </div>
        <div>

        <button
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

      </div>

    </div>

  );

}

export default TicketDetails;
