import redisClient from "../cache/redis";

export default class CacheService {
  public static async saveToCache(key: string, value: string, ex?: number) {
    const expiry = ex ? { EX: ex } : {};
    const saved = await redisClient.set(key, value, {
      ...expiry,
    });
    return saved;
  }

  public static async getFromCache(key: string): Promise<string | null> {
    const value = await redisClient.get(key);
    return value;
  }
  public static async deleteFromCache(key: string): Promise<number | null> {
    const value = await redisClient.del(key);
    return value;
  }
}
