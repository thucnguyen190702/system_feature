import { logger } from '../config/logger';

/**
 * Metrics collection for monitoring system performance
 */
class MetricsCollector {
    private metrics: Map<string, number>;
    private counters: Map<string, number>;
    private histograms: Map<string, number[]>;
    
    constructor() {
        this.metrics = new Map();
        this.counters = new Map();
        this.histograms = new Map();
    }
    
    /**
     * Increment a counter metric
     */
    incrementCounter(name: string, value: number = 1): void {
        const current = this.counters.get(name) || 0;
        this.counters.set(name, current + value);
        
        logger.debug('Counter incremented', { metric: name, value: current + value });
    }
    
    /**
     * Record a gauge metric (current value)
     */
    recordGauge(name: string, value: number): void {
        this.metrics.set(name, value);
        
        logger.debug('Gauge recorded', { metric: name, value });
    }
    
    /**
     * Record a histogram value (for timing, sizes, etc.)
     */
    recordHistogram(name: string, value: number): void {
        const values = this.histograms.get(name) || [];
        values.push(value);
        this.histograms.set(name, values);
        
        logger.debug('Histogram value recorded', { metric: name, value });
    }
    
    /**
     * Get counter value
     */
    getCounter(name: string): number {
        return this.counters.get(name) || 0;
    }
    
    /**
     * Get gauge value
     */
    getGauge(name: string): number | undefined {
        return this.metrics.get(name);
    }
    
    /**
     * Get histogram statistics
     */
    getHistogramStats(name: string): { count: number; min: number; max: number; avg: number } | null {
        const values = this.histograms.get(name);
        if (!values || values.length === 0) {
            return null;
        }
        
        const count = values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);
        const avg = values.reduce((a, b) => a + b, 0) / count;
        
        return { count, min, max, avg };
    }
    
    /**
     * Get all metrics
     */
    getAllMetrics(): {
        counters: Record<string, number>;
        gauges: Record<string, number>;
        histograms: Record<string, any>;
    } {
        const counters: Record<string, number> = {};
        this.counters.forEach((value, key) => {
            counters[key] = value;
        });
        
        const gauges: Record<string, number> = {};
        this.metrics.forEach((value, key) => {
            gauges[key] = value;
        });
        
        const histograms: Record<string, any> = {};
        this.histograms.forEach((values, key) => {
            histograms[key] = this.getHistogramStats(key);
        });
        
        return { counters, gauges, histograms };
    }
    
    /**
     * Reset all metrics
     */
    reset(): void {
        this.metrics.clear();
        this.counters.clear();
        this.histograms.clear();
        
        logger.info('Metrics reset');
    }
    
    /**
     * Log current metrics summary
     */
    logSummary(): void {
        const metrics = this.getAllMetrics();
        
        logger.info('Metrics Summary', {
            counters: metrics.counters,
            gauges: metrics.gauges,
            histograms: metrics.histograms,
            timestamp: new Date().toISOString()
        });
    }
}

// Singleton instance
export const metrics = new MetricsCollector();

// Common metric names
export const MetricNames = {
    // API Requests
    API_REQUESTS_TOTAL: 'api_requests_total',
    API_REQUESTS_SUCCESS: 'api_requests_success',
    API_REQUESTS_ERROR: 'api_requests_error',
    API_RESPONSE_TIME: 'api_response_time_ms',
    
    // Friend System
    FRIEND_REQUESTS_SENT: 'friend_requests_sent',
    FRIEND_REQUESTS_ACCEPTED: 'friend_requests_accepted',
    FRIEND_REQUESTS_REJECTED: 'friend_requests_rejected',
    FRIENDS_ADDED: 'friends_added',
    FRIENDS_REMOVED: 'friends_removed',
    
    // Accounts
    ACCOUNTS_CREATED: 'accounts_created',
    ACCOUNTS_UPDATED: 'accounts_updated',
    ACCOUNTS_ONLINE: 'accounts_online',
    
    // Database
    DB_QUERIES_TOTAL: 'db_queries_total',
    DB_QUERY_TIME: 'db_query_time_ms',
    
    // Cache
    CACHE_HITS: 'cache_hits',
    CACHE_MISSES: 'cache_misses',
    
    // Errors
    ERRORS_TOTAL: 'errors_total',
    ERRORS_BY_TYPE: 'errors_by_type'
};

/**
 * Middleware to track API metrics
 */
export function metricsMiddleware(req: any, res: any, next: any): void {
    const startTime = Date.now();
    
    metrics.incrementCounter(MetricNames.API_REQUESTS_TOTAL);
    
    // Capture response
    const originalSend = res.send;
    res.send = function(data: any): any {
        const duration = Date.now() - startTime;
        
        metrics.recordHistogram(MetricNames.API_RESPONSE_TIME, duration);
        
        if (res.statusCode >= 200 && res.statusCode < 400) {
            metrics.incrementCounter(MetricNames.API_REQUESTS_SUCCESS);
        } else {
            metrics.incrementCounter(MetricNames.API_REQUESTS_ERROR);
        }
        
        return originalSend.call(this, data);
    };
    
    next();
}

// Log metrics summary every 5 minutes
if (process.env.NODE_ENV === 'production') {
    setInterval(() => {
        metrics.logSummary();
    }, 5 * 60 * 1000);
}
