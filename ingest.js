import express from "express";
import bodyParser from "body-parser";
import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT_INGEST || 3001;
const REDIS_URL = `redis://${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || 6379}`;
const QUEUE_KEY = process.env.REDIS_QUEUE_KEY || "analytics:events";

const app = express();
app.use(bodyParser.json({ limit: "100kb" }));

// create redis client
const redis = createClient({ url: REDIS_URL });
redis.on("error", (err) => console.error("Redis error (ingest):", err));

await redis.connect();

function validate(body) {
  if (!body || typeof body !== "object") return "body is required";
  if (!body.site_id) return "site_id is required";
  if (!body.event_type) return "event_type is required";
  if (!body.timestamp) return "timestamp is required";
  return null;
}

app.post("/event", async (req, res) => {
  const err = validate(req.body);
  if (err) return res.status(400).json({ error: err });

  // Minimal schema normalization
  const event = {
    site_id: String(req.body.site_id),
    event_type: String(req.body.event_type),
    path: req.body.path || null,
    user_id: req.body.user_id || null,
    timestamp: req.body.timestamp
  };

  try {
    // Push to Redis list (LPUSH for speed). Use JSON string.
    // IMPORTANT: do not wait for other services; push and respond immediately.
    await redis.lPush(QUEUE_KEY, JSON.stringify(event));
    // Immediately respond success (fast)
    res.status(202).json({ status: "accepted" });
  } catch (e) {
    console.error("Failed to push to queue:", e);
    // If redis is down, still return 503 so client can retry
    res.status(503).json({ error: "queue unavailable" });
  }
});

app.get("/", (_, res) => res.json({ status: "ingest service running" }));

app.listen(PORT, () => {
  console.log(`Ingest service running on http://localhost:${PORT}`);
});
