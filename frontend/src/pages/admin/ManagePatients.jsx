import { useMemo, useState } from "react";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import Modal from "../../components/shared/Modal";
import TableShell from "../../components/shared/TableShell";
import DeleteConfirm from "../../components/shared/DeleteConfirm";
import { Input, Select } from "../../components/shared/Field";
import { usePatients } from "../../context/PatientsContext";
import { useToast } from "../../context/ToastContext";
import useFormValidation, { validators } from "../../hooks/useFormValidation";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  age: "",
  gender: "Female",
  bloodGroup: "",
  address: "",
};

export default function ManagePatients() {
  const { patients, addPatient, updatePatient, deletePatient } = usePatients();
  const { addToast } = useToast();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { values, errors, touched, submitting, setValues, handleChange, handleBlur, handleSubmit, reset } =
    useFormValidation(emptyForm, {
      name: validators.required,
      email: validators.email,
      phone: validators.phone,
      age: validators.number,
      bloodGroup: validators.required,
      address: validators.required,
    });

  const filtered = useMemo(
    () => patients.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())),
    [patients, search]
  );

  const openAddForm = () => {
    setEditingId(null);
    reset();
    setFormOpen(true);
  };

  const openEditForm = (patient) => {
    setEditingId(patient.id);
    setValues({
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      age: patient.age,
      gender: patient.gender,
      bloodGroup: patient.bloodGroup,
      address: patient.address,
    });
    setFormOpen(true);
  };

  const onSubmit = async (form) => {
    const payload = { ...form, age: Number(form.age) };

    if (editingId) {
      updatePatient(editingId, payload);
      addToast("Patient details updated.", "success");
    } else {
      addPatient(payload);
      addToast("Patient added successfully.", "success");
    }
    setFormOpen(false);
  };

  const confirmDelete = () => {
    deletePatient(deleteTarget.id);
    addToast(`${deleteTarget.name} was removed.`, "info");
    setDeleteTarget(null);
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manage Patients</h1>
          <p className="text-gray-500 mt-2">View, add, edit, or remove patient records.</p>
        </div>
        <button
          onClick={openAddForm}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium px-5 py-2.5 rounded-xl transition-colors shrink-0"
        >
          <Plus size={16} aria-hidden="true" />
          Add Patient
        </button>
      </div>

      <div className="relative mb-6 max-w-sm">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
        <label htmlFor="manage-patients-search" className="sr-only">
          Search patients by name
        </label>
        <input
          id="manage-patients-search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search patient by name"
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
        />
      </div>

      <TableShell
        headers={["Patient", "Age / Gender", "Blood Group", "Phone", "Address", "Actions"]}
        emptyState="No patients found."
      >
        {filtered.map((patient) => (
          <tr key={patient.id} className="border-b border-gray-50 last:border-0">
            <td className="px-5 py-3">
              <div className="flex items-center gap-3">
                <img src={patient.avatar} alt={patient.name} loading="lazy" className="w-9 h-9 rounded-full object-cover" />
                <span className="font-medium text-gray-800">{patient.name}</span>
              </div>
            </td>
            <td className="px-5 py-3 text-gray-600">
              {patient.age} / {patient.gender}
            </td>
            <td className="px-5 py-3 text-gray-600">{patient.bloodGroup}</td>
            <td className="px-5 py-3 text-gray-600">{patient.phone}</td>
            <td className="px-5 py-3 text-gray-600">{patient.address}</td>
            <td className="px-5 py-3">
              <div className="flex gap-2">
                <button
                  onClick={() => openEditForm(patient)}
                  aria-label={`Edit ${patient.name}`}
                  className="text-gray-400 hover:text-teal-600"
                >
                  <Pencil size={15} aria-hidden="true" />
                </button>
                <button
                  onClick={() => setDeleteTarget(patient)}
                  aria-label={`Remove ${patient.name}`}
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
        title={editingId ? "Edit Patient" : "Add Patient"}
        size="lg"
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
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="email"
              name="email"
              label="Email"
              placeholder="you@example.com"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.email ? errors.email : ""}
            />
            <Input
              type="tel"
              name="phone"
              label="Phone"
              placeholder="+880 1XXXXXXXXX"
              value={values.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.phone ? errors.phone : ""}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input
              type="number"
              name="age"
              label="Age"
              placeholder="29"
              min={0}
              max={130}
              value={values.age}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.age ? errors.age : ""}
            />
            <Select name="gender" label="Gender" value={values.gender} onChange={handleChange}>
              <option>Female</option>
              <option>Male</option>
              <option>Other</option>
            </Select>
            <Input
              name="bloodGroup"
              label="Blood Group"
              placeholder="B+"
              value={values.bloodGroup}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.bloodGroup ? errors.bloodGroup : ""}
            />
          </div>
          <Input
            name="address"
            label="Address"
            placeholder="Mirpur, Dhaka"
            value={values.address}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.address ? errors.address : ""}
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            {editingId ? "Save Changes" : "Add Patient"}
          </button>
        </form>
      </Modal>

      <DeleteConfirm
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Remove Patient"
        message={`Are you sure you want to remove ${deleteTarget?.name} from the platform?`}
        onConfirm={confirmDelete}
      />
    </AdminLayout>
  );
}
