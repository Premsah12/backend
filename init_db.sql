CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY,
  site_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  path TEXT,
  user_id TEXT,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- index to speed up queries by site + timestamp
CREATE INDEX IF NOT EXISTS idx_events_site_ts ON events(site_id, timestamp);
