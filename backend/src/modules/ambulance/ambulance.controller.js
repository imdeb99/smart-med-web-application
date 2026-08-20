const asyncHandler = require('../../middleware/asyncHandler');
const ambulanceService = require('./ambulance.service');

const createBooking = asyncHandler(async (req, res) => {
  const booking = await ambulanceService.createBooking({ ...req.body, patientId: req.user.id });
  res.status(201).json({ success: true, data: { booking }, error: null });
});

const listMyBookings = asyncHandler(async (req, res) => {
  const result = await ambulanceService.listByPatient(req.user.id, req.query);
  res.json({ success: true, data: result, error: null });
});

const listAll = asyncHandler(async (req, res) => {
  const result = await ambulanceService.listAll(req.query);
  res.json({ success: true, data: result, error: null });
});

const assignAmbulance = asyncHandler(async (req, res) => {
  const booking = await ambulanceService.assignAmbulance({
    id: req.params.id,
    ambulanceId: req.body.ambulanceId,
  });
  res.json({ success: true, data: { booking }, error: null });
});

module.exports = { createBooking, listMyBookings, listAll, assignAmbulance };
