const asyncHandler = require('../../middleware/asyncHandler');
const healthRecordService = require('./healthRecords.service');

const createRecord = asyncHandler(async (req, res) => {
  const record = await healthRecordService.createRecord({
    ...req.body,
    doctorId: req.user.doctorProfile.id,
  });
  res.status(201).json({ success: true, data: { record }, error: null });
});

const listMyRecords = asyncHandler(async (req, res) => {
  const result =
    req.user.role === 'DOCTOR'
      ? await healthRecordService.listByDoctor(req.user.doctorProfile.id, req.query)
      : await healthRecordService.listByPatient(req.user.id, req.query);
  res.json({ success: true, data: result, error: null });
});

const exportAsFhir = asyncHandler(async (req, res) => {
  const fhirResource = await healthRecordService.exportAsFhir({
    recordId: req.params.id,
    user: req.user,
  });
  res.json({ success: true, data: { fhir: fhirResource }, error: null });
});

module.exports = { createRecord, listMyRecords, exportAsFhir };
