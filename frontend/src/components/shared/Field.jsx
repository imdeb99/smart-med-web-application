const baseControlClass =
  "w-full px-4 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2";

function controlClasses({ error, className }) {
  return `${baseControlClass} ${
    error
      ? "border-red-300 focus:ring-red-300 focus:border-red-400"
      : "border-gray-200 focus:ring-teal-500 focus:border-teal-500"
  } ${className || ""}`;
}

function FieldError({ id, error }) {
  if (!error) return null;
  return (
    <p id={id} role="alert" className="text-xs text-red-600 mt-1">
      {error}
    </p>
  );
}

export function Input({
  label,
  error,
  id,
  className = "",
  icon: Icon,
  ...props
}) {
  const fieldId = id || props.name;
  return (
    <div>
      {label && (
        <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            aria-hidden="true"
          />
        )}
        <input
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          className={`${controlClasses({ error, className })} ${Icon ? "pl-10" : ""}`}
          {...props}
        />
      </div>
      <FieldError id={`${fieldId}-error`} error={error} />
    </div>
  );
}

export function Select({ label, error, id, className = "", children, ...props }) {
  const fieldId = id || props.name;
  return (
    <div>
      {label && (
        <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <select
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className={controlClasses({ error, className })}
        {...props}
      >
        {children}
      </select>
      <FieldError id={`${fieldId}-error`} error={error} />
    </div>
  );
}

export function Textarea({ label, error, id, className = "", ...props }) {
  const fieldId = id || props.name;
  return (
    <div>
      {label && (
        <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <textarea
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className={controlClasses({ error, className })}
        {...props}
      />
      <FieldError id={`${fieldId}-error`} error={error} />
    </div>
  );
}
