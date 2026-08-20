export default function RouteFallback() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]" role="status" aria-label="Loading page">
      <div className="animate-spin rounded-full border-4 border-teal-100 border-t-teal-600 w-10 h-10" />
    </div>
  );
}
