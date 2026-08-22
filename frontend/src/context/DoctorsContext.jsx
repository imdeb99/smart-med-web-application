import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import doctorsApi from "../api/doctors";
import adminApi from "../api/admin";
import { mapDoctorFromApi, mapDoctorsListFromApi, mapDoctorFromAuthUser } from "../api/adapters";
import { useAuth } from "./AuthContext";

const DoctorsContext = createContext(null);

export function DoctorsProvider({ children }) {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Load the public verified-doctor list on mount (and again when the logged-in
  // user changes, so a doctor sees themselves after login). Admins get the full
  // list (verified + pending) from the admin endpoint for the Manage Doctors page.
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError("");
      try {
        const data =
          user?.role === "admin"
            ? await adminApi.getAdminDoctors({ limit: 100 })
            : await doctorsApi.getDoctors({ limit: 100 });
        if (!cancelled) setDoctors(mapDoctorsListFromApi(data).doctors);
      } catch (err) {
        if (!cancelled) {
          setDoctors([]);
          setError(err instanceof Error ? err.message : "Failed to load doctors.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.role]);

  const getDoctorById = useCallback(
    async (id) => {
      // Local first: an already-loaded doctor avoids a network round trip.
      const cached = doctors.find((d) => d.id === id);
      if (cached) return cached;

      try {
        const data = await doctorsApi.getDoctorById(id);
        return mapDoctorFromApi(data.doctor ?? data);
      } catch {
        return null; // pages render a "not found" state
      }
    },
    [doctors],
  );

  const updateOwnProfile = useCallback(async (payload) => {
    const data = await doctorsApi.updateOwnProfile(payload);
    const updated = mapDoctorFromApi(data.doctor ?? data);
    // Keep the cached list in sync with the doctor's own profile.
    setDoctors((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    return updated;
  }, []);

  // --- Admin doctor management (used by ManageDoctors) ----------------------

  const addDoctor = useCallback(async (payload) => {
    const data = await adminApi.createAdminDoctor(payload);
    const created = mapDoctorFromApi(data.doctor ?? data);
    setDoctors((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateDoctor = useCallback(async (id, payload) => {
    const data = await adminApi.updateAdminDoctor(id, payload);
    const updated = mapDoctorFromApi(data.doctor ?? data);
    setDoctors((prev) => prev.map((d) => (d.id === id ? updated : d)));
    return updated;
  }, []);

  const deleteDoctor = useCallback(async (id) => {
    await adminApi.deleteAdminDoctor(id);
    setDoctors((prev) => prev.filter((d) => d.id !== id));
  }, []);

  /** Admin: set a doctor's verification status (VERIFIED/REJECTED/PENDING). */
  const updateDoctorVerification = useCallback(async (id, status) => {
    const data = await adminApi.setDoctorVerification(id, status);
    const updated = mapDoctorFromApi(data.doctor ?? data);
    setDoctors((prev) => prev.map((d) => (d.id === id ? updated : d)));
    return updated;
  }, []);

  /** Admin: update a doctor's avatar URL in the local list after an upload. */
  const updateDoctorAvatar = useCallback((id, avatarUrl) => {
    setDoctors((prev) => prev.map((d) => (d.id === id ? { ...d, avatar: avatarUrl } : d)));
  }, []);

  // The currently-logged-in doctor's profile, derived from the auth user
  // (avoids a duplicate network call and works before the list loads).
  const currentDoctor = useMemo(() => {
    if (!user || user.role !== "doctor") return null;
    const fromList = doctors.find((d) => d.userId === user.id);
    return fromList || mapDoctorFromAuthUser(user);
  }, [user, doctors]);

  return (
    <DoctorsContext.Provider
      value={{
        doctors,
        isLoading,
        error,
        getDoctorById,
        updateOwnProfile,
        addDoctor,
        updateDoctor,
        deleteDoctor,
        updateDoctorVerification,
        updateDoctorAvatar,
        currentDoctor,
      }}
    >
      {children}
    </DoctorsContext.Provider>
  );
}

export function useDoctors() {
  const ctx = useContext(DoctorsContext);
  if (!ctx) throw new Error("useDoctors must be used within a DoctorsProvider");
  return ctx;
}
