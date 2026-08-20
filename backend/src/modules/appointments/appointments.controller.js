const asyncHandler = require('../../middleware/asyncHandler');
const appointmentService = require('./appointments.service');

const createAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.createAppointment({
    ...req.body,
    patientId: req.user.id,
  });
  res.status(201).json({ success: true, data: { appointment }, error: null });
});

const listMyAppointments = asyncHandler(async (req, res) => {
  const result =
    req.user.role === 'DOCTOR'
      ? await appointmentService.listDoctorAppointments(req.user.doctorProfile?.id, req.query)
      : await appointmentService.listPatientAppointments(req.user.id, req.query);
  res.json({ success: true, data: result, error: null });
});

const updateStatus = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.updateStatus({
    id: req.params.id,
    userId: req.user.role === 'DOCTOR' ? req.user.doctorProfile?.id : req.user.id,
    role: req.user.role,
    status: req.body.status,
  });
  res.json({ success: true, data: { appointment }, error: null });
});

module.exports = { createAppointment, listMyAppointments, updateStatus };
