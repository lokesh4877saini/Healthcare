const Redis = require('ioredis');

class RedisConnection {
    constructor() {
        this.client = null;
    }

    setupClient() {
        if (this.client) {
            this.client.disconnect();
        }
        if (process.env.REDIS_URL_LOCAL) {
            console.log('Creating Redis client...');

            // Parse the REDIS_URL_LOCAL to ensure proper connection
            const redisUrl = process.env.REDIS_URL_LOCAL;

            this.client = new Redis(redisUrl, {
                maxRetriesPerRequest: null,
                enableReadyCheck: true,       // let ioredis check server ready
                connectTimeout: 30000,        // 30s connection timeout
                commandTimeout: 15000,        // 15s per command timeout
                lazyConnect: true,            // connect manually via connect()
                keepAlive: 30000,
                family: 4,
                enableAutoPipelining: false,
                autoResendUnfulfilledCommands: false,
                autoResubscribe: false,
            });
        } else {
            console.log(' REDIS_URL_LOCAL not found - Redis functionality disabled');
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
            console.log(' Redis client not configured - check REDIS_URL_LOCAL');
            return;
        }
        
        try {
            console.log('Attempting to connect to Upstash Redis...');
            await this.client.connect();
            console.log('Successfully connected to Upstash Redis');
        } catch (error) {
            console.error(' Failed to connect to Redis:', error.message);
            console.error(' Connection details:', {
                url: process.env.REDIS_URL_LOCAL ? '***' : 'missing',
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