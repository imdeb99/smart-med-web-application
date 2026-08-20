import { useEffect } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

const config = {
  success: {
    icon: CheckCircle2,
    classes: "bg-emerald-50 border-emerald-200 text-emerald-700",
  },
  error: {
    icon: XCircle,
    classes: "bg-red-50 border-red-200 text-red-700",
  },
  info: {
    icon: Info,
    classes: "bg-teal-50 border-teal-200 text-teal-700",
  },
};

export default function Toast({ message, type = "info", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const { icon: Icon, classes } = config[type] || config.info;

  return (
    <div
      className={`flex items-center gap-2 min-w-65 max-w-sm border rounded-xl px-4 py-3 shadow-lg animate-in ${classes}`}
      role="alert"
    >
      <Icon size={18} className="shrink-0" />
      <p className="text-sm font-medium flex-1">{message}</p>
      <button
        onClick={onClose}
        aria-label="Dismiss notification"
        className="text-current opacity-60 hover:opacity-100 shrink-0"
      >
        <X size={16} />
      </button>
    </div>
  );
}
