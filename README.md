Analytics Backend System

A scalable backend system for capturing, processing, and serving website analytics data. Built using a microservice architecture with Redis Streams for asynchronous event processing and PostgreSQL for persistent storage. The system includes three services: Ingest API, Processor, and Analytics API, all orchestrated using Docker Compose.

1. Architecture Decision
Asynchronous Processing (Queue Design)

To achieve extremely fast ingestion, the system uses Redis Streams as an event queue.
Why Redis Streams?

Extremely fast (in-memory)

Built for high-throughput event pipelines

Supports consumer groups for scalable background workers

Prevents blocking the ingestion API

Allows durable, ordered event processing

Flow:

Ingest service receives event → validates → pushes to Redis Stream

Processor service consumes the stream → processes event → stores in PostgreSQL

Analytics API reads aggregated data from PostgreSQL

This ensures the client gets an immediate response while the heavy processing is handled asynchronously.

2. Database Schema

A simple PostgreSQL schema:

Table: events
Column	Type	Description
id	SERIAL PK	Unique event ID
site_id	TEXT	Identifier of the website
event_type	TEXT	e.g., page_view
path	TEXT	Requested page path
user_id	TEXT	User identifier
timestamp	TIMESTAMP	When the event occurred
Table: daily_stats
Column	Type	Description
site_id	TEXT	Website ID
date	DATE	Statistic date
total_views	INTEGER	Total page views
unique_users	INTEGER	Count of unique users

(You can add more aggregates as needed.)

3. Setup Instructions
Prerequisites

Docker & Docker Compose installed

Node.js installed (if running services manually)

Step 1 – Clone the Project
git clone <your-repo-link>
cd analytics-backend

Step 2 – Create Environment File

Copy .env.example to .env:

Windows PowerShell:

Copy-Item .env.example .env

Step 3 – Start All Services Using Docker
docker-compose up -d


This starts:

Redis

PostgreSQL

PgAdmin

All Node services (ingest, processor, report)

Step 4 – Verify Services Are Running
docker ps


You should see containers for redis, postgres, ingest, processor, and report.

Step 5 – Access PgAdmin

Open in browser:

http://localhost:5050


Default credentials are in your .env.

4. API Usage
POST /event (Ingest API – Port 3001)
curl -X POST http://localhost:3001/event ^
  -H "Content-Type: application/json" ^
  -d "{ \"site_id\": \"site-abc-123\", \"event_type\": \"page_view\", \"path\": \"/home\", \"user_id\": \"user-001\", \"timestamp\": \"2025-11-12T10:00:00Z\" }"


Expected response:

{"status":"ok"}

GET /stats (Analytics API – Port 3003)
curl "http://localhost:3003/stats?site_id=site-abc-123&date=2025-11-12"


Example output:

{
  "site_id": "site-abc-123",
  "date": "2025-11-12",
  "total_views": 1450,
  "unique_users": 212,
  "top_paths": [
    { "path": "/pricing", "views": 700 },
    { "path": "/blog/post-1", "views": 500 },
    { "path": "/", "views": 250 }
  ]
}

5. Project Structure
analytics-backend/
│── ingest.js
│── processor.js
│── report.js
│── docker-compose.yml
│── init_db.sql
│── package.json
│── .env
