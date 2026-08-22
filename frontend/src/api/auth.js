import api from "./client";

/**
 * Auth module — POST /api/auth/register, /login, GET /api/auth/me.
 *
 * Backend returns { user, token } for register/login; the token should be
 * persisted via setToken() from ./client so the api wrapper attaches it.
 */

export function register(data) {
  return api.post("/auth/register", data);
}

export function login(email, password) {
  return api.post("/auth/login", { email, password });
}

export function getMe() {
  return api.get("/auth/me");
}

/** Update own account fields (name/phone). Returns { user } from the backend. */
export function updateProfile(data) {
  return api.patch("/auth/me", data);
}

export default { register, login, getMe, updateProfile };
