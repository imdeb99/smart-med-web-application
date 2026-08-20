import { createContext, useContext, useState } from "react";
import mockPatients from "../data/mockPatients";

const PatientsContext = createContext(null);
const STORAGE_KEY = "smartmed_patients";

export function PatientsProvider({ children }) {
  const [patients, setPatients] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : mockPatients;
    } catch {
      return mockPatients;
    }
  });

  const persist = (next) => {
    setPatients(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const getPatientById = (id) => patients.find((p) => p.id === id);

  const addPatient = (patient) => {
    const newPatient = {
      id: `pat-${Date.now()}`,
      avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70) + 1}`,
      ...patient,
    };
    persist([newPatient, ...patients]);
    return newPatient;
  };

  const updatePatient = (id, updates) => {
    persist(patients.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deletePatient = (id) => {
    persist(patients.filter((p) => p.id !== id));
  };

  return (
    <PatientsContext.Provider
      value={{ patients, getPatientById, addPatient, updatePatient, deletePatient }}
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
