import { NavLink } from "react-router-dom";

export default function Sidebar({ title, items }) {
  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-gray-100 py-8 px-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 mb-3">
        {title}
      </p>
      <nav className="flex flex-col gap-1">
        {items.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive ? "bg-teal-50 text-teal-700" : "text-gray-600 hover:bg-gray-100"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
