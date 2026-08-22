import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  BadgeCheck,
  Star,
  MapPin,
  Briefcase,
  Languages,
  Calendar,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { useDoctors } from "../../context/DoctorsContext";
import reviewsApi from "../../api/reviews";
import { mapReviewsListFromApi } from "../../api/adapters";
import EmptyState from "../../components/shared/EmptyState";
import Avatar from "../../components/shared/Avatar";

export default function DoctorProfile() {
  const { id } = useParams();
  const { getDoctorById } = useDoctors();
  const [doctor, setDoctor] = useState(null);
  const [doctorLoading, setDoctorLoading] = useState(true);
  const [doctorError, setDoctorError] = useState("");
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  // Backend doctor records have no rating fields; the reviews endpoint returns
  // an aggregate summary we use for the rating display instead.
  const [reviewSummary, setReviewSummary] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setDoctorLoading(true);
      setDoctorError("");
      const result = await getDoctorById(id);
      if (cancelled) return;
      if (result) {
        setDoctor(result);
      } else {
        setDoctorError("Doctor not found.");
      }
      setDoctorLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id, getDoctorById]);

  useEffect(() => {
    let cancelled = false;

    const loadReviews = async () => {
      setReviewsLoading(true);
      try {
        const data = await reviewsApi.getReviewsByDoctor(id, { limit: 50 });
        if (!cancelled) {
          const mapped = mapReviewsListFromApi(data);
          setReviews(mapped.reviews);
          setReviewSummary(mapped.summary);
        }
      } catch {
        if (!cancelled) {
          setReviews([]);
          setReviewSummary(null);
        }
      } finally {
        if (!cancelled) setReviewsLoading(false);
      }
    };

    loadReviews();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (doctorLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-teal-600" aria-hidden="true" />
      </div>
    );
  }

  if (doctorError || !doctor) {
    return (
      <div className="text-center py-24 px-4">
        <p className="text-gray-600">{doctorError || "Doctor not found."}</p>
        <Link to="/patient/doctors" className="text-teal-600 hover:underline mt-3 inline-block">
          Back to doctor listing
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to="/patient/doctors"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-teal-600 mb-6"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Back to search
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row gap-6">
          <Avatar name={doctor.name} src={doctor.avatar} className="w-28 h-28 text-3xl" />

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-800">{doctor.name}</h1>
              {doctor.verified ? (
                <span className="flex items-center gap-1 text-xs font-medium bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">
                  <BadgeCheck size={13} aria-hidden="true" />
                  BMDC Verified
                </span>
              ) : (
                <span className="text-xs font-medium bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full">
                  Verification Pending
                </span>
              )}
            </div>
            <p className="text-teal-600 font-medium mt-1">{doctor.specialty}</p>
            <p className="text-sm text-gray-500 mt-1">{doctor.qualifications}</p>

            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <Star size={15} className="text-amber-400 fill-amber-400" aria-hidden="true" />
                {reviewSummary?.averageRating ?? doctor.rating} (
                {reviewSummary?.totalReviews ?? doctor.reviewsCount} reviews)
              </span>
              <span className="flex items-center gap-1.5">
                <Briefcase size={15} aria-hidden="true" />
                {doctor.experienceYears}+ years experience
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={15} aria-hidden="true" />
                {doctor.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Languages size={15} aria-hidden="true" />
                {doctor.languages.join(", ") || "—"}
              </span>
            </div>

            <p className="text-xs text-gray-400 mt-3">BMDC Reg. No: {doctor.bmdcId}</p>
          </div>

          <div className="sm:w-48 shrink-0 flex flex-col gap-3">
            <div className="bg-teal-50 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500">Consultation Fee</p>
              <p className="text-xl font-bold text-teal-700">৳{doctor.fee}</p>
            </div>
            <Link
              to={`/patient/book/${doctor.id}`}
              className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 rounded-xl transition-colors"
            >
              <Calendar size={16} aria-hidden="true" />
              Book Now
            </Link>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-6">
        <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">About</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{doctor.bio || "No bio available yet."}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Available Slots Today</h2>
          {doctor.availableSlots.length === 0 ? (
            <p className="text-sm text-gray-400">
              Availability is not configured yet — booking falls back to standard time slots.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {doctor.availableSlots.map((slot) => (
                <span
                  key={slot}
                  className="text-xs font-medium bg-teal-50 text-teal-700 px-3 py-1.5 rounded-lg"
                >
                  {slot}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 mt-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-5">
          Patient Reviews ({reviewsLoading ? "…" : reviews.length})
        </h2>

        {reviewsLoading ? (
          <p className="text-sm text-gray-400">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <EmptyState
            icon={Star}
            title="No reviews yet"
            message="Reviews from patients will appear here after completed consultations."
          />
        ) : (
          <div className="space-y-5">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-100 last:border-0 pb-5 last:pb-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-800 text-sm">{review.patientName}</p>
                  <span className="flex items-center gap-1 text-xs text-amber-500">
                    <Star size={13} className="fill-amber-400 text-amber-400" aria-hidden="true" />
                    {review.rating}.0
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{review.date}</p>
                <p className="text-sm text-gray-600 mt-2">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
