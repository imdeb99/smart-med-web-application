const asyncHandler = require('../../middleware/asyncHandler');
const paymentService = require('./payments.service');

const createPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.createPayment({ ...req.body, userId: req.user.id });
  res.status(201).json({ success: true, data: { payment }, error: null });
});

const listMyPayments = asyncHandler(async (req, res) => {
  const result = await paymentService.listByUser(req.user.id, req.query);
  res.json({ success: true, data: result, error: null });
});

module.exports = { createPayment, listMyPayments };
