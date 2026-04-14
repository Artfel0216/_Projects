import { Worker } from "bullmq";
import IORedis from "ioredis";
import bcrypt from "bcrypt";

const connection = new IORedis(process.env.REDIS_URL!);

new Worker(
  "hash-password",
  async (job) => {
    const { password } = job.data;
    return await bcrypt.hash(password, 10);
  },
  { connection }
);