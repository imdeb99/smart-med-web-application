export default function Loader({ size = 32, className = "" }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className="animate-spin rounded-full border-4 border-teal-100 border-t-teal-600"
        style={{ width: size, height: size }}
      />
    </div>
  );
}
