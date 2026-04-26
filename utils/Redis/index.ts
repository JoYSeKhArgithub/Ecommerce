import { createClient } from "redis";
import logger from "../logger";

type RedisClientInstance = ReturnType<typeof createClient>;

class RedisClient {
    private static instance: RedisClientInstance | null = null;

    static async getInstance(): Promise<RedisClientInstance> {
        if (!this.instance) {
            if (!process.env.REDIS_URL) {
                throw new Error("Missing REDIS_URL");
            }

            const client = createClient({
                url: process.env.REDIS_URL,
                socket: {
                    reconnectStrategy: (retries) => {
                        if (retries > 10) return new Error("Retry failed");
                        return Math.min(retries * 100, 3000);
                    },
                },
            });

            client.on("error", (err) => logger.error("Redis Error:", err));
            client.on("connect", () => logger.debug("Redis connected"));
            client.on("reconnecting", () => logger.debug("Reconnecting..."));

            await client.connect();

            this.instance = client;
        }

        return this.instance;
    }
}

export default RedisClient;