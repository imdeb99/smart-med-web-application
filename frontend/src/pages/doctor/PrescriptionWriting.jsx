import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Save, Loader2, FileJson } from "lucide-react";
import DoctorLayout from "../../components/doctor/DoctorLayout";
import { useAppointments } from "../../context/AppointmentsContext";
import { usePrescriptions } from "../../context/PrescriptionsContext";
import { useToast } from "../../context/ToastContext";
import healthRecordsApi from "../../api/healthRecords";
import { downloadJson, formatDate } from "../../utils/helpers";

const emptyMedicine = { name: "", dosage: "", frequency: "", duration: "" };

export default function PrescriptionWriting() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { appointments, completeAppointment } = useAppointments();
  const { prescriptions, savePrescription, getPrescriptionByAppointment } = usePrescriptions();

  const appointment = appointments.find((a) => a.id === appointmentId);
  // The appointment response from the API embeds the full patient record —
  // no separate patient lookup needed.
  const patient = appointment?.patient;
  const existing = getPrescriptionByAppointment(appointmentId);

  const [diagnosis, setDiagnosis] = useState(existing?.diagnosis || "");
  const [diagnosisError, setDiagnosisError] = useState("");
  const [medicines, setMedicines] = useState(existing?.medicines || [{ ...emptyMedicine }]);
  const [advice, setAdvice] = useState(existing?.advice || "");
  const [followUpDate, setFollowUpDate] = useState(existing?.followUpDate || "");
  const [saving, setSaving] = useState(false);
  const [exportingFhir, setExportingFhir] = useState(false);

  if (!appointment || !patient) {
    return (
      <DoctorLayout>
        <p className="text-gray-600">Appointment not found.</p>
        <Link to="/doctor/patients" className="text-teal-600 hover:underline mt-3 inline-block">
          Back to patients
        </Link>
      </DoctorLayout>
    );
  }

  const updateMedicine = (index, field, value) => {
    setMedicines((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
  };

  const addMedicineRow = () => setMedicines((prev) => [...prev, { ...emptyMedicine }]);

  const removeMedicineRow = (index) =>
    setMedicines((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!diagnosis.trim()) {
      setDiagnosisError("Diagnosis is required.");
      return;
    }
    setDiagnosisError("");
    setSaving(true);
    try {
      await savePrescription({
        appointmentId,
        patientId: patient.id,
        doctorId: appointment.doctorId,
        date: appointment.date,
        diagnosis,
        medicines: medicines.filter((m) => m.name.trim()),
        advice,
        followUpDate,
      });
      if (appointment.status === "upcoming") {
        await completeAppointment(appointment.id);
      }
      addToast("Prescription saved successfully.", "success");
      navigate("/doctor/patients");
    } catch (err) {
      addToast(err.message || "Could not save the prescription.", "error");
    } finally {
      setSaving(false);
    }
  };

  // Export the saved health record for this appointment as a FHIR resource.
  const handleExportFhir = async () => {
    const record = prescriptions.find((p) => p.appointmentId === appointmentId);
    if (!record?.id) {
      addToast("Save the prescription first to export it as FHIR.", "info");
      return;
    }
    setExportingFhir(true);
    try {
      const data = await healthRecordsApi.getHealthRecordFhir(record.id);
      const fhir = data.fhir ?? data;
      downloadJson(`health-record-${record.id}.json`, fhir);
      addToast("FHIR export downloaded.", "success");
    } catch (err) {
      addToast(err.message || "Could not export the record as FHIR.", "error");
    } finally {
      setExportingFhir(false);
    }
  };

  return (
    <DoctorLayout>
      <Link
        to="/doctor/patients"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-teal-600 mb-6"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Back to patients
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
          <img src={patient.avatar} alt={patient.name} className="w-14 h-14 rounded-full object-cover" />
          <div>
            <h1 className="font-semibold text-gray-800 text-lg">{patient.name}</h1>
            <p className="text-sm text-gray-500">
              {patient.age} yrs · {patient.gender} · {patient.bloodGroup}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Visit on {formatDate(appointment.date)} at {appointment.time}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-6">
          <div>
            <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 mb-1">
              Diagnosis
            </label>
            <textarea
              id="diagnosis"
              required
              rows={2}
              value={diagnosis}
              onChange={(e) => {
                setDiagnosis(e.target.value);
                if (diagnosisError) setDiagnosisError("");
              }}
              placeholder="e.g. Essential hypertension, well controlled"
              aria-invalid={diagnosisError ? true : undefined}
              aria-describedby={diagnosisError ? "diagnosis-error" : undefined}
              className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                diagnosisError
                  ? "border-red-300 focus:ring-red-300"
                  : "border-gray-200 focus:ring-teal-500 focus:border-teal-500"
              }`}
            />
            {diagnosisError && (
              <p id="diagnosis-error" role="alert" className="text-xs text-red-600 mt-1">
                {diagnosisError}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Medicines</label>
              <button
                type="button"
                onClick={addMedicineRow}
                className="flex items-center gap-1 text-xs font-medium text-teal-600 hover:underline"
              >
                <Plus size={13} aria-hidden="true" />
                Add Medicine
              </button>
            </div>

            <div className="space-y-3">
              {medicines.map((med, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-2 items-center"
                >
                  <input
                    type="text"
                    placeholder="Medicine name"
                    aria-label={`Medicine ${index + 1} name`}
                    value={med.name}
                    onChange={(e) => updateMedicine(index, "name", e.target.value)}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                  <input
                    type="text"
                    placeholder="Dosage"
                    aria-label={`Medicine ${index + 1} dosage`}
                    value={med.dosage}
                    onChange={(e) => updateMedicine(index, "dosage", e.target.value)}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                  <input
                    type="text"
                    placeholder="Frequency"
                    aria-label={`Medicine ${index + 1} frequency`}
                    value={med.frequency}
                    onChange={(e) => updateMedicine(index, "frequency", e.target.value)}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                  <input
                    type="text"
                    placeholder="Duration"
                    aria-label={`Medicine ${index + 1} duration`}
                    value={med.duration}
                    onChange={(e) => updateMedicine(index, "duration", e.target.value)}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeMedicineRow(index)}
                    disabled={medicines.length === 1}
                    aria-label={`Remove medicine ${index + 1}`}
                    className="text-gray-400 hover:text-red-600 disabled:opacity-30 justify-self-end sm:justify-self-center"
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="advice" className="block text-sm font-medium text-gray-700 mb-1">
              Advice / Notes
            </label>
            <textarea
              id="advice"
              rows={3}
              value={advice}
              onChange={(e) => setAdvice(e.target.value)}
              placeholder="e.g. Reduce salt intake, walk 30 minutes daily, recheck BP weekly."
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
            />
          </div>

          <div className="max-w-xs">
            <label htmlFor="followUpDate" className="block text-sm font-medium text-gray-700 mb-1">
              Follow-up Date
            </label>
            <input
              id="followUpDate"
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {existing && (
              <button
                type="button"
                onClick={handleExportFhir}
                disabled={exportingFhir}
                className="flex items-center gap-2 border border-gray-200 hover:border-teal-300 text-gray-600 hover:text-teal-600 font-medium px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exportingFhir ? (
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                ) : (
                  <FileJson size={16} aria-hidden="true" />
                )}
                Export as FHIR
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium px-6 py-2.5 rounded-xl transition-colors"
            >
              {saving ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Save size={16} aria-hidden="true" />}
              {saving ? "Saving..." : "Save Prescription"}
            </button>
          </div>
        </form>
      </div>
    </DoctorLayout>
  );
}
