import { memo } from "react";
import { Calendar, Clock, Video, MapPin } from "lucide-react";
import { formatDate } from "../../utils/helpers";

const statusStyles = {
  upcoming: "bg-teal-50 text-teal-700",
  completed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-700",
};

function AppointmentRow({ appointment, actions }) {
  // Appointments from the API embed the patient record.
  const patient = appointment.patient || {
    name: "Unknown Patient",
    avatar: "",
    age: "",
    gender: "",
  };
  if (!patient) return null;

  return (
    <article className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4">
      <img
        src={patient.avatar}
        alt={patient.name}
        loading="lazy"
        className="w-12 h-12 rounded-full object-cover shrink-0"
      />

      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-800 text-sm">{patient.name}</h4>
        <p className="text-xs text-gray-500">
          {patient.age} yrs · {patient.gender}
        </p>
        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar size={13} aria-hidden="true" />
            {formatDate(appointment.date)}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={13} aria-hidden="true" />
            {appointment.time}
          </span>
          <span className="flex items-center gap-1 capitalize">
            {appointment.type === "video" ? (
              <Video size={13} aria-hidden="true" />
            ) : (
              <MapPin size={13} aria-hidden="true" />
            )}
            {appointment.type === "video" ? "Video" : "In-person"}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusStyles[appointment.status]}`}
        >
          {appointment.status}
        </span>
        {actions && <div className="flex gap-2 flex-wrap justify-end">{actions}</div>}
      </div>
    </article>
  );
}

export default memo(AppointmentRow);
