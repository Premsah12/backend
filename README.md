# backend
This project is a backend analytics system with three services: an Ingest API for fast event collection, a Processor that reads events from Redis and stores metrics in PostgreSQL, and an Analytics API that returns real-time insights. All components run through Docker Compose for easy setup and scalability.


Analytics Event Tracking Backend
A complete backend system for real-time event tracking, built with Node.js, Redis Streams, PostgreSQL, and Docker. The architecture includes three microservices—Ingest, Processor, and Analytics API—that work together to collect, process, and serve analytics data for dashboards and insights.

🚀 Features
1. Event Ingestion Service (Port 3001)

Accepts analytics events via REST API

Pushes event payloads into Redis Streams

Lightweight, fast, and suitable for high traffic

2. Event Processor Service (Port 3002)

Reads events from Redis Streams

Processes & transforms raw events

Stores aggregated data in PostgreSQL

3. Analytics API Service (Port 3003)

Fetch processed analytics data

Endpoints for dashboards, charts, and visualizations

Supports filters (date range, page name, event type, etc.)

4. Fully Containerized

Redis

PostgreSQL

PgAdmin

Easy setup with docker-compose up -d
Tech Stack
Component	Technology
Runtime	Node.js
Framework	Express.js
Data Queue	Redis Streams
Database	PostgreSQL
Admin Panel	PgAdmin
Containerization	Docker & Docker Compose

folder structure
/analytics-backend
│── ingest.js
│── processor.js
│── report.js
│── init_db.sql
│── docker-compose.yml
│── package.json
│── .env
│── .env.example
└── node_modules/
Setup Instructions
1. Start Backend Services
docker-compose up -d

2. Start Ingest Service
npm run start:ingest

3. Start Processor
npm run start:processor

4. Start API Service
npm run start:api

🧪 Testing the Ingest API
POST /ingest
http://localhost:3001/ingest

Body Example
{
  "event": "page_view",
  "timestamp": "2025-11-14T10:00:00Z",
  "userId": "U001",
  "page": "/home"
}

📊 Analytics Examples

Total events per day

Unique users per hour

Page view counts

Most visited pages

Session tracking

📒 Environment Variables

Your .env file should contain:

REDIS_HOST=localhost
REDIS_PORT=6379

PG_HOST=localhost
PG_USER=postgres
PG_PASSWORD=your_password
PG_DATABASE=analytics

PORT=3001

📈 Future Enhancements

Kafka support

Batch processing

Admin dashboard UI

JWT authentication

Multi-project analytics tracking

 Author

Prem Sah
B.Tech (4rd Year) | Backend Developer | ML & AI Enthusiast

3. Resume Summary (Professional + Short)

Built a complete analytics backend system using Node.js, Redis Streams, PostgreSQL, and Docker. Developed three microservices (Ingest, Processor, API) capable of real-time event ingestion, transformation, and analytics delivery for dashboards. Implemented scalable architecture with data pipelines, Redis queues, database schema design, and production-ready deployment setup.
