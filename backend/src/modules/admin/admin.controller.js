const asyncHandler = require('../../middleware/asyncHandler');
const adminService = require('./admin.service');
const { uploadAvatarForUser } = require('../users/users.service');

const setDoctorVerification = asyncHandler(async (req, res) => {
  const doctor = await adminService.setDoctorVerification(req.params.id, req.body.verificationStatus);
  res.json({ success: true, data: { doctor }, error: null });
});

const listUsers = asyncHandler(async (req, res) => {
  const result = await adminService.listUsers(req.query);
  res.json({ success: true, data: result, error: null });
});

const listAllAppointments = asyncHandler(async (req, res) => {
  const result = await adminService.listAllAppointments(req.query);
  res.json({ success: true, data: result, error: null });
});

const listAllPayments = asyncHandler(async (req, res) => {
  const result = await adminService.listAllPayments(req.query);
  res.json({ success: true, data: result, error: null });
});

const getDashboard = asyncHandler(async (req, res) => {
  const result = await adminService.getDashboard();
  res.json({ success: true, data: result, error: null });
});

const listDoctors = asyncHandler(async (req, res) => {
  const result = await adminService.listDoctors(req.query);
  res.json({ success: true, data: result, error: null });
});

const createDoctor = asyncHandler(async (req, res) => {
  const doctor = await adminService.createDoctor(req.body);
  res.status(201).json({ success: true, data: { doctor }, error: null });
});

const updateDoctor = asyncHandler(async (req, res) => {
  const doctor = await adminService.updateDoctor(req.params.id, req.body);
  res.json({ success: true, data: { doctor }, error: null });
});

const deleteDoctor = asyncHandler(async (req, res) => {
  const result = await adminService.deleteDoctor(req.params.id);
  res.json({ success: true, data: result, error: null });
});

const listPatients = asyncHandler(async (req, res) => {
  const result = await adminService.listPatients(req.query);
  res.json({ success: true, data: result, error: null });
});

const getPatient = asyncHandler(async (req, res) => {
  const patient = await adminService.getPatient(req.params.id);
  res.json({ success: true, data: { patient }, error: null });
});

const updatePatient = asyncHandler(async (req, res) => {
  const patient = await adminService.updatePatient(req.params.id, req.body);
  res.json({ success: true, data: { patient }, error: null });
});

const deletePatient = asyncHandler(async (req, res) => {
  const result = await adminService.deletePatient(req.params.id);
  res.json({ success: true, data: result, error: null });
});

const listDailyCapacities = asyncHandler(async (req, res) => {
  const result = await adminService.listDailyCapacities(req.query);
  res.json({ success: true, data: result, error: null });
});

const overrideDailyCapacity = asyncHandler(async (req, res) => {
  const capacity = await adminService.overrideDailyCapacity({
    capacityId: req.params.id,
    adminId: req.user.id,
    ...req.body,
  });
  res.json({ success: true, data: { capacity }, error: null });
});

const uploadUserAvatar = asyncHandler(async (req, res) => {
  const user = await uploadAvatarForUser(req.params.id, req.file);
  res.json({ success: true, data: { user }, error: null });
});

module.exports = { setDoctorVerification, listDoctors, createDoctor, updateDoctor, deleteDoctor, listPatients, getPatient, updatePatient, deletePatient, listUsers, listAllAppointments, listAllPayments, listDailyCapacities, overrideDailyCapacity, getDashboard, uploadUserAvatar };
