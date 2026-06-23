import "../styles/HomePage.css";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

import {
  FaRobot,
  FaBolt,
  FaChartLine,
  FaEnvelope,
  FaShieldAlt,
  FaUserTie,
  FaArrowRight,
  FaEllipsisV,
  FaCog,
  FaSignInAlt,
  FaCheckCircle,
  FaPlay,
  FaClipboardList
} from "react-icons/fa";

/* Reveals a section once it scrolls into view, then stays revealed. */
function useInViewRef(threshold = 0.2) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView];
}

/* Counts up from 0 to value once "active" becomes true. */
function AnimatedNumber({ value, suffix = "", active, duration = 1200 }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const target = Number(value) || 0;

    if (!active || target === 0) {
      setDisplay(target);
      return;
    }

    let frame;
    let startTime = null;

    function step(timestamp) {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setDisplay(Math.floor(progress * target));
      if (progress < 1) {
        frame = requestAnimationFrame(step);
      } else {
        setDisplay(target);
      }
    }

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value, active, duration]);

  return <span>{display}{suffix}</span>;
}

function HomePage() {

  const [stats, setStats] =
    useState({});

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [tick, setTick] = useState(0);

  const menuRef = useRef(null);

  const [statsRef, statsInView] = useInViewRef(0.3);
  const [previewRef, previewInView] = useInViewRef(0.2);
  const [featuresRef, featuresInView] = useInViewRef(0.15);
  const [workflowRef, workflowInView] = useInViewRef(0.2);

  useEffect(() => {

    axios
      .get(
        "http://127.0.0.1:5000/api/home_stats"
      )
      .then((response) => {

        setStats(
          response.data
        );

      })
      .catch((error) => {

        console.error(error);

      });

  }, []);

  // Elevate the navbar once the page has scrolled past the top.
  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close the hidden system menu on outside click or Escape.
  useEffect(() => {
    function handleOutsideClick(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Drive the live ticket pipeline demo in the preview section.
  useEffect(() => {
    if (!previewInView) return;
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 2400);
    return () => clearInterval(interval);
  }, [previewInView]);

  const features = [

    {
      icon: <FaRobot />,
      title: "AI Classification",
      description:
        "Automatically categorizes support tickets using Machine Learning."
    },

    {
      icon: <FaBolt />,
      title: "Priority Prediction",
      description:
        "Detect urgent tickets and assign priority levels instantly."
    },

    {
      icon: <FaChartLine />,
      title: "Analytics Dashboard",
      description:
        "Monitor performance, ticket trends and resolution metrics."
    },

    {
      icon: <FaUserTie />,
      title: "Agent Analytics",
      description:
        "Track workloads, resolution rates and average resolution time."
    },

    {
      icon: <FaEnvelope />,
      title: "Email Notifications",
      description:
        "Automatically notify customers about ticket updates."
    },

    {
      icon: <FaShieldAlt />,
      title: "Secure Access",
      description:
        "JWT Authentication, RBAC and Password Hashing."
    }

  ];

  const pipelineStages = [
    { label: "Received", tone: "neutral" },
    { label: "AI Classifying", tone: "info" },
    { label: "Open", tone: "warning" },
    { label: "In-Progress", tone: "info" },
    { label: "Resolved", tone: "success" }
  ];

  const previewTickets = [
    { id: "TCK-2417", subject: "Checkout payment failing on mobile", priority: "High", confidence: 98 },
    { id: "TCK-2418", subject: "Unable to reset password", priority: "Medium", confidence: 95 },
    { id: "TCK-2419", subject: "API rate limit exceeded", priority: "Low", confidence: 99 }
  ];

  return (

    <div className="home-page">

      <nav className={`home-navbar ${scrolled ? "is-scrolled" : ""}`}>

        <div className="logo">
          <span className="logo-icon">
            <FaRobot />
          </span>
          AI Support Desk
        </div>

        <div className="nav-links">

          <a href="#features">
            Features
          </a>

          <a href="#preview">
            Preview
          </a>

          <a href="#workflow">
            Workflow
          </a>

          <a href="#contact">
            Contact
          </a>

        </div>

        <div className="nav-actions">

          <Link to="/customer-login">
            <button className="nav-login-btn">
              Customer Login
            </button>
          </Link>

          <div className="corner-menu" ref={menuRef}>

            <button
              type="button"
              className="corner-menu-trigger"
              aria-haspopup="true"
              aria-expanded={menuOpen}
              aria-label="System options"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <FaEllipsisV />
            </button>

            {menuOpen && (

              <div className="corner-menu-dropdown" role="menu">

                <span className="corner-menu-label">
                  System
                </span>

                <Link
                  to="/login"
                  className="corner-menu-item"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                >
                  <FaSignInAlt />
                  Admin Login
                </Link>

                <button
                  type="button"
                  className="corner-menu-item"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                >
                  <FaCog />
                  Settings
                </button>

              </div>

            )}

          </div>

        </div>

      </nav>

      <section className="hero">

        <div className="hero-content">

          <span className="hero-badge">
            AI Powered Support Platform
          </span>

          <h1>

            Intelligent Support
            <br />
            Ticket Management

          </h1>

          <p>

            Automate ticket classification,
            priority prediction, assignment,
            customer communication and analytics
            using Artificial Intelligence.

          </p>

          <div className="hero-buttons">

            <Link to="/customer-login">

              <button className="primary-btn">

                Customer Portal

                <FaArrowRight />

              </button>

            </Link>

            <a href="#preview">

              <button className="secondary-btn">

                <FaPlay />
                See It In Action

              </button>

            </a>

          </div>

        </div>

      </section>

      <section className="stats-section" ref={statsRef}>

        <div className="stat-card">

          <h2>
            <AnimatedNumber value={stats.total_tickets} active={statsInView} />
          </h2>

          <p>
            Tickets Processed
          </p>

        </div>

        <div className="stat-card">

          <h2>
            <AnimatedNumber value={stats.total_users} active={statsInView} />
          </h2>

          <p>
            Active Users
          </p>

        </div>

        <div className="stat-card">

          <h2>
            <AnimatedNumber value={stats.resolution_rate} active={statsInView} suffix="%" />
          </h2>

          <p>
            Resolution Rate
          </p>

        </div>

        <div className="stat-card">

          <h2>
            {
              stats.avg_resolution_time
              || "-"
            }
          </h2>

          <p>
            Avg Resolution Time
          </p>

        </div>

        <div className="stat-card">

          <h2>
            <AnimatedNumber value={stats.total_agents} active={statsInView} />
          </h2>

          <p>
            Support Agents
          </p>

        </div>

      </section>

      <section
        id="preview"
        className={`preview-section ${previewInView ? "is-visible" : ""}`}
        ref={previewRef}
      >

        <h2>
          See AI Support Desk in Action
        </h2>

        <p className="preview-subtitle">
          Every incoming ticket moves through this pipeline
          automatically, from first contact to resolution.
        </p>

        <div className="preview-frame">

          <div className="preview-frame-header">
            <span className="preview-dot" />
            <span className="preview-dot" />
            <span className="preview-dot" />
            <span className="preview-frame-title">
              Live Ticket Pipeline
            </span>
          </div>

          <div className="preview-frame-body">

            {previewTickets.map((ticket, index) => {

              const stageIndex = (tick + index) % pipelineStages.length;
              const stage = pipelineStages[stageIndex];
              const showConfidence = stageIndex >= 1;

              return (

                <div className="preview-ticket" key={ticket.id}>

                  <div className="preview-ticket-main">

                    <span className="preview-ticket-id">
                      {ticket.id}
                    </span>

                    <span className="preview-ticket-subject">
                      {ticket.subject}
                    </span>

                    <span className={`preview-priority priority-${ticket.priority.toLowerCase()}`}>
                      {ticket.priority}
                    </span>

                  </div>

                  <div className="preview-ticket-stage">

                    <span className={`stage-pill stage-${stage.tone}`}>
                      {stage.tone === "success" && (
                        <FaCheckCircle style={{ marginRight: 6 }} />
                      )}
                      {stage.label}
                    </span>

                    {showConfidence && (

                      <div className="confidence-track">

                        <div
                          className="confidence-fill"
                          style={{ width: `${ticket.confidence}%` }}
                        />

                        <span className="confidence-label">
                          {ticket.confidence}% match
                        </span>

                      </div>

                    )}

                  </div>

                </div>

              );

            })}

          </div>

        </div>

      </section>

      <section
        id="features"
        className="features-section"
        ref={featuresRef}
      >

        <h2>
          Powerful Features
        </h2>

        <div className={`features-grid ${featuresInView ? "is-visible" : ""}`}>

          {features.map(
            (feature, index) => (

              <div
                key={index}
                className="feature-card"
                style={{ transitionDelay: `${index * 80}ms` }}
              >

                <div className="feature-icon">

                  {feature.icon}

                </div>

                <h3>
                  {feature.title}
                </h3>

                <p>
                  {feature.description}
                </p>

              </div>

            )
          )}

        </div>

      </section>

      <section
        id="workflow"
        className="workflow-section"
        ref={workflowRef}
      >

        <h2>
          How It Works
        </h2>

        <div className={`workflow ${workflowInView ? "is-visible" : ""}`}>

          <div>
            <span className="workflow-icon">
              <FaClipboardList />
            </span>
            <span>
              Submit Ticket
            </span>
          </div>

          <div className="workflow-arrow">
            <FaArrowRight />
          </div>

          <div>
            <span className="workflow-icon">
              <FaRobot />
            </span>
            <span>
              AI Classification
            </span>
          </div>

          <div className="workflow-arrow">
            <FaArrowRight />
          </div>

          <div>
            <span className="workflow-icon">
              <FaBolt />
            </span>
            <span>
              Priority Prediction
            </span>
          </div>

          <div className="workflow-arrow">
            <FaArrowRight />
          </div>

          <div>
            <span className="workflow-icon">
              <FaUserTie />
            </span>
            <span>
              Agent Assignment
            </span>
          </div>

          <div className="workflow-arrow">
            <FaArrowRight />
          </div>

          <div>
            <span className="workflow-icon">
              <FaEnvelope />
            </span>
            <span>
              Notification
            </span>
          </div>

        </div>

      </section>

      <section className="cta-section">

        <h2>

          Ready to transform
          support operations?

        </h2>

        <p>

          Experience AI-powered
          customer support automation.

        </p>

        <Link to="/customer-login">

          <button className="primary-btn">

            Get Started

          </button>

        </Link>

      </section>

      <footer
        id="contact"
        className="footer"
      >

        <h3>
          AI Support Desk
        </h3>

        <p>

          Developed by Hanin C K

        </p>

      </footer>

    </div>

  );

}

export default HomePage;