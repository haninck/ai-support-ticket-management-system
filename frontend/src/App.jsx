import { Routes, Route } from "react-router-dom";
import Tickets from "./pages/Tickets";
import TicketDetails from "./pages/TicketDetails";
import Dashboard from "./pages/Dashboard";
import CustomerPortal from "./pages/CustomerPortal";
import AdminLogin from "./pages/AdminLogin";
import ProtectedRoute
from "./components/ProtectedRoute";
import CustomerLogin from "./pages/CustomerLogin";
import CustomerSignup from "./pages/CustomerSignup";
import CustomerDashboard
from "./pages/CustomerDashboard";
function App() {

  return (

<Routes>
  <Route
  path="/customer-dashboard"
  element={<CustomerDashboard />}
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
    path="/"
    element={<CustomerPortal />}
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