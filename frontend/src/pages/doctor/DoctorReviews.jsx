import { useEffect, useMemo, useState } from "react";
import { Star, MessagesSquare, Loader2 } from "lucide-react";
import DoctorLayout from "../../components/doctor/DoctorLayout";
import EmptyState from "../../components/shared/EmptyState";
import reviewsApi from "../../api/reviews";
import { mapReviewsListFromApi } from "../../api/adapters";
import { useDoctors } from "../../context/DoctorsContext";

export default function DoctorReviews() {
  const { currentDoctor } = useDoctors();
  const doctor = currentDoctor || { rating: 0, reviewsCount: 0 };
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  // The reviews endpoint returns an aggregate summary — use it for the rating
  // display (doctor records have no rating fields).
  const [summary, setSummary] = useState(null);
  const displayRating = Number(summary?.averageRating || doctor.rating);
  const displayCount = summary?.totalReviews ?? doctor.reviewsCount;

  // Load the logged-in doctor's reviews from the real API. The backend scopes
  // nothing here (public endpoint), so filter by the current doctor's id.
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await reviewsApi.getReviewsByDoctor(currentDoctor.id, { limit: 100 });
        if (!cancelled) {
          const mapped = mapReviewsListFromApi(data);
          setReviews(
            mapped.reviews.filter((r) => r.doctorId === currentDoctor.id),
          );
          setSummary(mapped.summary);
        }
      } catch (err) {
        if (!cancelled) {
          setReviews([]);
          setSummary(null);
          setError(err instanceof Error ? err.message : "Failed to load reviews.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    if (currentDoctor?.id) load();
    else {
      setIsLoading(false);
    }
    return () => {
      cancelled = true;
    };
  }, [currentDoctor?.id]);

  const distribution = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      counts[r.rating] = (counts[r.rating] || 0) + 1;
    });
    return counts;
  }, [reviews]);

  const total = reviews.length;

  return (
    <DoctorLayout>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Reviews</h1>
      <p className="text-gray-500 mb-6">See what your patients are saying about you.</p>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center justify-center text-center">
          <p className="text-4xl font-bold text-gray-800">{displayRating}</p>
          <div className="flex items-center gap-1 mt-1" aria-label={`Rated ${displayRating} out of 5`}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                size={16}
                aria-hidden="true"
                className={
                  i <= Math.round(displayRating)
                    ? "text-amber-400 fill-amber-400"
                    : "text-gray-200"
                }
              />
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">Based on {displayCount} total reviews</p>
        </div>

        <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Rating Distribution</h3>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = distribution[star] || 0;
              const percent = total ? (count / total) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3 text-xs">
                  <span className="w-8 text-gray-500 shrink-0">{star} ★</span>
                  <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-6 text-gray-400 shrink-0">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-gray-400">
          <Loader2 size={20} className="animate-spin text-teal-600" aria-hidden="true" />
          <span className="text-sm">Loading reviews...</span>
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <EmptyState
            icon={MessagesSquare}
            title="Could not load reviews"
            message={error}
          />
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <EmptyState
            icon={MessagesSquare}
            title="No reviews yet"
            message="Reviews from your patients will show up here once they complete consultations."
          />
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
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
    </DoctorLayout>
  );
}
