const asyncHandler = require('../../middleware/asyncHandler');
const dailyCapacityService = require('./dailyCapacity.service');

const upsertCapacity = asyncHandler(async (req, res) => {
  const capacity = await dailyCapacityService.upsertCapacity({
    doctorId: req.user.doctorProfile.id,
    ...req.body,
  });
  res.status(201).json({ success: true, data: { capacity }, error: null });
});

const getCapacityForDate = asyncHandler(async (req, res) => {
  const capacity = await dailyCapacityService.getCapacityForDate({
    doctorId: req.params.doctorId,
    date: req.query.date,
  });
  res.json({ success: true, data: { capacity }, error: null });
});

const listMyCapacities = asyncHandler(async (req, res) => {
  const capacities = await dailyCapacityService.listMyCapacities(req.user.doctorProfile.id);
  res.json({ success: true, data: { capacities }, error: null });
});

module.exports = { upsertCapacity, getCapacityForDate, listMyCapacities };
