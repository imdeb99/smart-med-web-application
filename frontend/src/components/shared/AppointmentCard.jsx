import { memo } from "react";
import { Calendar, Clock, Video, MapPin, BadgeCheck, FileDown } from "lucide-react";
import { formatDate } from "../../utils/helpers";

const statusStyles = {
  upcoming: "bg-teal-50 text-teal-700",
  completed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-700",
};

function AppointmentCard({ appointment, onCancel, onReschedule, onJoin, onDownload }) {
  // Appointments from the API embed the doctor; fall back to the appointment's
  // own fields so the card never renders empty.
  const doctor = appointment.doctor || {
    name: "Unknown Doctor",
    specialty: "",
    avatar: "",
    verified: false,
  };
  if (!doctor) return null;

  // Capacity bookings have a ticket; legacy slot bookings don't (no token).
  const hasTicket = Boolean(appointment.dailyCapacityId);
  const hasActions = appointment.status === "upcoming" && (onCancel || onReschedule || onJoin || (hasTicket && onDownload));

  return (
    <article className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4">
      <img
        src={doctor.avatar}
        alt={doctor.name}
        loading="lazy"
        className="w-14 h-14 rounded-full object-cover shrink-0"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <h4 className="font-semibold text-gray-800 truncate">{doctor.name}</h4>
          {doctor.verified && (
            <BadgeCheck size={14} className="text-emerald-500 shrink-0" aria-label="Verified doctor" />
          )}
        </div>
        <p className="text-sm text-teal-600">{doctor.specialty}</p>
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
            {appointment.type === "video" ? "Video Call" : "In-person"}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusStyles[appointment.status]}`}
        >
          {appointment.status}
        </span>

        {appointment.tokenNumber != null && (
          <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full">
            Token #{appointment.tokenNumber}
          </span>
        )}

        {hasActions && (
          <div className="flex gap-2 flex-wrap justify-end">
            {appointment.type === "video" && onJoin && (
              <button
                onClick={() => onJoin(appointment)}
                className="text-xs font-medium bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700 transition-colors"
              >
                Join Call
              </button>
            )}
            {onReschedule && (
              <button
                onClick={() => onReschedule(appointment)}
                className="text-xs font-medium border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:border-teal-300 transition-colors"
              >
                Reschedule
              </button>
            )}
            {hasTicket && onDownload && (
              <button
                onClick={() => onDownload(appointment)}
                className="text-xs font-medium border border-teal-200 text-teal-700 px-3 py-1.5 rounded-lg hover:bg-teal-50 transition-colors"
              >
                <FileDown size={12} className="inline mr-1" aria-hidden="true" />
                Download PDF
              </button>
            )}
            {onCancel && (
              <button
                onClick={() => onCancel(appointment)}
                className="text-xs font-medium border border-red-200 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default memo(AppointmentCard);
