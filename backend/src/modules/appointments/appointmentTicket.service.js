const PDFDocument = require('pdfkit');
const prisma = require('../../config/db');
const { ApiError } = require('../../middleware/errorHandler');

// Teal accent (matches the SMART-MED brand color).
const TEAL = '#0d9488';
const DARK = '#1f2937';
const GRAY = '#6b7280';
const LIGHT = '#f0fdfa';

const fmtDate = (d) => {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Dhaka',
  });
};

const fmtTime = (d) => {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Asia/Dhaka',
  });
};

const fmtType = (type) => (type === 'IN_PERSON' ? 'In-person Visit' : 'Video Consultation');

/** Label/value row helper with a light divider. */
const row = (doc, { label, value, y, labelWidth = 130 }) => {
  doc
    .fillColor(GRAY)
    .fontSize(9)
    .text(label, 60, y, { width: labelWidth })
    .fillColor(DARK)
    .font('Helvetica-Bold')
    .fontSize(10.5)
    .text(String(value), 60 + labelWidth, y, { width: 400 });
  doc
    .moveTo(60, y + 16)
    .lineTo(540, y + 16)
    .lineWidth(0.5)
    .strokeColor('#e5e7eb')
    .stroke();
  return y + 28;
};

/**
 * Fetch an appointment with everything the ticket needs, enforcing that the
 * caller may view it (own patient, the doctor, or an admin).
 */
const getAppointmentForTicket = async ({ id, userId, role }) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      patient: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } },
      doctor: {
        include: { user: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } } },
      },
      dailyCapacity: true,
    },
  });

  if (!appointment) {
    throw new ApiError(404, 'Appointment not found.');
  }

  const allowed =
    role === 'ADMIN' ||
    (role === 'PATIENT' && appointment.patientId === userId) ||
    (role === 'DOCTOR' && appointment.doctorId === userId);
  if (!allowed) {
    throw new ApiError(403, 'You can only view your own appointment tickets.');
  }

  return appointment;
};

/**
 * Generate the appointment confirmation PDF as an in-memory buffer.
 * The QR code area is a reserved placeholder box (filled in a later step).
 */
const buildTicketPdf = async ({ appointment }) => {
  const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });
  const chunks = [];
  doc.on('data', (c) => chunks.push(c));

  const capacity = appointment.dailyCapacity;
  const tokenNumber = appointment.tokenNumber ?? '—';
  const estimatedTime = appointment.estimatedTime || appointment.scheduledAt;
  const doctorUser = appointment.doctor?.user || {};

  // ---- Header band ----
  doc.rect(0, 0, 595, 90).fill(TEAL);
  doc
    .fillColor('#ffffff')
    .font('Helvetica-Bold')
    .fontSize(22)
    .text('SMART-MED', 50, 24);
  doc
    .font('Helvetica')
    .fontSize(10)
    .text('Telemedicine Platform', 50, 52, { characterSpacing: 1 });
  doc
    .fillColor('#ccfbf1')
    .font('Helvetica-Bold')
    .fontSize(14)
    .text('Appointment Confirmation', 50, 68);

  // ---- Token box ----
  doc.roundedRect(60, 115, 215, 70, 8).fill(LIGHT);
  doc
    .fillColor(GRAY)
    .font('Helvetica')
    .fontSize(9)
    .text('TOKEN NUMBER', 60, 128, { width: 215, align: 'center' });
  doc
    .fillColor(TEAL)
    .font('Helvetica-Bold')
    .fontSize(30)
    .text(`#${tokenNumber}`, 60, 140, { width: 215, align: 'center' });

  // ---- QR placeholder ----
  doc.roundedRect(345, 115, 90, 70, 8).strokeColor('#d1d5db').lineWidth(1).stroke();
  doc
    .fillColor('#9ca3af')
    .font('Helvetica')
    .fontSize(7.5)
    .text('QR CODE', 345, 143, { width: 90, align: 'center' });
  doc
    .fontSize(6.5)
    .text('(coming soon)', 345, 155, { width: 90, align: 'center' });

  // ---- Body ----
  let y = 225;

  doc
    .fillColor(DARK)
    .font('Helvetica-Bold')
    .fontSize(12)
    .text('Patient', 60, y);
  y += 22;
  y = row(doc, { label: 'Name', value: appointment.patient?.name || '—', y });
  y = row(doc, { label: 'Phone', value: appointment.patient?.phone || '—', y });

  y += 6;
  doc
    .fillColor(DARK)
    .font('Helvetica-Bold')
    .fontSize(12)
    .text('Doctor', 60, y);
  y += 22;
  y = row(doc, { label: 'Name', value: doctorUser.name || '—', y });
  y = row(doc, { label: 'Specialty', value: appointment.doctor?.specialty || '—', y });
  y = row(doc, { label: 'BMDC ID', value: appointment.doctor?.bmdcId || '—', y });

  y += 6;
  doc
    .fillColor(DARK)
    .font('Helvetica-Bold')
    .fontSize(12)
    .text('Appointment', 60, y);
  y += 22;
  y = row(doc, { label: 'Date', value: fmtDate(capacity?.date || appointment.scheduledAt), y });
  y = row(doc, { label: 'Estimated Time', value: fmtTime(estimatedTime), y });
  y = row(doc, { label: 'Consultation Type', value: fmtType(appointment.type), y });

  // ---- Footer ----
  doc
    .fillColor(GRAY)
    .font('Helvetica')
    .fontSize(8.5)
    .text('Please arrive 10 minutes early for your consultation.', 60, 690, { width: 475, align: 'center' });

  doc
    .fillColor('#9ca3af')
    .fontSize(8)
    .text(`Booking ID: ${appointment.id}`, 60, 710, { width: 475, align: 'center' });
  doc
    .text(
      'SMART-MED · support@smartmed.com · +880 1600-000000',
      60,
      724,
      { width: 475, align: 'center' },
    );

  doc.end();

  return new Promise((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });
};

module.exports = { getAppointmentForTicket, buildTicketPdf };
