import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/admin-login.css";


function AdminLogin() {

  const navigate = useNavigate();

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const login = () => {

    setError("");

    axios
      .post(
        "http://127.0.0.1:5000/api/login",
        {
          username,
          password
        }
      )
      .then((response) => {

        if (response.data.success) {

          localStorage.setItem(
            "loggedIn",
            "true"
          );

          localStorage.setItem(
            "username",
            response.data.username
          );

          localStorage.setItem(
            "role",
            response.data.role
          );

          localStorage.setItem(
            "token",
            response.data.token
          );

          navigate(
            "/dashboard"
          );

        } else {

          setError(
            "Invalid username or password"
          );

        }

      })
      .catch((error) => {

        if (
          error.response &&
          error.response.status === 401
        ) {

          setError(
            error.response.data.message ||
            "Session expired. Please login again."
          );

          localStorage.clear();

        } else {

          setError(
            "Unable to connect to server"
          );

        }

      });

  };

  return (

    <div className="admin-login-page">
       <button
      className="back-home-btn"
      onClick={() =>
        navigate("/landing")
      }
    >
      ← Back to Home
    </button>

      <div className="admin-login-card">

        <div className="admin-icon">
          🛡️
        </div>

        <h1>
          Admin Portal
        </h1>

        <p className="admin-subtitle">
          Authorized Personnel Only
        </p>

        <p className="admin-description">

          Access ticket management,
          analytics, support notes
          and system controls.

        </p>

        <div className="admin-form">

          <label>
            Username
          </label>

          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) =>
              setUsername(
                e.target.value
              )
            }
          />

          <label>
            Password
          </label>

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
          />

          {
            error && (

              <div className="login-error">

                {error}

              </div>

            )
          }

          <button
            className="admin-login-btn"
            onClick={login}
          >
            Access Dashboard
          </button>

        </div>

      </div>

    </div>

  );

}


export default AdminLogin;
