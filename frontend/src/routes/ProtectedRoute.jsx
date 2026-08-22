import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RouteFallback from "../components/shared/RouteFallback";

export default function ProtectedRoute({ allowedRole, anyRole = false, children }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // While the stored token is being verified against /api/auth/me, don't
  // redirect — we don't know yet whether the user is authenticated.
  if (isLoading) {
    return <RouteFallback />;
  }

  if (!user) {
    // Unauthenticated → always send to login, remembering where they were headed.
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!anyRole && user.role !== allowedRole) {
    // Authenticated but wrong role → send to that role's home, never silently
    // render the page. Preserves the requested path for the redirect target.
    return <Navigate to={`/${user.role}/dashboard`} replace state={{ from: location.pathname }} />;
  }

  return children;
}
