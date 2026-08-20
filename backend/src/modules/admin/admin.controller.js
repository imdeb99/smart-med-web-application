const asyncHandler = require('../../middleware/asyncHandler');
const adminService = require('./admin.service');

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

module.exports = { setDoctorVerification, listUsers, listAllAppointments, listAllPayments, getDashboard };
