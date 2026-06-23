import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./customer.css";


function CustomerSignup() {

  const navigate = useNavigate();

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const signup = () => {

    setError("");

    if (
      password !== confirmPassword
    ) {

      setError(
        "Passwords do not match"
      );

      return;

    }

    axios
      .post(
        "http://127.0.0.1:5000/api/customer_signup",
        {
          username,
          password
        }
      )
      .then((response) => {

        if (
          response.data.success
        ) {

          alert(
            "Account created successfully"
          );

          navigate(
            "/"
          );

        } else {

          setError(
            response.data.message
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
  ⌘
</div>
      <h1 className="customer-title">
        Customer Signup
      </h1>

      <p className="customer-subtitle">
        Create Your Account
      </p>

      <p className="customer-description">

        Sign up to submit tickets,
        track progress and view
        support updates.

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

        <label>
          Confirm Password
        </label>

        <input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) =>
            setConfirmPassword(
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
          onClick={signup}
        >
          Create Account
        </button>

        <div className="signup-link">

          <p>
            Already have an account?
          </p>

          <button
            className="customer-secondary-btn"
            onClick={() =>
              navigate(
                "/customer-login"
              )
            }
          >
            Login
          </button>
          
        </div>

      </div>

    </div>

  </div>

);}


export default CustomerSignup;