-- Add a unique constraint on (doctorId, patientId) so a patient can review a
-- doctor only once. The Review table is empty at this point, so this is safe.
CREATE UNIQUE INDEX "Review_doctorId_patientId_key" ON "Review"("doctorId", "patientId");
