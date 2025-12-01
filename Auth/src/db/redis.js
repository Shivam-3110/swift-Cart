
import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  username: "default",
  password: process.env.REDIS_PASSWORD,
});


redis.on("connect", () => console.log("CONNECTED TO REDIS "));
redis.on("error", err => console.error("REDIS ERROR ", err));

export default redis;

