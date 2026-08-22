import { createContext, useCallback, useContext, useEffect, useState } from "react";
import authApi from "../api/auth";
import usersApi from "../api/users";
import { getToken, setToken, clearToken, ApiError } from "../api/client";
import { mapUserFromApi } from "../api/adapters";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // On mount: if a JWT exists, verify it against /api/auth/me and load the
  // user. An invalid/expired token clears the session.
  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const token = getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await authApi.getMe();
        if (!cancelled) setUser(mapUserFromApi(data.user ?? null));
      } catch {
        // Invalid or expired token — drop the session silently.
        if (!cancelled) {
          clearToken();
          setUser(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async ({ email, password }) => {
    setError("");
    try {
      const data = await authApi.login(email, password);
      setToken(data.token);
      const user = mapUserFromApi(data.user);
      setUser(user);
      return { success: true, user };
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const register = useCallback(async (userData) => {
    setError("");
    try {
      const data = await authApi.register(userData);
      setToken(data.token);
      const user = mapUserFromApi(data.user);
      setUser(user);
      return { success: true, user };
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setError("");
  }, []);

  /** Update own account fields (name/phone) via PATCH /auth/me. */
  const updateProfile = useCallback(async (data) => {
    setError("");
    try {
      const result = await authApi.updateProfile(data);
      const user = mapUserFromApi(result.user);
      setUser((prev) => ({ ...prev, ...user }));
      return { success: true, user };
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Could not update the profile.";
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  /** Upload a new avatar for the current user. Returns the new avatar URL. */
  const uploadAvatar = useCallback(async (file) => {
    setError("");
    const result = await usersApi.uploadMyAvatar(file);
    const user = mapUserFromApi(result.user);
    setUser((prev) => ({ ...prev, ...user }));
    return user.avatar;
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, error, login, register, logout, updateProfile, uploadAvatar }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
