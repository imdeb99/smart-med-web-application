import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FileText, History, Users } from "lucide-react";
import DoctorLayout from "../../components/doctor/DoctorLayout";
import Modal from "../../components/shared/Modal";
import EmptyState from "../../components/shared/EmptyState";
import { useAppointments } from "../../context/AppointmentsContext";
import { usePatients } from "../../context/PatientsContext";
import { DEMO_DOCTOR_ID } from "../../utils/constants";
import { formatDate } from "../../utils/helpers";

export default function DoctorPatients() {
  const { appointments } = useAppointments();
  const { patients: allPatients } = usePatients();
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const navigate = useNavigate();

  const myAppointments = appointments.filter((a) => a.doctorId === DEMO_DOCTOR_ID);

  const patients = useMemo(() => {
    const byPatient = {};
    myAppointments.forEach((a) => {
      if (!byPatient[a.patientId]) byPatient[a.patientId] = [];
      byPatient[a.patientId].push(a);
    });

    return Object.entries(byPatient)
      .map(([patientId, visits]) => {
        const patient = allPatients.find((p) => p.id === patientId);
        if (!patient) return null;
        const sorted = [...visits].sort((a, b) => new Date(b.date) - new Date(a.date));
        return { patient, visits: sorted, lastVisit: sorted[0] };
      })
      .filter(Boolean)
      .filter((p) => p.patient.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(b.lastVisit.date) - new Date(a.lastVisit.date));
  }, [myAppointments, allPatients, search]);

  return (
    <DoctorLayout>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Patients</h1>
      <p className="text-gray-500 mb-6">Patients who have booked appointments with you.</p>

      <div className="relative mb-6 max-w-sm">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
        <label htmlFor="patient-search" className="sr-only">
          Search patients by name
        </label>
        <input
          id="patient-search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search patient by name"
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
        />
      </div>

      {patients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <EmptyState
            icon={Users}
            title={search ? "No patients match your search" : "No patients yet"}
            message={
              search
                ? "Try a different name."
                : "Patients who book appointments with you will appear here."
            }
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">List of patients and their visit history</caption>
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase border-b border-gray-100">
                <th scope="col" className="px-5 py-3 font-medium">Patient</th>
                <th scope="col" className="px-5 py-3 font-medium">Age / Gender</th>
                <th scope="col" className="px-5 py-3 font-medium">Blood Group</th>
                <th scope="col" className="px-5 py-3 font-medium">Last Visit</th>
                <th scope="col" className="px-5 py-3 font-medium">Total Visits</th>
                <th scope="col" className="px-5 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(({ patient, visits, lastVisit }) => (
                <tr key={patient.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={patient.avatar}
                        alt={patient.name}
                        loading="lazy"
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      <span className="font-medium text-gray-800">{patient.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {patient.age} / {patient.gender}
                  </td>
                  <td className="px-5 py-3 text-gray-600">{patient.bloodGroup}</td>
                  <td className="px-5 py-3 text-gray-600">{formatDate(lastVisit.date)}</td>
                  <td className="px-5 py-3 text-gray-600">{visits.length}</td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => setSelectedPatient({ patient, visits })}
                      className="flex items-center gap-1.5 text-xs font-medium text-teal-600 hover:underline"
                    >
                      <History size={13} aria-hidden="true" />
                      View History
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={!!selectedPatient}
        onClose={() => setSelectedPatient(null)}
        title={selectedPatient ? `${selectedPatient.patient.name} — Visit History` : ""}
        size="lg"
      >
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {selectedPatient?.visits.map((visit) => (
            <div key={visit.id} className="border border-gray-100 rounded-xl p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-800">{formatDate(visit.date)}</span>
                <span className="text-xs text-gray-500 capitalize">{visit.time}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 capitalize">
                {visit.type === "video" ? "Video Call" : "In-person"} · {visit.status}
              </p>
              {visit.notes && <p className="text-sm text-gray-600 mt-2">{visit.notes}</p>}
              <button
                onClick={() => navigate(`/doctor/prescriptions/${visit.id}`)}
                className="flex items-center gap-1.5 text-xs font-medium text-teal-600 hover:underline mt-3"
              >
                <FileText size={13} aria-hidden="true" />
                Write / View Prescription
              </button>
            </div>
          ))}
        </div>
      </Modal>
    </DoctorLayout>
  );
}
