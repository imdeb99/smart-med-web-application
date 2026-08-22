import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RouteFallback from "../components/shared/RouteFallback";

// For public pages (login/register/forgot-password): an already-authenticated
// user gets sent straight to their role dashboard instead of the auth form.
export default function PublicOnlyRoute({ children }) {
  const { user, isLoading } = useAuth();

  // Wait for the stored token to be verified before deciding where to send
  // an authenticated user, otherwise they'd flash the login form briefly.
  if (isLoading) {
    return <RouteFallback />;
  }

  if (user) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return children;
}
