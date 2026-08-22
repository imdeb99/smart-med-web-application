import { useMemo, useState } from "react";
import { Search, Pencil, Trash2, Loader2 } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import Modal from "../../components/shared/Modal";
import TableShell from "../../components/shared/TableShell";
import DeleteConfirm from "../../components/shared/DeleteConfirm";
import Avatar from "../../components/shared/Avatar";
import AvatarUpload from "../../components/shared/AvatarUpload";
import { Input, Select } from "../../components/shared/Field";
import { usePatients } from "../../context/PatientsContext";
import { useToast } from "../../context/ToastContext";
import useFormValidation, { validators } from "../../hooks/useFormValidation";
import adminApi from "../../api/admin";

export default function ManagePatients() {
  const { patients, isLoading, error, refresh, updatePatient, deletePatient, updatePatientAvatar } = usePatients();
  const { addToast } = useToast();

  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingPatient, setEditingPatient] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saveError, setSaveError] = useState("");

  const { values, errors, touched, setValues, handleChange, handleBlur, handleSubmit, reset } =
    useFormValidation(
      { name: "", phone: "", address: "", gender: "Female" },
      {
        name: validators.required,
        phone: validators.phone,
        address: validators.required,
      }
    );

  const filtered = useMemo(
    () =>
      patients.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.email.toLowerCase().includes(search.toLowerCase())
      ),
    [patients, search]
  );

  const openEditForm = (patient) => {
    setEditingId(patient.id);
    setEditingPatient(patient);
    setSaveError("");
    setValues({
      name: patient.name,
      phone: patient.phone,
      address: patient.address,
      gender: patient.gender || "Female",
    });
  };

  const onSubmit = async (form) => {
    setSaveError("");
    setSaving(true);
    try {
      await updatePatient(editingId, {
        name: form.name,
        phone: form.phone,
        address: form.address,
        gender: form.gender,
      });
      addToast("Patient details updated.", "success");
      setEditingId(null);
      reset();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not save the patient.";
      setSaveError(message);
      addToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deletePatient(deleteTarget.id);
      addToast(`${deleteTarget.name} was removed.`, "info");
      setDeleteTarget(null);
    } catch (err) {
      addToast(err.message || "Could not remove the patient.", "error");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manage Patients</h1>
          <p className="text-gray-500 mt-2">View, edit, or remove patient accounts.</p>
        </div>
      </div>

      <div className="relative mb-6 max-w-sm">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
        <label htmlFor="manage-patients-search" className="sr-only">
          Search patients by name or email
        </label>
        <input
          id="manage-patients-search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email"
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-gray-400">
          <Loader2 size={20} className="animate-spin text-teal-600" aria-hidden="true" />
          <span className="text-sm">Loading patients...</span>
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refresh}
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium px-5 py-2.5 rounded-xl transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : (
        <TableShell
          headers={["Patient", "Age / Gender", "Phone", "Address", "Actions"]}
          emptyState="No patients found."
        >
          {filtered.map((patient) => (
            <tr key={patient.id} className="border-b border-gray-50 last:border-0">
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <Avatar name={patient.name} src={patient.avatar} className="w-9 h-9 text-sm" />
                  <div>
                    <span className="font-medium text-gray-800 block">{patient.name}</span>
                    <span className="text-xs text-gray-400">{patient.email}</span>
                  </div>
                </div>
              </td>
              <td className="px-5 py-3 text-gray-600">
                {patient.age ? `${patient.age} / ${patient.gender || "—"}` : patient.gender || "—"}
              </td>
              <td className="px-5 py-3 text-gray-600">{patient.phone || "—"}</td>
              <td className="px-5 py-3 text-gray-600">{patient.address || "—"}</td>
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
      )}

      <Modal
        isOpen={!!editingId}
        onClose={() => {
          setEditingId(null);
          reset();
        }}
        title="Edit Patient"
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {editingId && editingPatient && (
            <div className="flex justify-center">
              <AvatarUpload
                name={editingPatient.name}
                src={editingPatient.avatar}
                sizeClass="w-20 h-20"
                onUpload={async (file) => {
                  const result = await adminApi.uploadAdminUserAvatar(editingId, file);
                  const url = result.user?.avatarUrl || result.avatarUrl;
                  if (url) {
                    updatePatientAvatar(editingId, url);
                    setEditingPatient((prev) => (prev ? { ...prev, avatar: url } : prev));
                  }
                  addToast("Patient photo updated.", "success");
                  return url;
                }}
              />
            </div>
          )}
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
            label="Phone"
            placeholder="+880 1XXXXXXXXX"
            value={values.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.phone ? errors.phone : ""}
          />
          <Input
            name="address"
            label="Address"
            placeholder="Mirpur, Dhaka"
            value={values.address}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.address ? errors.address : ""}
          />
          <Select name="gender" label="Gender" value={values.gender} onChange={handleChange}>
            <option>Female</option>
            <option>Male</option>
            <option>Other</option>
          </Select>

          {saveError && (
            <p role="alert" className="text-xs text-red-600">
              {saveError}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            {saving && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </Modal>

      <DeleteConfirm
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Remove Patient"
        message={`Are you sure you want to permanently remove ${deleteTarget?.name}? This deletes their account and all related appointments and records.`}
        onConfirm={confirmDelete}
        isDeleting={deleting}
        confirmLabel="Remove Permanently"
      />
    </AdminLayout>
  );
}
