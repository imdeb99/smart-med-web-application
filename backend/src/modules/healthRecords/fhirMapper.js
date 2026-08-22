/**
 * Maps a SMART-MED HealthRecord (with nested appointment / patient / doctor)
 * into a FHIR R4 "DocumentReference" resource — a minimal, structurally
 * recognizable FHIR document (not a full spec implementation).
 *
 * Key mappings:
 *   resourceType/id/status/type/category  -> standard DocumentReference fields
 *   subject   -> Patient (reference + display)
 *   author    -> Practitioner (reference + display)
 *   content   -> embedded prescription text (base64 attachment)
 *   context   -> the related appointment (encounter reference, period)
 */
function toFhirReference(resourceType, id, display) {
  return { reference: `${resourceType}/${id}`, display: display || undefined };
}

function mapHealthRecordToFhir(record) {
  const appointment = record.appointment || {};
  const patient = record.patient || {};
  const doctorProfile = record.doctor || {};
  const doctorUser = doctorProfile.user || {};
  const authorName = doctorUser.name || doctorProfile.name || 'Unknown Doctor';
  const patientName = patient.name || 'Unknown Patient';

  // Prescription body + clinical notes, as the document's text payload.
  const bodyText = [record.prescriptionText, record.notes ? `Notes: ${record.notes}` : '']
    .filter(Boolean)
    .join('\n\n');

  return {
    resourceType: 'DocumentReference',
    id: record.id,
    status: 'current',
    type: {
      coding: [
        {
          system: 'http://loinc.org',
          code: '34117-2',
          display: 'History and physical note',
        },
      ],
      text: 'Consultation health record',
    },
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/document-classcodes',
            code: '47039-3',
            display: 'History and physical',
          },
        ],
      },
    ],
    subject: toFhirReference('Patient', record.patientId, patientName),
    author: [toFhirReference('Practitioner', doctorProfile.id || record.doctorId, authorName)],
    date: record.createdAt ? new Date(record.createdAt).toISOString() : undefined,
    content: [
      {
        attachment: {
          contentType: 'text/plain',
          title: `Consultation health record ${record.id}`,
          creation: record.createdAt ? new Date(record.createdAt).toISOString() : undefined,
          data: Buffer.from(bodyText).toString('base64'),
        },
        format: {
          system: 'urn:ietf:rfc:3986',
          code: 'urn:hl7-org:sdwg:ccda-structuredBody:2.1',
          display: 'Prescription text',
        },
      },
    ],
    context: {
      encounter: toFhirReference(
        'Encounter',
        appointment.id || record.appointmentId,
        'Consultation appointment',
      ),
      period: {
        start: appointment.scheduledAt ? new Date(appointment.scheduledAt).toISOString() : undefined,
        end: record.createdAt ? new Date(record.createdAt).toISOString() : undefined,
      },
    },
  };
}

module.exports = { mapHealthRecordToFhir };
