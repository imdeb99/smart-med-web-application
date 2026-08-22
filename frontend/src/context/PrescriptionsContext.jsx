import { createContext, useCallback, useContext, useEffect, useState } from "react";
import healthRecordsApi from "../api/healthRecords";
import { useAuth } from "./AuthContext";

const PrescriptionsContext = createContext(null);

/**
 * Serialize the structured prescription UI shape into the backend HealthRecord
 * fields: prescriptionText = readable summary, notes = JSON payload for a
 * lossless round-trip back to the structured form.
 */
function serializePrescription({ diagnosis, medicines = [], advice, followUpDate }) {
  const lines = [];
  if (diagnosis) lines.push(`Diagnosis: ${diagnosis}`);
  medicines
    .filter((m) => m.name)
    .forEach((m) => {
      const parts = [m.name];
      if (m.dosage) parts.push(m.dosage);
      if (m.frequency) parts.push(m.frequency);
      if (m.duration) parts.push(m.duration);
      lines.push(`- ${parts.join(" · ")}`);
    });
  if (advice) lines.push(`Advice: ${advice}`);
  if (followUpDate) lines.push(`Follow-up: ${followUpDate}`);
  return lines.join("\n") || "No details provided.";
}

function parsePrescription(record) {
  const structured = { diagnosis: "", medicines: [], advice: "", followUpDate: "" };
  if (!record) return structured;
  try {
    const parsed = JSON.parse(record.notes || "");
    if (parsed && typeof parsed === "object") {
      return {
        diagnosis: parsed.diagnosis || "",
        medicines: Array.isArray(parsed.medicines) ? parsed.medicines : [],
        advice: parsed.advice || "",
        followUpDate: parsed.followUpDate || "",
      };
    }
  } catch {
    // notes is not JSON — fall back to flat text.
  }
  return structured;
}

export function PrescriptionsProvider({ children }) {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);

  // Load the caller's health records from the real API whenever the auth user
  // changes (doctor or patient — backend scopes the list by role). Admins
  // have no health-record list endpoint, so skip them.
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!user || user.role === "admin") return;
      try {
        const data = await healthRecordsApi.getMyHealthRecords({ limit: 100 });
        if (!cancelled) setPrescriptions(data.records || []);
      } catch {
        if (!cancelled) setPrescriptions([]);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  /** Save a prescription to the backend (creates a HealthRecord). */
  const savePrescription = useCallback(
    async ({ appointmentId, diagnosis, medicines, advice, followUpDate }) => {
      const data = await healthRecordsApi.createHealthRecord({
        appointmentId,
        prescriptionText: serializePrescription({ diagnosis, medicines, advice, followUpDate }),
        notes: JSON.stringify({ diagnosis, medicines, advice, followUpDate }),
      });
      const record = data.record ?? data;
      setPrescriptions((prev) => [record, ...prev.filter((r) => r.appointmentId !== appointmentId)]);
      return record;
    },
    [],
  );

  /** Get a prescription for an appointment, from the already-loaded list. */
  const getPrescriptionByAppointment = useCallback(
    (appointmentId) => {
      const record = prescriptions.find((p) => p.appointmentId === appointmentId);
      if (!record) return null;
      const structured = parsePrescription(record);
      return {
        appointmentId: record.appointmentId,
        patientId: record.patientId,
        doctorId: record.doctorId,
        diagnosis: structured.diagnosis,
        medicines: structured.medicines,
        advice: structured.advice,
        followUpDate: structured.followUpDate,
      };
    },
    [prescriptions],
  );

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
