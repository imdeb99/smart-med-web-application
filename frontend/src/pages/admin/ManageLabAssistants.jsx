import { useState } from "react";
import { Plus, Pencil, Trash2, FlaskConical } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import Modal from "../../components/shared/Modal";
import TableShell from "../../components/shared/TableShell";
import DeleteConfirm from "../../components/shared/DeleteConfirm";
import { Input } from "../../components/shared/Field";
import { useToast } from "../../context/ToastContext";
import useFormValidation, { validators } from "../../hooks/useFormValidation";
import mockLabAssistants from "../../data/mockLabAssistants";

const STORAGE_KEY = "smartmed_lab_assistants";
const emptyForm = { name: "", phone: "", zone: "" };

function loadLabAssistants() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : mockLabAssistants;
  } catch {
    return mockLabAssistants;
  }
}

export default function ManageLabAssistants() {
  const [assistants, setAssistants] = useState(loadLabAssistants);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { addToast } = useToast();

  const { values, errors, touched, submitting, setValues, handleChange, handleBlur, handleSubmit, reset } =
    useFormValidation(emptyForm, {
      name: validators.required,
      phone: validators.phone,
      zone: validators.required,
    });

  const persist = (next) => {
    setAssistants(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const openAddForm = () => {
    setEditingId(null);
    reset();
    setFormOpen(true);
  };

  const openEditForm = (assistant) => {
    setEditingId(assistant.id);
    setValues({ name: assistant.name, phone: assistant.phone, zone: assistant.zone });
    setFormOpen(true);
  };

  const onSubmit = async (form) => {
    if (editingId) {
      persist(assistants.map((a) => (a.id === editingId ? { ...a, ...form } : a)));
      addToast("Lab assistant updated.", "success");
    } else {
      const newAssistant = {
        id: `lab-${Date.now()}`,
        status: "active",
        testsCollected: 0,
        ...form,
      };
      persist([newAssistant, ...assistants]);
      addToast("Lab assistant added.", "success");
    }
    setFormOpen(false);
  };

  const toggleStatus = (assistant) => {
    persist(
      assistants.map((a) =>
        a.id === assistant.id
          ? { ...a, status: a.status === "active" ? "inactive" : "active" }
          : a
      )
    );
  };

  const confirmDelete = () => {
    persist(assistants.filter((a) => a.id !== deleteTarget.id));
    addToast(`${deleteTarget.name} was removed.`, "info");
    setDeleteTarget(null);
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Lab Assistants</h1>
          <p className="text-gray-500 mt-2">Manage field staff for home sample collection.</p>
        </div>
        <button
          onClick={openAddForm}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium px-5 py-2.5 rounded-xl transition-colors shrink-0"
        >
          <Plus size={16} aria-hidden="true" />
          Add Assistant
        </button>
      </div>

      <TableShell
        headers={["Name", "Phone", "Zone", "Tests Collected", "Status", "Actions"]}
        emptyState="No lab assistants found."
      >
        {assistants.map((assistant) => (
          <tr key={assistant.id} className="border-b border-gray-50 last:border-0">
            <td className="px-5 py-3">
              <div className="flex items-center gap-2 font-medium text-gray-800">
                <div className="bg-teal-50 text-teal-600 rounded-full p-1.5">
                  <FlaskConical size={14} aria-hidden="true" />
                </div>
                {assistant.name}
              </div>
            </td>
            <td className="px-5 py-3 text-gray-600">{assistant.phone}</td>
            <td className="px-5 py-3 text-gray-600">{assistant.zone}</td>
            <td className="px-5 py-3 text-gray-600">{assistant.testsCollected}</td>
            <td className="px-5 py-3">
              <button
                onClick={() => toggleStatus(assistant)}
                className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                  assistant.status === "active"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {assistant.status}
              </button>
            </td>
            <td className="px-5 py-3">
              <div className="flex gap-2">
                <button
                  onClick={() => openEditForm(assistant)}
                  aria-label={`Edit ${assistant.name}`}
                  className="text-gray-400 hover:text-teal-600"
                >
                  <Pencil size={15} aria-hidden="true" />
                </button>
                <button
                  onClick={() => setDeleteTarget(assistant)}
                  aria-label={`Remove ${assistant.name}`}
                  className="text-gray-400 hover:text-red-600"
                >
                  <Trash2 size={15} aria-hidden="true" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </TableShell>

      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingId ? "Edit Lab Assistant" : "Add Lab Assistant"}
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Input
            name="name"
            label="Full Name"
            placeholder="Full name"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.name ? errors.name : ""}
          />
          <Input
            type="tel"
            name="phone"
            label="Phone Number"
            placeholder="+880 1XXXXXXXXX"
            value={values.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.phone ? errors.phone : ""}
          />
          <Input
            name="zone"
            label="Coverage Zone"
            placeholder="e.g. Dhaka North"
            value={values.zone}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.zone ? errors.zone : ""}
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            {editingId ? "Save Changes" : "Add Assistant"}
          </button>
        </form>
      </Modal>

      <DeleteConfirm
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Remove Lab Assistant"
        message={`Are you sure you want to remove ${deleteTarget?.name}?`}
        onConfirm={confirmDelete}
      />
    </AdminLayout>
  );
}
