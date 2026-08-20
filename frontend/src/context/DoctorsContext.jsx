import { createContext, useContext, useState } from "react";
import mockDoctors from "../data/mockDoctors";

const DoctorsContext = createContext(null);
const STORAGE_KEY = "smartmed_doctors";

export function DoctorsProvider({ children }) {
  const [doctors, setDoctors] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : mockDoctors;
    } catch {
      return mockDoctors;
    }
  });

  const persist = (next) => {
    setDoctors(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const getDoctorById = (id) => doctors.find((d) => d.id === id);

  const addDoctor = (doctor) => {
    const newDoctor = {
      id: `doc-${Date.now()}`,
      rating: 0,
      reviewsCount: 0,
      verified: false,
      availableSlots: [],
      languages: ["Bengali", "English"],
      avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70) + 1}`,
      bio: "",
      ...doctor,
    };
    persist([newDoctor, ...doctors]);
    return newDoctor;
  };

  const updateDoctor = (id, updates) => {
    persist(doctors.map((d) => (d.id === id ? { ...d, ...updates } : d)));
  };

  const deleteDoctor = (id) => {
    persist(doctors.filter((d) => d.id !== id));
  };

  const approveDoctor = (id) => updateDoctor(id, { verified: true });

  return (
    <DoctorsContext.Provider
      value={{
        doctors,
        getDoctorById,
        addDoctor,
        updateDoctor,
        deleteDoctor,
        approveDoctor,
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
