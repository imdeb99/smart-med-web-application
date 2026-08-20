const asyncHandler = require('../../middleware/asyncHandler');
const reviewService = require('./reviews.service');

const createReview = asyncHandler(async (req, res) => {
  const review = await reviewService.createReview({ ...req.body, patientId: req.user.id });
  res.status(201).json({ success: true, data: { review }, error: null });
});

const listByDoctor = asyncHandler(async (req, res) => {
  const result = await reviewService.listByDoctor(req.params.doctorId, req.query);
  res.json({ success: true, data: result, error: null });
});

module.exports = { createReview, listByDoctor };
