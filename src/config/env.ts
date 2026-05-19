import dotenv from 'dotenv';
dotenv.config();

export default {
    port: process.env.PORT ?? 3000,
    dbUrl: process.env.DB_URL,
    webUrl: process.env.WEB_URL,
    jwtSecret: process.env.JWT_SECRET as string,
    isDevelopment: process.env.NODE_ENV === "development",
    isProduction: process.env.NODE_ENV === "production",
    isTesting: process.env.NODE_ENV === "testing",
    isStaging: process.env.NODE_ENV === "staging",
    env: process.env.NODE_ENV,
    defaultPushNotificationProvider: "firebase",
    redisUrl: process.env.REDIS_URL as string,
    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME as string,
        apiKey: process.env.CLOUDINARY_API_KEY as string,
        apiSecret: process.env.CLOUDINARY_API_SECRET as string,
        folder: "blood-bank-ms"
    },
        mailServer: {
        senderId: process.env.MAIL_EMAIL_ID as string,
        username: process.env.MAIL_USERNAME as string,
        password: process.env.MAIL_PASSWORD as string,
        host: process.env.MAIL_HOST as string,
        port: process.env.MAIL_PORT as string,
    },
    aws: {
      region: process.env.AWS_REGION as string,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
}