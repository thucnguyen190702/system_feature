import express, { Application } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { initializeDatabase } from './config/database';
import { initializeRedis } from './config/redis';
import { logger } from './config/logger';
import { requestLogger, errorLogger, errorHandler } from './middleware';
import { metricsMiddleware } from './utils/metrics';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging and monitoring middleware
app.use(requestLogger);
app.use(metricsMiddleware);

// Health check endpoint
app.get('/health', (_req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        service: 'Friend System API'
    });
});

// Routes will be added here
app.get('/', (_req, res) => {
    res.json({ 
        message: 'Friend System API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            metrics: '/metrics',
            api: '/api'
        }
    });
});

// Metrics endpoint
app.get('/metrics', (_req, res) => {
    const { metrics } = require('./utils/metrics');
    res.json({
        timestamp: new Date().toISOString(),
        metrics: metrics.getAllMetrics()
    });
});

// Error handling middleware
app.use(errorLogger);
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
    try {
        await initializeDatabase();
        
        // Initialize Redis (optional - server will work without it)
        const redis = initializeRedis();
        if (redis) {
            logger.info('✅ Redis caching enabled');
        } else {
            logger.info('⚠️  Redis not available - running without cache');
        }
        
        app.listen(PORT, () => {
            logger.info(`🚀 Server is running on port ${PORT}`);
            logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
            logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

export default app;
