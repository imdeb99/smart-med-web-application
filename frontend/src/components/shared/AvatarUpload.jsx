import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import Avatar from "./Avatar";

/**
 * AvatarUpload — circular avatar preview + "change photo" control.
 * Calls `onUpload(file)` and expects it to resolve with the new avatar URL
 * (or reject with an Error whose message is shown as an inline error).
 *
 * @param {string} name            person's name (for the initials fallback)
 * @param {string} [src]           current avatar URL
 * @param {(file: File) => Promise<string>} onUpload  upload handler
 * @param {string} [sizeClass]     e.g. "w-24 h-24"
 * @param {string} [buttonLabel]   default "Change Photo"
 */
export default function AvatarUpload({ name, src, onUpload, sizeClass = "w-24 h-24", buttonLabel = "Change Photo" }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;

    setError("");
    setUploading(true);
    try {
      const newUrl = await onUpload(file);
      if (newUrl) {
        // Force the preview to the new URL. Avatar re-renders from the parent's
        // state (the caller updates its own src), so nothing to do here.
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload the image.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <Avatar name={name} src={src} className={`${sizeClass} text-xl`} />
        {uploading && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
            <Loader2 size={20} className="animate-spin text-white" aria-hidden="true" />
          </span>
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          aria-label={`${buttonLabel} for ${name}`}
          className="absolute bottom-0 right-0 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white rounded-full p-1.5 shadow-sm transition-colors"
        >
          <Camera size={14} aria-hidden="true" />
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleChange}
        aria-hidden="true"
        tabIndex={-1}
      />
      {error && (
        <p role="alert" className="text-xs text-red-600 max-w-48 text-center">
          {error}
        </p>
      )}
    </div>
  );
}
