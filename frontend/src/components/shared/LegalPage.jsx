import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

// Shared shell for static legal/content pages (Terms, Privacy). Keeps the
// same container width, typography and spacing as the rest of the app.
export default function LegalPage({ title, updatedOn, sections }) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-teal-600 mb-6"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Back to Home
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-1">{title}</h1>
        {updatedOn && <p className="text-xs text-gray-400 mb-6">Last updated: {updatedOn}</p>}

        <div className="space-y-6">
          {sections.map(({ heading, body }) => (
            <section key={heading}>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">{heading}</h2>
              {typeof body === "string" ? (
                <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
              ) : (
                <div className="space-y-2">
                  {body.map((paragraph, i) => (
                    <p key={i} className="text-sm text-gray-600 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>

        <div className="mt-8 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm">
          [Placeholder — replace with actual legal text. This page is a demo template and is not
          legally binding.]
        </div>
      </div>
    </div>
  );
}
