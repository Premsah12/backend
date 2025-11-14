import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { Client as PGClient } from "pg";

dotenv.config();

const PORT = process.env.PORT_REPORT || 3002;

const pg = new PGClient({
  host: process.env.POSTGRES_HOST || "localhost",
  port: +process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || "analyticsdb",
  user: process.env.POSTGRES_USER || "analytics",
  password: process.env.POSTGRES_PASSWORD || "analytics",
});

await pg.connect();

const app = express();
app.use(bodyParser.json());

/**
 * GET /stats?site_id=...&date=YYYY-MM-DD
 * If date omitted, defaults to today (UTC).
 */
app.get("/stats", async (req, res) => {
  try {
    const site_id = req.query.site_id;
    if (!site_id) return res.status(400).json({ error: "site_id is required" });

    let date = req.query.date;
    if (!date) {
      // default UTC date string
      date = new Date().toISOString().slice(0, 10);
    }

    // compute start and end timestamps in UTC for the date
    const start = `${date}T00:00:00Z`;
    const end = `${date}T23:59:59.999Z`;

    // total views
    const totalRes = await pg.query(
      `SELECT COUNT(*)::int AS total_views FROM events WHERE site_id=$1 AND timestamp >= $2 AND timestamp <= $3`,
      [site_id, start, end]
    );
    const total_views = totalRes.rows[0].total_views || 0;

    // unique users
    const uniqRes = await pg.query(
      `SELECT COUNT(DISTINCT user_id)::int AS unique_users FROM events WHERE site_id=$1 AND timestamp >= $2 AND timestamp <= $3 AND user_id IS NOT NULL`,
      [site_id, start, end]
    );
    const unique_users = uniqRes.rows[0].unique_users || 0;

    // top paths
    const pathsRes = await pg.query(
      `SELECT COALESCE(path,'/') AS path, COUNT(*)::int AS views
       FROM events
       WHERE site_id=$1 AND timestamp >= $2 AND timestamp <= $3
       GROUP BY COALESCE(path,'/')
       ORDER BY views DESC
       LIMIT 10`,
      [site_id, start, end]
    );

    const top_paths = pathsRes.rows.map(r => ({ path: r.path, views: r.views }));

    res.json({
      site_id, date, total_views, unique_users, top_paths
    });
  } catch (e) {
    console.error("Reporting error:", e);
    res.status(500).json({ error: "internal error" });
  }
});

app.get("/", (_, res) => res.json({ status: "reporting service running" }));

app.listen(PORT, () => {
  console.log(`Reporting service running on http://localhost:${PORT}`);
});
