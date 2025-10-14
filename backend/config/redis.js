const Redis = require('ioredis');

class RedisConnection {
    constructor() {
        this.client = null;
    }

    setupClient() {
        if (this.client) {
            this.client.disconnect();
        }        
        if (process.env.REDIS_URL) {
            console.log('Creating Redis client...');
            
            // Parse the REDIS_URL to ensure proper connection
            const redisUrl = process.env.REDIS_URL;
            
            this.client = new Redis(redisUrl, {
                maxRetriesPerRequest: null,
                enableReadyCheck: false,
                connectTimeout: 30000,
                commandTimeout: 15000,
                retryDelayOnFailover: 1000,
                lazyConnect: true,
                keepAlive: 30000,
                family: 4,
                // Force using only the provided URL, no fallbacks
                enableAutoPipelining: false,
                autoResendUnfulfilledCommands: false,
                autoResubscribe: false,
                // Disable any local Redis fallback
                retryDelayOnFailover: 0,
                maxLoadingRetryTime: 0
            });
        } else {
            console.log(' REDIS_URL not found - Redis functionality disabled');
            this.client = null;
            return;
        }

        this.setupEventListeners();
    }

    setupEventListeners() {
        if (!this.client) {
            return;
        }

        this.client.on('connect', () => {
            console.log('Redis connected successfully to Upstash');
        });

        this.client.on('error', (err) => {
            console.error(' Redis connection error:', err.message);
            console.error(' Error details:', {
                code: err.code,
                address: err.address,
                port: err.port
            });
        });

        this.client.on('close', () => {
            console.log('Redis connection closed');
        });

        this.client.on('reconnecting', (delay) => {
            console.log(`Redis reconnecting in ${delay}ms`);
        });
    }

    async connect() {
        if (!this.client) {
            console.log(' Redis client not configured - check REDIS_URL');
            return;
        }
        
        try {
            console.log('Attempting to connect to Upstash Redis...');
            await this.client.connect();
            console.log('Successfully connected to Upstash Redis');
        } catch (error) {
            console.error(' Failed to connect to Redis:', error.message);
            console.error(' Connection details:', {
                url: process.env.REDIS_URL ? '***' : 'missing',
                errorCode: error.code
            });
            throw error;
        }
    }

    async disconnect() {
        if (this.client && this.client.status === 'ready') {
            await this.client.quit();
        }
    }

    isReady() {
        return this.client && this.client.status === 'ready';
    }

    getStatus() {
        return this.client ? this.client.status : 'not configured';
    }
}

// Singleton instance
const redisConnection = new RedisConnection();

module.exports = { redisConnection };