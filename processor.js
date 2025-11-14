import { createClient as createRedisClient } from "redis";
import { Client as PGClient } from "pg";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const REDIS_URL = `redis://${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || 6379}`;
const QUEUE_KEY = process.env.REDIS_QUEUE_KEY || "analytics:events";

const pg = new PGClient({
  host: process.env.POSTGRES_HOST || "localhost",
  port: +process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || "analyticsdb",
  user: process.env.POSTGRES_USER || "analytics",
  password: process.env.POSTGRES_PASSWORD || "analytics",
});

const redis = createRedisClient({ url: REDIS_URL });

async function initDB() {
  await pg.connect();
  const sql = fs.readFileSync(path.resolve("./init_db.sql"), "utf8");
  await pg.query(sql);
  console.log("DB initialized or confirmed.");
}

async function runWorker() {
  await redis.connect();
  console.log("Worker connected to Redis.");

  // Loop forever: use BRPOP with timeout to block waiting for new items
  while (true) {
    try {
      // BRPOP returns [key, value] or null
      // Timeout 5 seconds to allow graceful interrupt checks
      const res = await redis.brPop(QUEUE_KEY, 5);
      if (!res) {
        // no item, continue
        continue;
      }
      const item = res.element || res[1]; // redis@4 structure might give element
      // parse event
      let event;
      try {
        event = JSON.parse(item);
      } catch (e) {
        console.error("Malformed JSON from queue, skipping:", e);
        continue;
      }

      // Basic processing: parse timestamp into timestamptz
      const { site_id, event_type, path: p, user_id, timestamp } = event;
      // Insert into events table (non-blocking to clients since worker only)
      await pg.query(
        `INSERT INTO events (site_id, event_type, path, user_id, timestamp) VALUES ($1,$2,$3,$4,$5)`,
        [site_id, event_type, p, user_id, timestamp]
      );
      // For heavy load, you could batch inserts; this simple worker inserts one-by-one.
    } catch (err) {
      console.error("Worker error:", err);
      // sleep a bit if persistent error (not too long)
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}

(async () => {
  try {
    await initDB();
    await runWorker();
  } catch (e) {
    console.error("Processor startup error:", e);
    process.exit(1);
  }
})();
