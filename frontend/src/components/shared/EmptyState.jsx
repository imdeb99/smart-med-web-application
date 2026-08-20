import { Inbox } from "lucide-react";

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  message,
  action,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center px-6 py-14 text-gray-400 ${className}`}
    >
      <div className="bg-gray-100 text-gray-400 rounded-full p-4 mb-4">
        <Icon size={28} />
      </div>
      <p className="text-base font-medium text-gray-600">{title}</p>
      {message && <p className="text-sm mt-1 max-w-sm">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
