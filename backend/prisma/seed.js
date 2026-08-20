/**
 * SMART-MED seed script — local development/test data only.
 *
 * Seeds REAL accounts (bcrypt-hashed passwords, usable to log in) — these are
 * NOT demo accounts. Demo mode stays frontend-only; this backend only serves
 * real registered users.
 *
 * Run with: npm run seed
 * It is idempotent: re-running it updates matching users instead of duplicating.
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const doctors = [
  {
    name: 'Dr. Sarah Khan',
    email: 'sarah@clinic.com',
    password: 'doctor123',
    phone: '+8801711000001',
    bmdcId: 'BMDC-1001',
    specialty: 'Cardiology',
    bio: 'Senior cardiologist with 15 years of experience in interventional cardiology.',
    consultationFee: 1200,
    verificationStatus: 'VERIFIED',
  },
  {
    name: 'Dr. Nusrat Jahan',
    email: 'nusrat@clinic.com',
    password: 'doctor123',
    phone: '+8801711000002',
    bmdcId: 'BMDC-1002',
    specialty: 'Dermatology',
    bio: 'Skin, hair and nail specialist. Treats chronic skin conditions.',
    consultationFee: 900,
    verificationStatus: 'VERIFIED',
  },
  {
    name: 'Dr. Mahmudul Hasan',
    email: 'mahmudul@clinic.com',
    password: 'doctor123',
    phone: '+8801711000003',
    bmdcId: 'BMDC-1003',
    specialty: 'Pediatrics',
    bio: 'Child health specialist focused on preventive care and vaccinations.',
    consultationFee: 800,
    verificationStatus: 'VERIFIED',
  },
  {
    name: 'Dr. Farhana Akter',
    email: 'farhana@clinic.com',
    password: 'doctor123',
    phone: '+8801711000004',
    bmdcId: 'BMDC-1004',
    specialty: 'Gynecology',
    bio: 'Obstetrician and gynecologist, prenatal and postnatal care.',
    consultationFee: 1100,
    verificationStatus: 'PENDING',
  },
  {
    name: 'Dr. Tanvir Ahmed',
    email: 'tanvir@clinic.com',
    password: 'doctor123',
    phone: '+8801711000005',
    bmdcId: 'BMDC-1005',
    specialty: 'Orthopedics',
    bio: 'Orthopedic surgeon specializing in sports injuries.',
    consultationFee: 1300,
    verificationStatus: 'VERIFIED',
  },
];

const patients = [
  {
    name: 'Rahim Uddin',
    email: 'rahim@mail.com',
    password: 'patient123',
    phone: '+8801811000001',
    address: 'House 12, Road 5, Gulshan-1, Dhaka',
    dob: '1988-04-12',
    gender: 'Male',
  },
  {
    name: 'Salma Begum',
    email: 'salma@mail.com',
    password: 'patient123',
    phone: '+8801811000002',
    address: 'Flat 3B, Lake View, Banani, Dhaka',
    dob: '1992-09-23',
    gender: 'Female',
  },
  {
    name: 'Kamal Hossain',
    email: 'kamal@mail.com',
    password: 'patient123',
    phone: '+8801811000003',
    address: 'Road 7, Dhanmondi, Dhaka',
    dob: '1975-01-30',
    gender: 'Male',
  },
];

const labAssistants = [
  { name: 'Karim Lab Assistant', phone: '+8801911000001', area: 'Gulshan' },
  { name: 'Rafiq Sample Collector', phone: '+8801911000002', area: 'Dhanmondi' },
];

const ambulances = [
  { driverName: 'Jahid', vehicleNo: 'DHA-11-1234', type: 'BASIC' },
  { driverName: 'Sobuj', vehicleNo: 'DHA-12-5678', type: 'ICU' },
  { driverName: 'Rasel', vehicleNo: 'DHA-13-9012', type: 'FREEZER' },
];

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const usersByEmail = new Map();

  // Seed doctors (real accounts, one unverified to exercise the admin flow)
  for (const d of doctors) {
    const user = await prisma.user.upsert({
      where: { email: d.email },
      update: {},
      create: {
        name: d.name,
        email: d.email,
        passwordHash,
        phone: d.phone,
        role: 'DOCTOR',
        doctorProfile: {
          create: {
            bmdcId: d.bmdcId,
            specialty: d.specialty,
            bio: d.bio,
            consultationFee: d.consultationFee,
            verificationStatus: d.verificationStatus,
          },
        },
      },
      include: { doctorProfile: true },
    });
    usersByEmail.set(d.email, user);
    console.log(`Doctor: ${d.name} (${d.verificationStatus})`);
  }

  // Seed patients
  for (const p of patients) {
    const user = await prisma.user.upsert({
      where: { email: p.email },
      update: {},
      create: {
        name: p.name,
        email: p.email,
        passwordHash,
        phone: p.phone,
        role: 'PATIENT',
        patientProfile: {
          create: {
            address: p.address,
            dob: new Date(p.dob),
            gender: p.gender,
          },
        },
      },
      include: { patientProfile: true },
    });
    usersByEmail.set(p.email, user);
    console.log(`Patient: ${p.name}`);
  }

  // Lab assistants (reference data — clear and re-insert for idempotency)
  await prisma.sampleCollection.updateMany({ data: { labAssistantId: null } });
  await prisma.labAssistant.deleteMany();
  for (const la of labAssistants) {
    await prisma.labAssistant.create({ data: la });
    console.log(`Lab assistant: ${la.name}`);
  }

  // Ambulances (reference data — clear and re-insert for idempotency)
  await prisma.ambulanceBooking.updateMany({ data: { ambulanceId: null } });
  await prisma.ambulance.deleteMany();
  for (const a of ambulances) {
    await prisma.ambulance.create({ data: a });
    console.log(`Ambulance: ${a.vehicleNo} (${a.type})`);
  }

  // A couple of completed appointments + health records so the app has
  // meaningful data for dashboards and the review flow.
  const rahim = usersByEmail.get('rahim@mail.com');
  const sarah = usersByEmail.get('sarah@clinic.com');

  if (rahim && sarah) {
    const existing = await prisma.appointment.findFirst({
      where: { patientId: rahim.id, doctorId: sarah.doctorProfile.id },
    });

    if (!existing) {
      const appointment = await prisma.appointment.create({
        data: {
          patientId: rahim.id,
          doctorId: sarah.doctorProfile.id,
          scheduledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          type: 'VIDEO',
          status: 'COMPLETED',
        },
      });

      await prisma.healthRecord.create({
        data: {
          appointmentId: appointment.id,
          patientId: rahim.id,
          doctorId: sarah.doctorProfile.id,
          prescriptionText: 'Paracetamol 500mg twice daily for 5 days. Rest and fluids.',
          notes: 'Follow up in 2 weeks if symptoms persist.',
        },
      });

      await prisma.review.create({
        data: {
          doctorId: sarah.doctorProfile.id,
          patientId: rahim.id,
          rating: 5,
          comment: 'Very professional and thorough.',
        },
      });

      await prisma.payment.create({
        data: {
          userId: rahim.id,
          relatedType: 'APPOINTMENT',
          relatedId: appointment.id,
          amount: sarah.doctorProfile.consultationFee,
          method: 'bkash',
          status: 'PAID',
          transactionId: `SEED-${Date.now()}`,
        },
      });

      console.log('Sample appointment, health record, review and payment created for Rahim + Dr. Sarah Khan');
    }
  }

  console.log('\nSeeding complete.');
  console.log('Test logins (password: password123):');
  console.log('  Patient: rahim@mail.com');
  console.log('  Doctor:  sarah@clinic.com');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
