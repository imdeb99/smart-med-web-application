import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// For public pages (login/register/forgot-password): an already-authenticated
// user gets sent straight to their role dashboard instead of the auth form.
export default function PublicOnlyRoute({ children }) {
  const { user } = useAuth();

  if (user) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return children;
}
