import { Navigate } from "react-router-dom";

function CustomerProtectedRoute({ children }) {

  const token =
    localStorage.getItem("token");

  const role =
    localStorage.getItem("role");

  if (!token || role !== "customer") {

    return (
      <Navigate
        to="/customer-login"
        replace
      />
    );

  }

  return children;

}

export default CustomerProtectedRoute;