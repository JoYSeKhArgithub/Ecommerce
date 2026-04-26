import RedisClient from ".";

export const RedisService = {
    async set(key: string, value: any, ttl?: number) {
        const redis = await RedisClient.getInstance();

        await redis.set(
            key,
            JSON.stringify(value),
            ttl ? { EX: ttl } : {}
        );
    },

    async get(key: string) {
        const redis = await RedisClient.getInstance();

        const data = await redis.get(key);
        return data ? JSON.parse(data) : null;
    },

    async del(key: string) {
        const redis = await RedisClient.getInstance();
        await redis.del(key);
    },
};