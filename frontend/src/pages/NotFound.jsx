import { Link } from "react-router-dom";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 px-4 min-h-[calc(100vh-8rem)]">
      <h1 className="text-6xl font-bold text-teal-600">404</h1>
      <p className="text-gray-600 mt-3 text-lg">Oops, this page doesn't exist.</p>
      <Link
        to="/"
        className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium px-6 py-3 rounded-xl mt-6 transition-colors"
      >
        <Home size={18} />
        Back to Home
      </Link>
    </div>
  );
}
