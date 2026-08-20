const asyncHandler = require('../../middleware/asyncHandler');
const doctorService = require('./doctors.service');

const listDoctors = asyncHandler(async (req, res) => {
  const result = await doctorService.listDoctors(req.query);
  res.json({ success: true, data: result, error: null });
});

const getDoctorProfile = asyncHandler(async (req, res) => {
  const doctor = await doctorService.getDoctorProfile(req.params.id);
  res.json({ success: true, data: { doctor }, error: null });
});

const updateOwnProfile = asyncHandler(async (req, res) => {
  const doctor = await doctorService.updateOwnProfile(req.user.id, req.body);
  res.json({ success: true, data: { doctor }, error: null });
});

module.exports = { listDoctors, getDoctorProfile, updateOwnProfile };
