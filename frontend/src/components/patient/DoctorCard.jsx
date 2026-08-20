import { memo } from "react";
import { Link } from "react-router-dom";
import { Star, BadgeCheck, MapPin } from "lucide-react";

function DoctorCard({ doctor }) {
  return (
    <article className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col">
      <div className="flex items-center gap-4">
        <img
          src={doctor.avatar}
          alt={doctor.name}
          loading="lazy"
          className="w-16 h-16 rounded-full object-cover bg-teal-50"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold text-gray-800 truncate">{doctor.name}</h3>
            {doctor.verified && (
              <BadgeCheck size={16} className="text-emerald-500 shrink-0" aria-label="Verified doctor" />
            )}
          </div>
          <p className="text-sm text-teal-600">{doctor.specialty}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <Star size={14} className="text-amber-400 fill-amber-400" aria-hidden="true" />
          {doctor.rating} ({doctor.reviewsCount})
        </span>
        <span className="flex items-center gap-1 min-w-0">
          <MapPin size={14} className="shrink-0" aria-hidden="true" />
          <span className="truncate">{doctor.location}</span>
        </span>
      </div>

      <div className="flex items-center justify-between mt-5 gap-3">
        <span className="text-sm text-gray-600 shrink-0">{doctor.experienceYears}+ yrs exp</span>
        <Link
          to={`/patient/doctors/${doctor.id}`}
          className="text-sm font-medium bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors shrink-0"
        >
          View Profile
        </Link>
      </div>
    </article>
  );
}

export default memo(DoctorCard);
