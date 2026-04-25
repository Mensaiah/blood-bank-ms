import { createClient } from "redis";
import logger from "../logger";
import config from "../../config";


const redisClient = createClient({
  url: config.env.redisUrl
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));

redisClient.connect().then(() => {
  logger.info("connected redis client");
});



export default redisClient;