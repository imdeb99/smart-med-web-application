import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, Stethoscope } from "lucide-react";
import { useDoctors } from "../../context/DoctorsContext";
import DoctorCard from "../../components/patient/DoctorCard";
import EmptyState from "../../components/shared/EmptyState";
import LoadingSkeleton from "../../components/shared/LoadingSkeleton";

const ratingOptions = [
  { label: "Any Rating", value: 0 },
  { label: "4.0 & above", value: 4 },
  { label: "4.5 & above", value: 4.5 },
];

const sortOptions = [
  { label: "Highest Rated", value: "rating" },
  { label: "Most Experienced", value: "experience" },
  { label: "Lowest Fee", value: "fee" },
];

// Specialty list derived from the real doctor data (the backend has no
// standalone specialty catalog endpoint).
function getSpecialties(doctors) {
  return [...new Set(doctors.map((d) => d.specialty).filter(Boolean))].sort();
}

export default function DoctorListing() {
  const { doctors, isLoading, error } = useDoctors();
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("All");
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("rating");

  const specialties = useMemo(() => getSpecialties(doctors), [doctors]);

  const filteredDoctors = useMemo(() => {
    let result = doctors.filter((doc) => doc.verified).filter((doc) => {
      const matchesSearch =
        doc.name.toLowerCase().includes(search.toLowerCase()) ||
        doc.specialty.toLowerCase().includes(search.toLowerCase());
      const matchesSpecialty = specialty === "All" || doc.specialty === specialty;
      const matchesRating = doc.rating >= minRating;
      return matchesSearch && matchesSpecialty && matchesRating;
    });

    result = [...result].sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "experience") return b.experienceYears - a.experienceYears;
      if (sortBy === "fee") return a.fee - b.fee;
      return 0;
    });

    return result;
  }, [doctors, search, specialty, minRating, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Find a Doctor</h1>
        <p className="text-gray-500 mt-2">
          Browse {doctors.filter((d) => d.verified).length} verified specialists and book an appointment in minutes.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative lg:col-span-1 sm:col-span-2">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <label htmlFor="doctor-search" className="sr-only">
            Search by name or specialty
          </label>
          <input
            id="doctor-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or specialty"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
          />
        </div>

        <label htmlFor="specialty-filter" className="sr-only">
          Filter by specialty
        </label>
        <select
          id="specialty-filter"
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
        >
          <option value="All">All Specialties</option>
          {specialties.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <label htmlFor="rating-filter" className="sr-only">
          Minimum rating
        </label>
        <select
          id="rating-filter"
          value={minRating}
          onChange={(e) => setMinRating(Number(e.target.value))}
          className="px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
        >
          {ratingOptions.map((opt) => (
            <option key={opt.label} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <label htmlFor="sort-filter" className="sr-only">
          Sort doctors
        </label>
        <select
          id="sort-filter"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <p className="text-sm text-gray-500 mb-4 flex items-center gap-1.5" aria-live="polite">
        <SlidersHorizontal size={14} aria-hidden="true" />
        {isLoading ? "Loading doctors..." : `${filteredDoctors.length} doctor${filteredDoctors.length !== 1 && "s"} found`}
      </p>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <LoadingSkeleton className="h-16 w-16 rounded-full" />
              <LoadingSkeleton className="h-4 w-3/4" />
              <LoadingSkeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <EmptyState
            icon={Stethoscope}
            title="Could not load doctors"
            message={error}
          />
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <EmptyState
            icon={Stethoscope}
            title="No doctors match your filters"
            message="Try adjusting your search terms or clearing the specialty filter."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      )}
    </div>
  );
}
