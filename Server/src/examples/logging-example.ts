/**
 * Example demonstrating logging and metrics usage
 * This file shows how to integrate logging and metrics into your services
 */

import { logger } from '../config/logger';
import { metrics, MetricNames } from '../utils/metrics';

/**
 * Example 1: Basic logging
 */
function basicLoggingExample() {
    logger.info('This is an info message');
    logger.warn('This is a warning message');
    logger.error('This is an error message');
    logger.debug('This is a debug message (only in development)');
}

/**
 * Example 2: Logging with context
 */
function loggingWithContextExample() {
    const userId = 'user-123';
    const action = 'login';
    
    logger.info('User action', {
        userId,
        action,
        timestamp: new Date().toISOString(),
        ip: '192.168.1.1'
    });
}

/**
 * Example 3: Error logging with stack trace
 */
function errorLoggingExample() {
    try {
        throw new Error('Something went wrong');
    } catch (error) {
        logger.error('Operation failed', {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            context: {
                operation: 'exampleOperation',
                userId: 'user-123'
            }
        });
    }
}

/**
 * Example 4: Metrics - Counters
 */
function metricsCounterExample() {
    // Increment a counter
    metrics.incrementCounter(MetricNames.API_REQUESTS_TOTAL);
    metrics.incrementCounter(MetricNames.FRIEND_REQUESTS_SENT);
    
    // Increment by a specific amount
    metrics.incrementCounter(MetricNames.API_REQUESTS_TOTAL, 5);
    
    // Get counter value
    const totalRequests = metrics.getCounter(MetricNames.API_REQUESTS_TOTAL);
    logger.info('Total requests', { count: totalRequests });
}

/**
 * Example 5: Metrics - Gauges
 */
function metricsGaugeExample() {
    // Record current value
    metrics.recordGauge(MetricNames.ACCOUNTS_ONLINE, 150);
    
    // Get gauge value
    const onlineAccounts = metrics.getGauge(MetricNames.ACCOUNTS_ONLINE);
    logger.info('Online accounts', { count: onlineAccounts });
}

/**
 * Example 6: Metrics - Histograms
 */
function metricsHistogramExample() {
    // Record response times
    metrics.recordHistogram(MetricNames.API_RESPONSE_TIME, 45);
    metrics.recordHistogram(MetricNames.API_RESPONSE_TIME, 120);
    metrics.recordHistogram(MetricNames.API_RESPONSE_TIME, 85);
    
    // Get histogram statistics
    const stats = metrics.getHistogramStats(MetricNames.API_RESPONSE_TIME);
    if (stats) {
        logger.info('Response time statistics', {
            count: stats.count,
            min: stats.min,
            max: stats.max,
            avg: stats.avg
        });
    }
}

/**
 * Example 7: Service method with logging and metrics
 */
async function serviceMethodExample(userId: string, friendId: string): Promise<void> {
    logger.info('Sending friend request', { userId, friendId });
    
    const startTime = Date.now();
    
    try {
        // Simulate async operation
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Track success
        metrics.incrementCounter(MetricNames.FRIEND_REQUESTS_SENT);
        metrics.incrementCounter(MetricNames.API_REQUESTS_SUCCESS);
        
        const duration = Date.now() - startTime;
        metrics.recordHistogram(MetricNames.API_RESPONSE_TIME, duration);
        
        logger.info('Friend request sent successfully', {
            userId,
            friendId,
            duration: `${duration}ms`
        });
    } catch (error) {
        // Track error
        metrics.incrementCounter(MetricNames.ERRORS_TOTAL);
        metrics.incrementCounter(MetricNames.API_REQUESTS_ERROR);
        
        logger.error('Failed to send friend request', {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            userId,
            friendId
        });
        
        throw error;
    }
}

/**
 * Example 8: Get all metrics
 */
function getAllMetricsExample() {
    const allMetrics = metrics.getAllMetrics();
    
    logger.info('All metrics', {
        counters: allMetrics.counters,
        gauges: allMetrics.gauges,
        histograms: allMetrics.histograms
    });
}

/**
 * Example 9: Metrics summary
 */
function metricsSummaryExample() {
    metrics.logSummary();
}

/**
 * Run all examples
 */
async function runExamples() {
    logger.info('=== Starting Logging and Metrics Examples ===');
    
    basicLoggingExample();
    loggingWithContextExample();
    errorLoggingExample();
    
    metricsCounterExample();
    metricsGaugeExample();
    metricsHistogramExample();
    
    await serviceMethodExample('user-123', 'user-456');
    
    getAllMetricsExample();
    metricsSummaryExample();
    
    logger.info('=== Examples Complete ===');
}

// Run examples if this file is executed directly
if (require.main === module) {
    runExamples().catch(error => {
        logger.error('Example execution failed', {
            error: error.message,
            stack: error.stack
        });
    });
}

export {
    basicLoggingExample,
    loggingWithContextExample,
    errorLoggingExample,
    metricsCounterExample,
    metricsGaugeExample,
    metricsHistogramExample,
    serviceMethodExample,
    getAllMetricsExample,
    metricsSummaryExample
};
