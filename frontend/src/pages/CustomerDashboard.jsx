import "./customer.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";

// ---- status configuration -------------------------------------------------
// Centralizing this keeps the JSX clean and makes it trivial to add a new
// status (e.g. "Escalated") in one place later.
const STATUS_META = {
  open: { label: "Open", pulse: true },
  "in progress": { label: "In Progress", pulse: true },
  resolved: { label: "Resolved", pulse: false },
  closed: { label: "Closed", pulse: false },
};

const getStatusSlug = (status) => (status || "").trim().toLowerCase();

const formatDate = (value) => {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// ---- tiny inline icons (no external icon library required) ---------------
const IconLayers = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <path d="M12 3 2 8l10 5 10-5-10-5Z" />
    <path d="m2 13 10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconClock = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconSpark = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <path d="M12 4v5M12 15v5M4 12h5M15 12h5" strokeLinecap="round" />
  </svg>
);
const IconCheck = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <path d="m4 12 5 5 11-11" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconPlus = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
  </svg>
);
const IconLogout = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconInbox = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
    <path d="M3 13h4l2 3h6l2-3h4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5.5 6h13l2.5 7v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-7l2.5-7Z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconAlert = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
    <path d="M10.3 3.9 2.7 17a1.5 1.5 0 0 0 1.3 2.2h16a1.5 1.5 0 0 0 1.3-2.2L13.7 3.9a1.5 1.5 0 0 0-2.6 0Z" strokeLinejoin="round" />
  </svg>
);
const IconChevron = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function StatusPill({ status }) {
  const slug = getStatusSlug(status);
  const meta = STATUS_META[slug];
  return (
    <span className={`status-pill status-${slug.replace(/\s+/g, "-") || "unknown"}`}>
      {meta?.pulse && <span className="status-dot" aria-hidden="true" />}
      {status || "Unknown"}
    </span>
  );
}

function SkeletonCard({ delay }) {
  return (
    <div className="ticket-card skeleton-card" style={{ animationDelay: `${delay}ms` }} aria-hidden="true">
      <div className="skeleton-row">
        <span className="skeleton-block skeleton-block--id" />
        <span className="skeleton-block skeleton-block--pill" />
      </div>
      <span className="skeleton-block skeleton-block--line" />
      <span className="skeleton-block skeleton-block--line short" />
      <div className="skeleton-row skeleton-row--meta">
        <span className="skeleton-block skeleton-block--meta" />
        <span className="skeleton-block skeleton-block--meta" />
      </div>
    </div>
  );
}

function CustomerDashboard() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("loggedIn");
    navigate("/customer-login");
  }, [navigate]);

  const fetchTickets = useCallback(() => {
    const token = localStorage.getItem("token");
    setIsLoading(true);
    setError(null);

    axios
      .get(`http://127.0.0.1:5000/api/customer_tickets?username=${username}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setTickets(response.data || []);
      })
      .catch((err) => {
        console.error(err);
        setError("We couldn't load your tickets. Please try again.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [username]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Tallies tickets by status so the summary strip always reflects reality,
  // even if the backend introduces a status we haven't named explicitly.
  const counts = useMemo(() => {
    const tally = { open: 0, "in progress": 0, resolved: 0 };
    tickets.forEach((ticket) => {
      const slug = getStatusSlug(ticket.status);
      if (tally[slug] !== undefined) tally[slug] += 1;
    });
    return { ...tally, total: tickets.length };
  }, [tickets]);

  const heroMessage = useMemo(() => {
    if (isLoading) return "Checking on your tickets…";
    if (counts.total === 0) return "You're all caught up.";
    if (counts.open + counts["in progress"] > 0) {
      const active = counts.open + counts["in progress"];
      return `${active} ticket${active === 1 ? "" : "s"} currently being worked on.`;
    }
    return "Every ticket you've raised has been resolved.";
  }, [isLoading, counts]);

  return (
    <div className="customer-dashboard">
      <div className="dashboard-header">
        <div className="dashboard-header__text">
          <p className="dashboard-eyebrow">Customer Support Portal</p>
          <h1>Welcome back, {username}</h1>
          <p className="dashboard-subtitle">{heroMessage}</p>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          <IconLogout className="btn-icon" />
          Logout
        </button>
      </div>

      <div className="stats-strip">
        <div className="stat-card stat-card--total">
          <IconLayers className="stat-icon" />
          <div>
            <span className="stat-number">{isLoading ? "–" : counts.total}</span>
            <span className="stat-label">Total Tickets</span>
          </div>
        </div>
        <div className="stat-card stat-card--open">
          <IconSpark className="stat-icon" />
          <div>
            <span className="stat-number">{isLoading ? "–" : counts.open}</span>
            <span className="stat-label">Open</span>
          </div>
        </div>
        <div className="stat-card stat-card--progress">
          <IconClock className="stat-icon" />
          <div>
            <span className="stat-number">{isLoading ? "–" : counts["in progress"]}</span>
            <span className="stat-label">In Progress</span>
          </div>
        </div>
        <div className="stat-card stat-card--resolved">
          <IconCheck className="stat-icon" />
          <div>
            <span className="stat-number">{isLoading ? "–" : counts.resolved}</span>
            <span className="stat-label">Resolved</span>
          </div>
        </div>
      </div>

      <div className="action-section">
        <button className="submit-ticket-btn" onClick={() => navigate("/customer-portal")}>
          <IconPlus className="btn-icon" />
          Submit New Ticket
        </button>
      </div>

      <div className="tickets-section">
        <h2>My Tickets</h2>

        {isLoading ? (
          <div className="tickets-grid">
            <SkeletonCard delay={0} />
            <SkeletonCard delay={90} />
            <SkeletonCard delay={180} />
          </div>
        ) : error ? (
          <div className="error-state">
            <IconAlert className="error-icon" />
            <p>{error}</p>
            <button className="retry-btn" onClick={fetchTickets}>
              Try again
            </button>
          </div>
        ) : tickets.length === 0 ? (
          <div className="empty-state">
            <IconInbox className="empty-icon" />
            <p className="empty-title">No tickets yet</p>
            <p className="empty-subtitle">
              Raise a ticket and our team will pick it up right away.
            </p>
            <button className="submit-ticket-btn" onClick={() => navigate("/customer-portal")}>
              <IconPlus className="btn-icon" />
              Submit Your First Ticket
            </button>
          </div>
        ) : (
          <div className="tickets-grid">
            {tickets.map((ticket, index) => (
              <div
                className="ticket-card"
                data-status={getStatusSlug(ticket.status)}
                key={ticket.id}
                style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
              >
                <div className="ticket-card__top">
                  <span className="ticket-id">#{ticket.id}</span>
                  <StatusPill status={ticket.status} />
                </div>

                <p className="ticket-text">{ticket.ticket_text}</p>

                <div className="ticket-meta">
                  <span className="ticket-meta__item">
                    <span className="ticket-meta__label">Category</span>
                    {ticket.category || "General"}
                  </span>
                  <span className="ticket-meta__item">
                    <span className="ticket-meta__label">Created</span>
                    {formatDate(ticket.date_of_creation)}
                  </span>
                  <span className="ticket-meta__item">
                    <span className="ticket-meta__label">Assigned to</span>
                    {ticket.assigned_to || "Unassigned"}
                  </span>
                </div>

                <details className="notes-dropdown">
                  <summary>
                    View Notes
                    <IconChevron className="chevron" />
                  </summary>
                  <div className="notes-content">{ticket.notes || "No notes available yet."}</div>
                </details>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerDashboard;
