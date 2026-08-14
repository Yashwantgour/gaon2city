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
import categoriesRoutes from './routes/categories.js';
import { logger } from './utils/logger.js';

const app = express();
const PORT = process.env.PORT || 5000;

// --------------- Security Headers (Helmet) ---------------

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false, // API server returning JSON
    frameguard: { action: 'deny' },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    xContentTypeOptions: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);

// --------------- CORS Configuration ---------------

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((url) => url.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      return callback(new Error('Blocked by CORS policy'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// --------------- Rate Limiting ---------------

// Global baseline rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});
app.use(globalLimiter);

// Specific stricter limiter for Auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts, please try again later.' },
});

// Specific stricter limiter for Reports
const reportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many report submissions, please try again later.' },
});

// --------------- Body Parsing & Request Logging ---------------

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// Sanitized HTTP request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// --------------- API Routes ---------------

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/conversations', conversationsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/reports', reportLimiter, reportsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/map', mapRoutes);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// --------------- Error Handling ---------------

// 404 handler for unmatched routes
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Centralized error handler
app.use(errorHandler);

// --------------- Start Server ---------------

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

export default app;
