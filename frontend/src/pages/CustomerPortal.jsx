import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

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

    axios
      .post(
        "http://127.0.0.1:5000/api/submit_ticket",
        {
          ticket: ticket
        }
      )
      .then((response) => {

        setTicketId(
          response.data.ticket_id
        );

        setPrediction(
          response.data.prediction
        );

        setConfidence(
          response.data.confidence
        );

        setPriority(
          response.data.priority
        );

        setResponse(
          response.data.response
        );
        setPrimaryCategory(
         response.data.primary_category
        );

        setPrimaryConfidence(
          response.data.primary_confidence
        );

        setSecondaryCategory(
          response.data.secondary_category
        );

        setSecondaryConfidence(
          response.data.secondary_confidence
        );

        setSecondaryResponse(
          response.data.secondary_response
        );
        setResults(
          response.data.results
        );

        setCombinedGuidance(
  response.data.combined_guidance
);

      })
      .catch((error) => {

        console.error(error);

      });

  };

  const checkStatus = () => {

      axios
        .post(
          "http://127.0.0.1:5000/api/submit_ticket",
          {
            ticket: ticket,

            username:
              localStorage.getItem(
                "username"
              )
          }
        )
      .then((response) => {

        setStatusResult(
          response.data
        );

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

        <h1>
          Smart Support Assistant
        </h1>

        <p className="subtitle">
          AI Powered Ticket Analysis
        </p>

      </div>

    

<div className="dashboard-actions">

  {!loggedIn ? (

    <Link to="/login">

      <button className="log-btn">
        🛡️ Admin Portal
      </button>

    </Link>

  ) : role === "customer" ? (

    <Link to="/customer-dashboard">

      <button className="log-btn">
        👤 My Dashboard
      </button>

    </Link>

  ) : (

    <Link to="/dashboard">

      <button className="log-btn">
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

      <div className="note-card">

        <h3>
          🔍 Track Existing Ticket
        </h3>

        <input
          type="number"
          placeholder="Enter Ticket ID"
          value={statusTicketId}
          onChange={(e) =>
            setStatusTicketId(
              e.target.value
            )
          }
        />

        <br />
        <br />

        <button
          onClick={checkStatus}
        >
          Check Status
        </button>

      </div>

      {statusResult && (

        <div className="result-card">

          <h3>
            📋 Ticket Status
          </h3>

          <p>
            <strong>
              Ticket ID:
            </strong>
            {" "}
            {statusResult.id}
          </p>

          <p>
            <strong>
              Status:
            </strong>
            {" "}
            {statusResult.status}
          </p>

          <p>
            <strong>
              Notes:
            </strong>
            {" "}
            {statusResult.notes ||
             "No notes available"}
          </p>

        </div>

      )}

    </div>

  );

}

export default CustomerPortal;