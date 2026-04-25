import dotenv from 'dotenv';
dotenv.config();

export default {
    port: process.env.PORT ?? 3000,
    dbUrl: process.env.DB_URL,
    jwtSecret: process.env.JWT_SECRET as string,
    isDevelopment: process.env.NODE_ENV === "development",
    isProduction: process.env.NODE_ENV === "production",
    isTesting: process.env.NODE_ENV === "testing",
    isStaging: process.env.NODE_ENV === "staging",
    env: process.env.NODE_ENV,
    defaultPushNotificationProvider: "firebase",
    redisUrl: process.env.REDIS_URL as string,
}