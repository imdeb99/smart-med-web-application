import { createContext, useContext, useState } from "react";
import mockAppointments from "../data/mockAppointments";
import { DEMO_PATIENT_ID } from "../utils/constants";

const AppointmentsContext = createContext(null);
const STORAGE_KEY = "smartmed_appointments";

export function AppointmentsProvider({ children }) {
  const [appointments, setAppointments] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : mockAppointments;
    } catch {
      return mockAppointments;
    }
  });

  const persist = (next) => {
    setAppointments(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const bookAppointment = (details) => {
    const newAppointment = {
      id: `apt-${Date.now()}`,
      patientId: DEMO_PATIENT_ID,
      status: "upcoming",
      ...details,
    };
    persist([newAppointment, ...appointments]);
    return newAppointment;
  };

  const cancelAppointment = (id) => {
    persist(appointments.map((a) => (a.id === id ? { ...a, status: "cancelled" } : a)));
  };

  const rescheduleAppointment = (id, date, time) => {
    persist(
      appointments.map((a) => (a.id === id ? { ...a, date, time, status: "upcoming" } : a))
    );
  };

  const completeAppointment = (id, notes) => {
    persist(
      appointments.map((a) =>
        a.id === id ? { ...a, status: "completed", ...(notes ? { notes } : {}) } : a
      )
    );
  };

  return (
    <AppointmentsContext.Provider
      value={{
        appointments,
        bookAppointment,
        cancelAppointment,
        rescheduleAppointment,
        completeAppointment,
      }}
    >
      {children}
    </AppointmentsContext.Provider>
  );
}

export function useAppointments() {
  const ctx = useContext(AppointmentsContext);
  if (!ctx) throw new Error("useAppointments must be used within an AppointmentsProvider");
  return ctx;
}
