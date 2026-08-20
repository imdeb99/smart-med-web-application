import { useState } from "react";
import { Link2, Copy, Check, MessageCircle, Send, X } from "lucide-react";
import { useToast } from "../../context/ToastContext";

// Opens a small share panel with a copy-link action and WhatsApp/Facebook
// share buttons, all targeting the current page URL.
export default function ShareMenu({ onClose }) {
  const [copied, setCopied] = useState(false);
  const { addToast } = useToast();

  const url = typeof window !== "undefined" ? window.location.href : "";
  const text = "Check out SMART-MED — telemedicine made simple.";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      addToast("Link copied to clipboard.", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast("Could not copy link.", "error");
    }
  };

  const waShare = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
  const fbShare = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  const shareButtons = [
    { label: "WhatsApp", href: waShare, icon: MessageCircle, color: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" },
    { label: "Facebook", href: fbShare, icon: Send, color: "bg-blue-50 text-blue-600 hover:bg-blue-100" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Share"
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4 gap-4">
          <h3 className="text-lg font-semibold text-gray-800">Share</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close share panel"
            className="text-gray-400 hover:text-gray-600 shrink-0 rounded-lg p-1 hover:bg-gray-100 transition-colors"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 mb-4">
          <Link2 size={16} className="text-gray-400 shrink-0" aria-hidden="true" />
          <p className="text-xs text-gray-600 truncate flex-1">{url}</p>
          <button
            type="button"
            onClick={copyLink}
            className="flex items-center gap-1 text-xs font-medium text-teal-600 hover:underline shrink-0"
          >
            {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {shareButtons.map(({ label, href, icon: Icon, color }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${color}`}
            >
              <Icon size={16} aria-hidden="true" />
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
