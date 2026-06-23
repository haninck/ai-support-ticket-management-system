import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../styles/customer-portal.css";

function CustomerPortal() {
  const loggedIn =
  localStorage.getItem(
    "loggedIn"
  );
const role =
  localStorage.getItem("role");
const username =
  localStorage.getItem(
    "username"
  );
  const [ticket, setTicket] = useState("");

  const [ticketId, setTicketId] = useState(null);

  const [response, setResponse] = useState("");

  const [prediction, setPrediction] = useState("");

  const [confidence, setConfidence] = useState("");

  const [priority, setPriority] = useState("");

  const [results, setResults] = useState([]);

  const [statusTicketId, setStatusTicketId] = useState("");

  const [statusResult, setStatusResult] = useState(null);

  const [primaryCategory, setPrimaryCategory] =
  useState("");

const [primaryConfidence, setPrimaryConfidence] =
  useState("");

const [secondaryCategory, setSecondaryCategory] =
  useState("");

const [secondaryConfidence, setSecondaryConfidence] =
  useState("");

const [secondaryResponse, setSecondaryResponse] =
  useState("");

const [combinedGuidance,
  setCombinedGuidance] =
  useState("");
 

const submitTicket = () => {

  const token = localStorage.getItem("token");

  axios.post(
    "http://127.0.0.1:5000/api/submit_ticket",
    {
      ticket: ticket
    },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )
  .then((response) => {

    setTicketId(response.data.ticket_id);
    setPrediction(response.data.prediction);
    setConfidence(response.data.confidence);
    setPriority(response.data.priority);
    setResponse(response.data.response);
    setPrimaryCategory(response.data.primary_category);
    setPrimaryConfidence(response.data.primary_confidence);
    setSecondaryCategory(response.data.secondary_category);
    setSecondaryConfidence(response.data.secondary_confidence);
    setSecondaryResponse(response.data.secondary_response);
    setResults(response.data.results);
    setCombinedGuidance(response.data.combined_guidance);

  })
  .catch((error) => {
    console.error(error);
  });

};
  return (

    <div className="container customer-portal-page">

      <div className="header">

        <div className="logo">
          🎫
        </div>

        <h1>
          Smart Support Assistant
        </h1>

        <p className="subtitle">
          AI Powered Ticket Analysis
        </p>

      </div>

    

<div className="customer-portal-actions">

  {!loggedIn ? (

    <Link to="/login">

      <button className="portal-nav-btn">
        🛡️ Admin Portal
      </button>

    </Link>

  ) : role === "customer" ? (

    <Link to="/customer-dashboard">

      <button className="portal-nav-btn">
        👤 My Dashboard
      </button>

    </Link>

  ) : (

    <Link to="/dashboard">

      <button className="portal-nav-btn">
        📊 Dashboard
      </button>

    </Link>

  )}

</div>

      <div className="note-card">

        <h3>
          Describe Your Issue
        </h3>

        <textarea
          className="notes-textarea"
          placeholder="Enter your issue here..."
          value={ticket}
          onChange={(e) =>
            setTicket(e.target.value)
          }
        />

        <button
          className="submit-ticket-btn"
          onClick={submitTicket}
        >
          🚀 Analyze & Submit Ticket
        </button>

      </div>

      {ticketId && (

        <div className="result-card">

          <h3>
            ✅ Ticket Submitted
          </h3>

          <p>
            Ticket ID:
            <strong>
              {" "}
              {ticketId}
            </strong>
          </p>

        </div>

      )}

{prediction && (

  <div className="result-card">

    <h3>
      🎯 Analysis Result
    </h3>

    <p>

      <strong>
        Primary Category:
      </strong>

      {" "}

      {primaryCategory}

      {" "}

      ({primaryConfidence}%)

    </p>

    {secondaryCategory && (

      <p>

        <strong>
          Secondary Category:
        </strong>

        {" "}

        {secondaryCategory}

        {" "}

        ({secondaryConfidence}%)

      </p>

    )}

    <p>

      <strong>
        Priority:
      </strong>

      {" "}

      {priority}

    </p>

  </div>

)}

{!secondaryCategory && response && (

  <div className="response-card">

    <h3>
      💡 Suggested Response
    </h3>

    <p>
      {response}
    </p>

  </div>

)}

{secondaryCategory &&
 combinedGuidance && (

  <div className="response-card">

    <h3>
      🔀 Combined Guidance
    </h3>

    <p
      style={{
        whiteSpace:
          "pre-line"
      }}
    >
      {combinedGuidance}
    </p>

  </div>

)}

      {results.length > 0 && (

        <div className="probability-card">

          <h2>
            📊 Category Probabilities
          </h2>

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

      )}

      

        <br />
        <br />

      </div>

  );

}

export default CustomerPortal;