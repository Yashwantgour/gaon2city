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

// --------------- Keep-Alive & Ping Routes (Render Warm-up) ---------------
// Bypasses heavy middleware so cron jobs / self-pings are instant & light
app.get(['/ping', '/api/ping'], (_req, res) => {
  res.status(200).json({
    status: 'alive',
    message: 'Server is active and awake',
    timestamp: new Date().toISOString(),
  });
});

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
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server, cron pings)
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

// Sanitized HTTP request logger (ignores automated ping logs to avoid noise)
app.use((req, res, next) => {
  if (req.path === '/ping' || req.path === '/api/ping') {
    return next();
  }
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

// --------------- Start Server & Render Keep-Alive ---------------

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);

  // Automatic Keep-Alive Self-Ping for Render Free Tier (Sleeps after 15 min inactivity)
  // Sends a lightweight ping every 14 minutes to keep instance warm and active
  const serverUrl =
    process.env.RENDER_EXTERNAL_URL ||
    process.env.SERVER_URL ||
    'https://gaon2city.onrender.com';

  if (process.env.NODE_ENV === 'production' || process.env.ENABLE_KEEP_ALIVE === 'true') {
    const PING_INTERVAL_MS = 14 * 60 * 1000; // 14 minutes
    logger.info(`Keep-alive self-ping initialized for ${serverUrl}/ping every 14 minutes.`);

    setInterval(async () => {
      try {
        const pingUrl = `${serverUrl.replace(/\/$/, '')}/ping`;
        const res = await fetch(pingUrl);
        if (res.ok) {
          logger.info(`Keep-alive ping success: ${pingUrl} (${res.status})`);
        }
      } catch (err) {
        logger.warn(`Keep-alive ping error: ${err.message}`);
      }
    }, PING_INTERVAL_MS);
  }
});

export default app;
