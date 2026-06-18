import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./customer.css";

function CustomerLogin() {

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

        if (
          response.data.success &&
          response.data.role === "customer"
        ) {

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

          navigate(
            "/customer-dashboard"
          );

        } else {

          setError(
            "Invalid customer credentials"
          );

        }

      })
      .catch(() => {

        setError(
          "Unable to connect to server"
        );

      });

  };

 return (

  <div className="customer-login-page">

    <div className="customer-login-card">

      <div className="customer-icon">
  ⌬
</div>

      <h1 className="customer-title">
        Customer Portal
      </h1>

      <p className="customer-subtitle">
        Customer Login
      </p>

      <p className="customer-description">

        Login to track your tickets,
        view status updates and
        support notes.

      </p>

      <div className="customer-form">

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
          className="customer-login-btn"
          onClick={login}
        >
          Login
        </button>

        <div className="signup-link">

          <p>
            Don't have an account?
          </p>

          <button
            className="customer-secondary-btn"
            onClick={() =>
              navigate(
                "/customer-signup"
              )
            }
          >
            Sign Up
          </button>

        </div>

      </div>

    </div>

  </div>

);}
export default CustomerLogin;