import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
function TicketDetails() {
const navigate = useNavigate();
  const { id } = useParams();

  const [ticket, setTicket] = useState(null);
  const [notes, setNotes] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
const [agents, setAgents] = useState([]);


 useEffect(() => {

  axios
    .get(`http://127.0.0.1:5000/api/ticket/${id}`)
    .then((response) => {

      setTicket(response.data);

      setNotes(
        response.data.notes || ""
      );

      setAssignedTo(
        response.data.assigned_to || ""
      );

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

  axios
    .post(
      "http://127.0.0.1:5000/api/update_note",
      {
        ticket_id: ticket.id,
        note: notes
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

  axios.post(
    "http://127.0.0.1:5000/api/assign_ticket",
    {
      ticket_id: ticket.id,
      assigned_to: assignedTo
    }
  )
  .then(() => {

    alert("Assignment saved");

  })
  .catch((error) => {

    console.error(error);

  });

};

  return (

    <div className="container">

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

        <h2>Ticket #{ticket.id}</h2>

        <p>
          <strong>Created:</strong> {ticket.date_of_creation}
        </p>
        <p>
           <strong>Created By:</strong>
           {ticket.created_by || "Unknown"}
        </p>

        <p>
          <strong>Ticket:</strong> {ticket.ticket_text}
        </p>

        <p>
          <strong>Category:</strong> {ticket.category}
        </p>

        <p>
          <strong>Confidence:</strong> {ticket.confidence}%
        </p>

        <p>
          <strong>Priority:</strong> {ticket.priority}
        </p>

        <p>
          <strong>Status:</strong> {ticket.status}
        </p>
        <div className="assign-section">

  <label>
    👤 Assigned To
  </label>

  <select
  className="status-dropdown"
  value={assignedTo}
  onChange={(e) => {

    const selected =
      e.target.value;

    setAssignedTo(
      selected
    );

    axios.post(
      "http://127.0.0.1:5000/api/assign_ticket",
      {
        ticket_id: ticket.id,
        assigned_to: selected
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