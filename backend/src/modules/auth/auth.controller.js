const asyncHandler = require('../../middleware/asyncHandler');
const authService = require('./auth.service');

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json({ success: true, data: result, error: null });
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.json({ success: true, data: result, error: null });
});

const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user }, error: null });
});

module.exports = { register, login, me };
