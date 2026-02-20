import dotenv from 'dotenv';
// Load environment variables FIRST before any other imports
dotenv.config();

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { SocketManager } from './utils/socket.manager';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { apiLimiter } from './middleware/rate-limit.middleware';

// Routes
import authRoutes from './routes/auth.routes';
import customerRoutes from './routes/customer.routes';
import messageRoutes from './routes/message.routes';
import orderRoutes from './routes/order.routes';
import dashboardRoutes from './routes/dashboard.routes';
import settingsRoutes from './routes/settings.routes';
import webhookRoutes from './routes/webhook.routes';
import adminRoutes from './routes/admin.routes';
import shopifyRoutes from './routes/shopify.routes';


const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
const socketManager = new SocketManager(httpServer);

// Make socket manager available to routes
app.set('socketManager', socketManager);

// CORS Configuration
const allowedOrigins = [
  'https://crc2-backend.vercel.app',
  'https://crc2-backend-1u0p22vec-mohs-projects-0b03337a.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
];

// Middleware - Allow all origins temporarily for debugging
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (uploads)
app.use('/uploads', express.static('uploads'));

// API rate limiting
app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/webhook', webhookRoutes); // Changed from /api/webhooks to /api/webhook
app.use('/api/admin', adminRoutes);
app.use('/api/shopify', shopifyRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    port: PORT,
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    port: PORT,
  });
});

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 CORS allowed origins:`, allowedOrigins);
  console.log(`📊 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
  console.log('='.repeat(60));
  console.log('Available routes:');
  console.log('  POST /api/auth/register');
  console.log('  POST /api/auth/login');
  console.log('  GET  /api/auth/me');
  console.log('  GET  /health');
  console.log('  GET  /api/health');
  console.log('='.repeat(60));
});

export default app;
