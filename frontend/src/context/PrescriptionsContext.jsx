import { createContext, useContext, useState } from "react";

const PrescriptionsContext = createContext(null);
const STORAGE_KEY = "smartmed_prescriptions";

export function PrescriptionsProvider({ children }) {
  const [prescriptions, setPrescriptions] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const persist = (next) => {
    setPrescriptions(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const savePrescription = (prescription) => {
    const existingIndex = prescriptions.findIndex(
      (p) => p.appointmentId === prescription.appointmentId
    );
    if (existingIndex >= 0) {
      const next = [...prescriptions];
      next[existingIndex] = { ...next[existingIndex], ...prescription };
      persist(next);
      return next[existingIndex];
    }
    const newPrescription = { id: `rx-${Date.now()}`, ...prescription };
    persist([...prescriptions, newPrescription]);
    return newPrescription;
  };

  const getPrescriptionByAppointment = (appointmentId) =>
    prescriptions.find((p) => p.appointmentId === appointmentId);

  return (
    <PrescriptionsContext.Provider
      value={{ prescriptions, savePrescription, getPrescriptionByAppointment }}
    >
      {children}
    </PrescriptionsContext.Provider>
  );
}

export function usePrescriptions() {
  const ctx = useContext(PrescriptionsContext);
  if (!ctx) throw new Error("usePrescriptions must be used within a PrescriptionsProvider");
  return ctx;
}
