import { useState } from "react";
import { Plus, Pencil, Trash2, Ambulance } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import Modal from "../../components/shared/Modal";
import TableShell from "../../components/shared/TableShell";
import DeleteConfirm from "../../components/shared/DeleteConfirm";
import { Input, Select } from "../../components/shared/Field";
import { useToast } from "../../context/ToastContext";
import useFormValidation, { validators } from "../../hooks/useFormValidation";
import mockAmbulances from "../../data/mockAmbulances";

const STORAGE_KEY = "smartmed_ambulances";
const emptyForm = { vehicleNumber: "", driverName: "", type: "Basic", phone: "" };
const statusOptions = ["available", "on-trip", "maintenance"];

const statusStyles = {
  available: "bg-emerald-50 text-emerald-700",
  "on-trip": "bg-amber-50 text-amber-700",
  maintenance: "bg-gray-100 text-gray-500",
};

function loadAmbulances() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : mockAmbulances;
  } catch {
    return mockAmbulances;
  }
}

export default function ManageAmbulances() {
  const [ambulances, setAmbulances] = useState(loadAmbulances);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { addToast } = useToast();

  const { values, errors, touched, submitting, setValues, handleChange, handleBlur, handleSubmit, reset } =
    useFormValidation(emptyForm, {
      vehicleNumber: validators.required,
      driverName: validators.required,
      phone: validators.phone,
    });

  const persist = (next) => {
    setAmbulances(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const openAddForm = () => {
    setEditingId(null);
    reset();
    setFormOpen(true);
  };

  const openEditForm = (ambulance) => {
    setEditingId(ambulance.id);
    setValues({
      vehicleNumber: ambulance.vehicleNumber,
      driverName: ambulance.driverName,
      type: ambulance.type,
      phone: ambulance.phone,
    });
    setFormOpen(true);
  };

  const onSubmit = async (form) => {
    if (editingId) {
      persist(ambulances.map((a) => (a.id === editingId ? { ...a, ...form } : a)));
      addToast("Ambulance details updated.", "success");
    } else {
      const newAmbulance = { id: `amb-${Date.now()}`, status: "available", ...form };
      persist([newAmbulance, ...ambulances]);
      addToast("Ambulance added to fleet.", "success");
    }
    setFormOpen(false);
  };

  const changeStatus = (ambulance, status) => {
    persist(ambulances.map((a) => (a.id === ambulance.id ? { ...a, status } : a)));
  };

  const confirmDelete = () => {
    persist(ambulances.filter((a) => a.id !== deleteTarget.id));
    addToast(`${deleteTarget.vehicleNumber} was removed from the fleet.`, "info");
    setDeleteTarget(null);
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Ambulance Fleet</h1>
          <p className="text-gray-500 mt-2">Manage registered ambulances and their availability.</p>
        </div>
        <button
          onClick={openAddForm}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium px-5 py-2.5 rounded-xl transition-colors shrink-0"
        >
          <Plus size={16} aria-hidden="true" />
          Add Ambulance
        </button>
      </div>

      <TableShell
        headers={["Vehicle", "Driver", "Type", "Phone", "Status", "Actions"]}
        emptyState="No ambulances found."
      >
        {ambulances.map((ambulance) => (
          <tr key={ambulance.id} className="border-b border-gray-50 last:border-0">
            <td className="px-5 py-3">
              <div className="flex items-center gap-2 font-medium text-gray-800">
                <div className="bg-red-50 text-red-600 rounded-full p-1.5">
                  <Ambulance size={14} aria-hidden="true" />
                </div>
                {ambulance.vehicleNumber}
              </div>
            </td>
            <td className="px-5 py-3 text-gray-600">{ambulance.driverName}</td>
            <td className="px-5 py-3 text-gray-600">{ambulance.type}</td>
            <td className="px-5 py-3 text-gray-600">{ambulance.phone}</td>
            <td className="px-5 py-3">
              <select
                value={ambulance.status}
                onChange={(e) => changeStatus(ambulance, e.target.value)}
                aria-label={`Status for ${ambulance.vehicleNumber}`}
                className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize border-0 focus:outline-none focus:ring-2 focus:ring-teal-500 ${statusStyles[ambulance.status]}`}
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </td>
            <td className="px-5 py-3">
              <div className="flex gap-2">
                <button
                  onClick={() => openEditForm(ambulance)}
                  aria-label={`Edit ${ambulance.vehicleNumber}`}
                  className="text-gray-400 hover:text-teal-600"
                >
                  <Pencil size={15} aria-hidden="true" />
                </button>
                <button
                  onClick={() => setDeleteTarget(ambulance)}
                  aria-label={`Remove ${ambulance.vehicleNumber}`}
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
        title={editingId ? "Edit Ambulance" : "Add Ambulance"}
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Input
            name="vehicleNumber"
            label="Vehicle Number"
            placeholder="Dhaka Metro-GA 11-2234"
            value={values.vehicleNumber}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.vehicleNumber ? errors.vehicleNumber : ""}
          />
          <Input
            name="driverName"
            label="Driver Name"
            placeholder="Full name"
            value={values.driverName}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.driverName ? errors.driverName : ""}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select name="type" label="Type" value={values.type} onChange={handleChange}>
              <option>Basic</option>
              <option>ICU</option>
              <option>Freezer</option>
            </Select>
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
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            {editingId ? "Save Changes" : "Add Ambulance"}
          </button>
        </form>
      </Modal>

      <DeleteConfirm
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Remove Ambulance"
        message={`Are you sure you want to remove ${deleteTarget?.vehicleNumber} from the fleet?`}
        onConfirm={confirmDelete}
      />
    </AdminLayout>
  );
}
