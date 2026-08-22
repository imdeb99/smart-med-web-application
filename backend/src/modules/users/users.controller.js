const asyncHandler = require('../../middleware/asyncHandler');
const usersService = require('./users.service');

const uploadMyAvatar = asyncHandler(async (req, res) => {
  const user = await usersService.uploadAvatarForUser(req.user.id, req.file);
  res.json({ success: true, data: { user }, error: null });
});

module.exports = { uploadMyAvatar };
