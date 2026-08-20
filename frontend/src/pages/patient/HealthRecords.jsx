import { useMemo, useState } from "react";
import { FileText, Download, Search, FileHeart } from "lucide-react";
import { useAppointments } from "../../context/AppointmentsContext";
import { DEMO_PATIENT_ID } from "../../utils/constants";
import { useDoctors } from "../../context/DoctorsContext";
import { useToast } from "../../context/ToastContext";
import { formatDate } from "../../utils/helpers";
import EmptyState from "../../components/shared/EmptyState";

export default function HealthRecords() {
  const { appointments } = useAppointments();
  const { getDoctorById } = useDoctors();
  const { addToast } = useToast();
  const [search, setSearch] = useState("");

  const records = useMemo(() => {
    return appointments
      .filter((a) => a.patientId === DEMO_PATIENT_ID && a.status === "completed")
      .map((a) => ({ ...a, doctor: getDoctorById(a.doctorId) }))
      .filter((r) => r.doctor)
      .filter(
        (r) =>
          r.doctor.name.toLowerCase().includes(search.toLowerCase()) ||
          r.doctor.specialty.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [appointments, getDoctorById, search]);

  const handleDownload = (record) => {
    addToast(`Downloading record from ${formatDate(record.date)} (demo).`, "info");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Digital Health Records</h1>
      <p className="text-gray-500 mb-6">
        A timeline of your past visits, prescriptions, and consultation notes.
      </p>

      <div className="relative mb-8">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
        <label htmlFor="records-search" className="sr-only">
          Search records by doctor or specialty
        </label>
        <input
          id="records-search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by doctor or specialty"
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm bg-white"
        />
      </div>

      {records.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <EmptyState
            icon={FileHeart}
            title="No health records found"
            message={
              search
                ? "Nothing matches your search. Try a different doctor or specialty."
                : "Completed consultations will appear here as digital records."
            }
          />
        </div>
      ) : (
        <div className="relative border-l-2 border-teal-100 ml-3">
          {records.map((record) => (
            <div key={record.id} className="relative pl-8 pb-8 last:pb-0">
              <span className="absolute -left-2.25 top-1 w-4 h-4 rounded-full bg-teal-600 border-4 border-white" />
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={record.doctor.avatar}
                      alt={record.doctor.name}
                      loading="lazy"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{record.doctor.name}</p>
                      <p className="text-xs text-teal-600">{record.doctor.specialty}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(record.date)}</span>
                </div>

                <div className="flex items-start gap-2 mt-4 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                  <FileText size={16} className="text-gray-400 mt-0.5 shrink-0" aria-hidden="true" />
                  {record.notes || "No additional notes recorded for this visit."}
                </div>

                <button
                  onClick={() => handleDownload(record)}
                  className="flex items-center gap-1.5 text-xs font-medium text-teal-600 hover:underline mt-4"
                >
                  <Download size={14} aria-hidden="true" />
                  Download Prescription
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
