import { Loader2 } from "lucide-react";
import Modal from "./Modal";

// Shared "are you sure?" modal with a red destructive confirm button.
export default function DeleteConfirm({ isOpen, onClose, title, message, onConfirm, isDeleting = false, confirmLabel = "Remove" }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white rounded-lg"
          >
            {isDeleting && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
            {isDeleting ? "Working..." : confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm text-gray-600">{message}</p>
    </Modal>
  );
}
