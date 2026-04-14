import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(process.env.REDIS_URL!);

export const hashQueue = new Queue("hash-password", {
  connection,
});