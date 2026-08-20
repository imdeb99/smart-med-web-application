import { useState } from "react";
import { CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import DeleteConfirm from "../../components/shared/DeleteConfirm";
import { useDoctors } from "../../context/DoctorsContext";
import { useToast } from "../../context/ToastContext";

export default function DoctorVerification() {
  const { doctors, approveDoctor, deleteDoctor } = useDoctors();
  const { addToast } = useToast();
  const [rejectTarget, setRejectTarget] = useState(null);

  const pending = doctors.filter((d) => !d.verified);

  const handleApprove = (doctor) => {
    approveDoctor(doctor.id);
    addToast(`${doctor.name} has been verified.`, "success");
  };

  const confirmReject = () => {
    deleteDoctor(rejectTarget.id);
    addToast(`${rejectTarget.name}'s application was rejected.`, "info");
    setRejectTarget(null);
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Doctor Verification</h1>
      <p className="text-gray-500 mb-8">
        Review BMDC registration details and approve or reject pending doctor applications.
      </p>

      {pending.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-gray-400 flex flex-col items-center gap-2">
          <ShieldCheck size={32} className="text-emerald-400" aria-hidden="true" />
          <p className="text-gray-600 font-medium">No pending doctor verifications</p>
          <p className="text-sm">All doctor applications have been reviewed.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map((doctor) => (
            <div
              key={doctor.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <img src={doctor.avatar} alt={doctor.name} loading="lazy" className="w-14 h-14 rounded-full object-cover shrink-0" />

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800">{doctor.name}</h3>
                <p className="text-sm text-teal-600">{doctor.specialty}</p>
                <p className="text-xs text-gray-500 mt-1">{doctor.qualifications}</p>
                <div className="flex flex-wrap gap-4 text-xs text-gray-500 mt-2">
                  <span>BMDC ID: {doctor.bmdcId}</span>
                  <span>{doctor.experienceYears} yrs experience</span>
                  <span>{doctor.location}</span>
                </div>
              </div>

              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => handleApprove(doctor)}
                  className="flex items-center gap-1.5 text-xs font-medium bg-emerald-600 text-white px-3.5 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <CheckCircle2 size={14} aria-hidden="true" />
                  Approve
                </button>
                <button
                  onClick={() => setRejectTarget(doctor)}
                  className="flex items-center gap-1.5 text-xs font-medium border border-red-200 text-red-600 px-3.5 py-2 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <XCircle size={14} aria-hidden="true" />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <DeleteConfirm
        isOpen={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        title="Reject Application"
        message={`Are you sure you want to reject ${rejectTarget?.name}'s application? This will remove them from the platform.`}
        onConfirm={confirmReject}
      />
    </AdminLayout>
  );
}
