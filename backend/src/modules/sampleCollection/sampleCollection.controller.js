const asyncHandler = require('../../middleware/asyncHandler');
const sampleCollectionService = require('./sampleCollection.service');

const createRequest = asyncHandler(async (req, res) => {
  const collection = await sampleCollectionService.createRequest({ ...req.body, patientId: req.user.id });
  res.status(201).json({ success: true, data: { collection }, error: null });
});

const listMyRequests = asyncHandler(async (req, res) => {
  const result = await sampleCollectionService.listByPatient(req.user.id, req.query);
  res.json({ success: true, data: result, error: null });
});

const listAll = asyncHandler(async (req, res) => {
  const result = await sampleCollectionService.listAll(req.query);
  res.json({ success: true, data: result, error: null });
});

const assignLabAssistant = asyncHandler(async (req, res) => {
  const collection = await sampleCollectionService.assignLabAssistant({
    id: req.params.id,
    labAssistantId: req.body.labAssistantId,
  });
  res.json({ success: true, data: { collection }, error: null });
});

module.exports = { createRequest, listMyRequests, listAll, assignLabAssistant };
