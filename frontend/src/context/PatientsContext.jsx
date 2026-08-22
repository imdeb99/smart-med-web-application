import { createContext, useCallback, useContext, useEffect, useState } from "react";
import adminApi from "../api/admin";
import { mapPatientsListFromApi, mapPatientDetailFromApi } from "../api/adapters";
import { useAuth } from "./AuthContext";

const PatientsContext = createContext(null);

export function PatientsProvider({ children }) {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Load the patient list from the admin API when an admin is logged in.
  // Non-admin callers get an empty list (no consumer needs the full patient
  // list outside the admin pages).
  const refresh = useCallback(async () => {
    if (!user || user.role !== "admin") {
      setPatients([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const data = await adminApi.getAdminPatients({ limit: 100 });
      setPatients(mapPatientsListFromApi(data).patients);
    } catch (err) {
      setPatients([]);
      setError(err instanceof Error ? err.message : "Failed to load patients.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /** Admin-only: fetch a single patient (used for detail views). */
  const getPatientById = useCallback(
    async (id) => {
      const cached = patients.find((p) => p.id === id);
      if (cached) return cached;
      try {
        const data = await adminApi.getAdminPatientById(id);
        return mapPatientDetailFromApi(data);
      } catch {
        return null;
      }
    },
    [patients],
  );

  /** Admin-only: update a patient's account + profile fields. */
  const updatePatient = useCallback(async (id, payload) => {
    const data = await adminApi.updateAdminPatient(id, payload);
    const updated = mapPatientDetailFromApi(data);
    setPatients((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  }, []);

  /** Admin-only: delete a patient account (cascades related records). */
  const deletePatient = useCallback(async (id) => {
    await adminApi.deleteAdminPatient(id);
    setPatients((prev) => prev.filter((p) => p.id !== id));
  }, []);

  /** Admin-only: update a patient's avatar URL in the local list after an upload. */
  const updatePatientAvatar = useCallback((id, avatarUrl) => {
    setPatients((prev) => prev.map((p) => (p.id === id ? { ...p, avatar: avatarUrl } : p)));
  }, []);

  return (
    <PatientsContext.Provider
      value={{ patients, isLoading, error, refresh, getPatientById, updatePatient, deletePatient, updatePatientAvatar }}
    >
      {children}
    </PatientsContext.Provider>
  );
}

export function usePatients() {
  const ctx = useContext(PatientsContext);
  if (!ctx) throw new Error("usePatients must be used within a PatientsProvider");
  return ctx;
}
