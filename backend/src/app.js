const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const env = require('./config/env');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/users.routes');
const doctorRoutes = require('./modules/doctors/doctors.routes');
const appointmentRoutes = require('./modules/appointments/appointments.routes');
const dailyCapacityRoutes = require('./modules/dailyCapacity/dailyCapacity.routes');
const healthRecordRoutes = require('./modules/healthRecords/healthRecords.routes');
const reviewRoutes = require('./modules/reviews/reviews.routes');
const sampleCollectionRoutes = require('./modules/sampleCollection/sampleCollection.routes');
const ambulanceRoutes = require('./modules/ambulance/ambulance.routes');
const paymentRoutes = require('./modules/payments/payments.routes');
const adminRoutes = require('./modules/admin/admin.routes');

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true,
  }),
);
app.use(express.json());
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok' }, error: null });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/daily-capacity', dailyCapacityRoutes);
app.use('/api/health-records', healthRecordRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/sample-collections', sampleCollectionRoutes);
app.use('/api/ambulance-bookings', ambulanceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
