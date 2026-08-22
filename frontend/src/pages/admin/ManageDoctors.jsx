import { useMemo, useState } from "react";
import { Search, Plus, Pencil, Trash2, BadgeCheck, Loader2 } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import Modal from "../../components/shared/Modal";
import TableShell from "../../components/shared/TableShell";
import DeleteConfirm from "../../components/shared/DeleteConfirm";
import Avatar from "../../components/shared/Avatar";
import AvatarUpload from "../../components/shared/AvatarUpload";
import { Input, Select } from "../../components/shared/Field";
import { useDoctors } from "../../context/DoctorsContext";
import { useToast } from "../../context/ToastContext";
import useFormValidation, { validators } from "../../hooks/useFormValidation";
import { specialties } from "../../data/mockDoctors";
import adminApi from "../../api/admin";

const emptyForm = {
  name: "",
  email: "",
  specialty: specialties[0],
  qualifications: "",
  bmdcId: "",
  experienceYears: "",
  fee: "",
  location: "",
  verified: false,
};

export default function ManageDoctors() {
  const { doctors, isLoading, error, addDoctor, updateDoctor, deleteDoctor, updateDoctorAvatar } = useDoctors();
  const { addToast } = useToast();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saveError, setSaveError] = useState("");

  const { values, errors, touched, setValues, handleChange, handleBlur, handleSubmit, reset } =
    useFormValidation(emptyForm, {
      name: validators.required,
      email: (v) => (editingId ? "" : validators.email(v)),
      bmdcId: validators.required,
      qualifications: validators.required,
      experienceYears: validators.number,
      fee: validators.number,
      location: validators.required,
    });

  const filtered = useMemo(
    () =>
      doctors.filter(
        (d) =>
          d.name.toLowerCase().includes(search.toLowerCase()) ||
          d.specialty.toLowerCase().includes(search.toLowerCase())
      ),
    [doctors, search]
  );

  const openAddForm = () => {
    setEditingId(null);
    setSaveError("");
    reset();
    setFormOpen(true);
  };

  const openEditForm = (doctor) => {
    setEditingId(doctor.id);
    setEditingDoctor(doctor);
    setSaveError("");
    setValues({
      name: doctor.name,
      email: doctor.email,
      specialty: doctor.specialty,
      qualifications: doctor.qualifications,
      bmdcId: doctor.bmdcId,
      experienceYears: doctor.experienceYears || "",
      fee: doctor.fee,
      location: doctor.location,
      verified: doctor.verified,
    });
    setFormOpen(true);
  };

  const onSubmit = async (form) => {
    setSaveError("");
    setSaving(true);
    try {
      const payload = {
        ...form,
        consultationFee: Number(form.fee),
        experienceYears: Number(form.experienceYears),
        verificationStatus: form.verified ? "VERIFIED" : "PENDING",
      };
      delete payload.fee;
      delete payload.verified;

      if (editingId) {
        // Email is the login identifier — never update it from this form.
        delete payload.email;
        await updateDoctor(editingId, payload);
        addToast("Doctor details updated.", "success");
      } else {
        await addDoctor(payload);
        addToast("Doctor added successfully.", "success");
      }
      setFormOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not save the doctor.";
      setSaveError(message);
      addToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteDoctor(deleteTarget.id);
      addToast(`${deleteTarget.name} was removed.`, "info");
      setDeleteTarget(null);
    } catch (err) {
      addToast(err.message || "Could not remove the doctor.", "error");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manage Doctors</h1>
          <p className="text-gray-500 mt-2">View, add, edit, or remove doctors on the platform.</p>
        </div>
        <button
          onClick={openAddForm}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium px-5 py-2.5 rounded-xl transition-colors shrink-0"
        >
          <Plus size={16} aria-hidden="true" />
          Add Doctor
        </button>
      </div>

      <div className="relative mb-6 max-w-sm">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
        <label htmlFor="manage-doctors-search" className="sr-only">
          Search doctors by name or specialty
        </label>
        <input
          id="manage-doctors-search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or specialty"
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-gray-400">
          <Loader2 size={20} className="animate-spin text-teal-600" aria-hidden="true" />
          <span className="text-sm">Loading doctors...</span>
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-gray-500">
          {error}
        </div>
      ) : (
        <TableShell
          headers={["Doctor", "Specialty", "BMDC ID", "Status", "Rating", "Fee", "Actions"]}
          emptyState="No doctors found."
        >
          {filtered.map((doctor) => (
            <tr key={doctor.id} className="border-b border-gray-50 last:border-0">
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <Avatar name={doctor.name} src={doctor.avatar} className="w-9 h-9 text-sm" />
                  <span className="font-medium text-gray-800">{doctor.name}</span>
                </div>
              </td>
              <td className="px-5 py-3 text-gray-600">{doctor.specialty}</td>
              <td className="px-5 py-3 text-gray-600">{doctor.bmdcId}</td>
              <td className="px-5 py-3">
                {doctor.verified ? (
                  <span className="flex items-center gap-1 text-xs font-medium bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full w-fit">
                    <BadgeCheck size={12} aria-hidden="true" />
                    Verified
                  </span>
                ) : (
                  <span className="text-xs font-medium bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full w-fit">
                    Pending
                  </span>
                )}
              </td>
              <td className="px-5 py-3 text-gray-600">{doctor.rating || "—"}</td>
              <td className="px-5 py-3 text-gray-600">৳{doctor.fee}</td>
              <td className="px-5 py-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditForm(doctor)}
                    aria-label={`Edit ${doctor.name}`}
                    className="text-gray-400 hover:text-teal-600"
                  >
                    <Pencil size={15} aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(doctor)}
                    aria-label={`Remove ${doctor.name}`}
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
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingId ? "Edit Doctor" : "Add Doctor"}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {editingId && editingDoctor && (
            <div className="flex justify-center">
              <AvatarUpload
                name={editingDoctor.name}
                src={editingDoctor.avatar}
                sizeClass="w-20 h-20"
                onUpload={async (file) => {
                  const result = await adminApi.uploadAdminUserAvatar(editingDoctor.userId, file);
                  const url = result.user?.avatarUrl || result.avatarUrl;
                  if (url) {
                    updateDoctorAvatar(editingId, url);
                    setEditingDoctor((prev) => (prev ? { ...prev, avatar: url } : prev));
                  }
                  addToast("Doctor photo updated.", "success");
                  return url;
                }}
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Input
              name="name"
              label="Full Name"
              placeholder="Dr. Full Name"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.name ? errors.name : ""}
            />
            {!editingId && (
              <Input
                name="email"
                label="Email"
                placeholder="doctor@clinic.com"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email ? errors.email : ""}
              />
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select
              name="specialty"
              label="Specialty"
              value={values.specialty}
              onChange={handleChange}
            >
              {specialties.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
            <Input
              name="bmdcId"
              label="BMDC ID"
              placeholder="A-58231"
              value={values.bmdcId}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.bmdcId ? errors.bmdcId : ""}
            />
          </div>
          <Input
            name="qualifications"
            label="Qualifications"
            placeholder="e.g. MBBS, FCPS"
            value={values.qualifications}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.qualifications ? errors.qualifications : ""}
          />
          <div className="grid grid-cols-3 gap-3">
            <Input
              type="number"
              name="experienceYears"
              label="Experience (yrs)"
              placeholder="10"
              min={0}
              value={values.experienceYears}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.experienceYears ? errors.experienceYears : ""}
            />
            <Input
              type="number"
              name="fee"
              label="Fee (৳)"
              placeholder="1200"
              min={0}
              value={values.fee}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.fee ? errors.fee : ""}
            />
            <Input
              name="location"
              label="Location"
              placeholder="Dhaka"
              value={values.location}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.location ? errors.location : ""}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={values.verified}
              onChange={(e) => setValues({ ...values, verified: e.target.checked })}
              className="accent-teal-600 w-4 h-4"
            />
            Mark as BMDC verified
          </label>

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
            {saving ? "Saving..." : editingId ? "Save Changes" : "Add Doctor"}
          </button>
        </form>
      </Modal>

      <DeleteConfirm
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Remove Doctor"
        message={`Are you sure you want to remove ${deleteTarget?.name} from the platform?`}
        onConfirm={confirmDelete}
        isDeleting={deleting}
      />
    </AdminLayout>
  );
}
