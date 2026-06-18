import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Dashboard() {

  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {

    const username =
  localStorage.getItem(
    "username"
  );

const role =
  localStorage.getItem(
    "role"
  );

axios.get(
  "http://127.0.0.1:5000/api/dashboard",
  {
    params: {
      username,
      role
    }
  }
)
      .then((response) => {

        setDashboard(response.data);

      })
      .catch((error) => {

        console.error(error);

      });

  }, []);
const username =
  localStorage.getItem(
    "username"
  );

const role =
  localStorage.getItem(
    "role"
  );
  if (!dashboard) {
    return <h2>Loading...</h2>;
  }

  return (

    <div className="container">

      <div className="header">

        <div className="logo">
          📊
        </div>

        <h1>Support Dashboard</h1>

        <p className="subtitle">
          Ticket Analysis & Management
        </p>

      </div>

      <div className="dashboard-actions">
      {role === "agent" && (

  <div className="result-card">

    <div className="result-header">

      <h2>
        👋 Welcome {username}
      </h2>

    </div>

    <p>

      Manage your assigned support tickets,
      update ticket status and add notes.

    </p>

    <Link to="/tickets">

      <button className="log-btn">

        📋 View My Tickets

      </button>

    </Link>

  </div>

)}
{role === "admin" && (

  <Link to="/tickets">

    <button className="log-btn">
      📋 View Ticket Storage
    </button>

  </Link>

)}

  <Link to="/">

    <button>
      Customer Portal
    </button>

  </Link>

  <button
    className="logout-btn"
    onClick={() => {

      const confirmLogout =
        window.confirm(
          "Are you sure you want to log out?"
        );

      if (confirmLogout) {

        localStorage.removeItem(
          "loggedIn"
        );

        localStorage.removeItem(
          "username"
        );

        window.location.href =
          "/login";

      }

    }}
  >
    🚪 Logout
  </button>

</div>
<div className="stats-grid">

  <div className="stat-card">

    <h3>
      {role === "admin"
        ? "Total Tickets"
        : "My Tickets"}
    </h3>

    <p>
      {dashboard.total_tickets}
    </p>

  </div>

  <div className="stat-card open-card">

    <h3>Open</h3>

    <p>
      {dashboard.open_count}
    </p>

  </div>

  <div className="stat-card progress-card">

    <h3>In Progress</h3>

    <p>
      {dashboard.progress_count}
    </p>

  </div>

  <div className="stat-card resolved-card">

    <h3>Resolved</h3>

    <p>
      {dashboard.resolved_count}
    </p>

  </div>

  <div className="stat-card closed-card">

    <h3>Closed</h3>

    <p>
      {dashboard.closed_count}
    </p>

  </div>

</div>
      {dashboard.latest_ticket && (

  <div className="result-card">

    <div className="result-header">
      <h2>🎯 Latest Prediction</h2>
    </div>

    <div className="ticket-box">

      <h3>Predicted Category</h3>

      <span className="prediction-badge">
        {dashboard.latest_ticket.category}
      </span>

    </div>
    <div className="probability-card">

  <h2>
    📊 Category Probabilities
  </h2>

  {dashboard.results.map((item, index) => (

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
    <br />

    <p>

      <strong className="confidence-text">
        Confidence:
      </strong>

      {" "}
      {dashboard.latest_ticket.confidence}%

    </p>

    <br />

    <p>

      <strong>
        Priority:
      </strong>

      {" "}
      {dashboard.latest_ticket.priority}

    </p>

  </div>

)}
{dashboard.latest_ticket && (

  <div className="response-card">

    <h3>💡 Suggested Response</h3>

    <p>
      {dashboard.latest_ticket.response}
    </p>

  </div>

)}
<div className="result-card">

  <h2>

  {role === "admin"
    ? "📁 Recent Tickets"
    : "📁 My Recent Tickets"}

</h2>
  <table className="ticket-table">

    <thead>

      <tr>

        <th>ID</th>
        <th>Created</th>
        <th>Category</th>
        <th>Priority</th>
        <th>Confidence</th>
        <th>Status</th>
        <th>Notes</th>

      </tr>

    </thead>

    <tbody>

      {dashboard.tickets.map((ticket) => (

        <tr key={ticket.id}>

          <td>{ticket.id}</td>

          <td>
            {ticket.date_of_creation || "-"}
          </td>

          <td>{ticket.category}</td>

          <td>{ticket.priority}</td>

          <td>{ticket.confidence}%</td>

          <td>{ticket.status}</td>

          <td>

            <Link
              to={`/ticket/${ticket.id}`}
            >
              <button className="note-btn">
                📝 View
              </button>
            </Link>

          </td>

        </tr>

      ))}

    </tbody>

  </table>

</div>

    </div>

  );

}

export default Dashboard;