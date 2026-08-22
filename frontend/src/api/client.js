// Central fetch wrapper for the SMART-MED backend.
//
// - Base URL comes from VITE_API_URL (see frontend/.env); falls back to the
//   local dev URL so the app still works without a .env file.
// - Automatically attaches the JWT from localStorage as `Authorization: Bearer`.
// - Throws ApiError with the backend's error message for non-OK responses.
// - Every successful response is unwrapped to `data` (backend shape:
//   { success, data, error }).

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:4000/api").replace(/\/+$/, "");

export const TOKEN_KEY = "smartmed_token";

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // localStorage unavailable (private mode) — the session simply won't persist.
  }
}

export function clearToken() {
  setToken(null);
}

export class ApiError extends Error {
  constructor(message, status = 0, details = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function buildQueryString(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });
  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}

async function request(path, { method = "GET", body, query, headers = {}, isFormData = false } = {}) {
  const url = `${API_BASE_URL}${path}${buildQueryString(query)}`;

  const token = getToken();
  const requestHeaders = {
    // When body is FormData, let the browser set the multipart boundary — do
    // NOT set Content-Type manually or the upload will be rejected.
    ...(!isFormData && body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  let response;
  try {
    response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    });
  } catch (networkError) {
    throw new ApiError(
      "Network error — could not reach the server. Is the backend running?",
      0,
      networkError,
    );
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    // Non-JSON response (e.g. an HTML error page) — fall through to the
    // status-based error below.
  }

  if (!response.ok) {
    const message =
      payload?.error?.message ||
      payload?.message ||
      (response.statusText
        ? response.statusText
        : `Request failed with status ${response.status}`);
    throw new ApiError(message, response.status, payload?.error?.details ?? null);
  }

  // Backend wraps every successful response as { success, data, error }.
  return payload?.data ?? payload;
}

export const api = {
  get: (path, options = {}) => request(path, { ...options, method: "GET" }),
  post: (path, body, options = {}) => request(path, { ...options, method: "POST", body }),
  patch: (path, body, options = {}) => request(path, { ...options, method: "PATCH", body }),
  delete: (path, options = {}) => request(path, { ...options, method: "DELETE" }),
  // Multipart uploads — pass a FormData instance as `body`.
  upload: (path, formData, options = {}) =>
    request(path, { ...options, method: "POST", body: formData, isFormData: true }),
};

export function checkHealth() {
  return request("/health", { method: "GET" });
}

export default api;
