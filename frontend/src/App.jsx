import { Routes, Route, Navigate } from "react-router-dom";

import Tickets from "./pages/Tickets";
import TicketDetails from "./pages/TicketDetails";
import Dashboard from "./pages/Dashboard";
import CustomerPortal from "./pages/CustomerPortal";
import AdminLogin from "./pages/AdminLogin";
import CustomerLogin from "./pages/CustomerLogin";
import CustomerSignup from "./pages/CustomerSignup";
import CustomerDashboard from "./pages/CustomerDashboard";

import ProtectedRoute from "./components/ProtectedRoute";
import CustomerProtectedRoute from "./components/CustomerProtectedRoute";
import AgentAnalytics
from "./pages/AgentAnalytics";
import HomePage from "./pages/HomePage";
function App() {

  return (

    <Routes>
    <Route
  path="/landing"
  element={<HomePage />}
/>
   <Route
  path="/agent-analytics"
  element={
    <ProtectedRoute>
      <AgentAnalytics />
    </ProtectedRoute>
  }
/>
      <Route
        path="/"
        element={
          <Navigate
            to="/customer-login"
            replace
          />
        }
      />

      <Route
        path="/customer-login"
        element={<CustomerLogin />}
      />

      <Route
        path="/customer-signup"
        element={<CustomerSignup />}
      />

      <Route
        path="/customer-portal"
        element={<CustomerPortal />}
      />

      <Route
        path="/customer-dashboard"
        element={
          <CustomerProtectedRoute>
            <CustomerDashboard />
          </CustomerProtectedRoute>
        }
      />

      <Route
        path="/login"
        element={<AdminLogin />}
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tickets"
        element={
          <ProtectedRoute>
            <Tickets />
          </ProtectedRoute>
        }
      />

      <Route
        path="/ticket/:id"
        element={
          <ProtectedRoute>
            <TicketDetails />
          </ProtectedRoute>
        }
      />

    </Routes>

  );

}

export default App;