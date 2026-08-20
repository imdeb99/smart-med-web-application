export default function PageSkeleton({ cards = 3, rows = 5 }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      <div className="h-8 w-56 bg-gray-200 rounded-lg mb-2" />
      <div className="h-4 w-80 max-w-full bg-gray-200 rounded mb-8" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="h-10 w-10 bg-gray-200 rounded-xl mb-3" />
            <div className="h-6 w-16 bg-gray-200 rounded mb-1" />
            <div className="h-3 w-24 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {Array.from({ length: cards }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full shrink-0" />
              <div className="flex-1">
                <div className="h-4 w-40 bg-gray-200 rounded mb-2" />
                <div className="h-3 w-56 bg-gray-200 rounded" />
              </div>
              <div className="hidden sm:block h-4 w-16 bg-gray-200 rounded-full" />
            </div>
            {rows > 0 && (
              <div className="mt-4 space-y-2">
                {Array.from({ length: rows }).map((_, j) => (
                  <div key={j} className="h-3 bg-gray-200 rounded" />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
