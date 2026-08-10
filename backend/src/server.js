import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import productsRoutes from './routes/products.js';
import ordersRoutes from './routes/orders.js';
import conversationsRoutes from './routes/conversations.js';
import reviewsRoutes from './routes/reviews.js';
import reportsRoutes from './routes/reports.js';
import paymentsRoutes from './routes/payments.js';
import mapRoutes from './routes/map.js';
import { logger } from './utils/logger.js';

const app = express();
const PORT = process.env.PORT || 5000;

// --------------- Security Middleware ---------------

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Global rate limiter — 100 requests per 15 min per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});
app.use(globalLimiter);

// --------------- Body Parsing ---------------

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --------------- API Routes ---------------

app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/conversations', conversationsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/map', mapRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --------------- Error Handling ---------------

// 404 for unmatched routes
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

// --------------- Start Server ---------------

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

export default app;
