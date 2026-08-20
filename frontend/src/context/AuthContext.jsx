import { createContext, useContext, useState } from "react";
import mockUsers from "../data/mockUsers";

const AuthContext = createContext(null);
const SESSION_KEY = "smartmed_user";
const USERS_KEY = "smartmed_users";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // The full account directory: seeded demo accounts plus anyone who has
  // registered through the UI this session, persisted so login keeps working
  // after a refresh.
  const [users, setUsers] = useState(() => {
    try {
      const stored = localStorage.getItem(USERS_KEY);
      return stored ? JSON.parse(stored) : mockUsers;
    } catch {
      return mockUsers;
    }
  });

  const persistUsers = (next) => {
    setUsers(next);
    localStorage.setItem(USERS_KEY, JSON.stringify(next));
  };

  const persistSession = (userData) => {
    setUser(userData);
    localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
  };

  // Demo login: validates the email/password/role against the account directory.
  const login = ({ email, password, role }) => {
    const match = users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.role === role
    );
    if (!match) {
      return { success: false, error: "No account found with that email for this role." };
    }
    if (match.password !== password) {
      return { success: false, error: "Incorrect password." };
    }
    persistSession(match);
    return { success: true, user: match };
  };

  // Demo registration: adds a new account to the directory and signs them in.
  const register = (userData) => {
    const exists = users.some((u) => u.email.toLowerCase() === userData.email.toLowerCase());
    if (exists) {
      return { success: false, error: "An account with this email already exists." };
    }
    const newUser = { id: `user-${Date.now()}`, ...userData };
    persistUsers([...users, newUser]);
    persistSession(newUser);
    return { success: true, user: newUser };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
