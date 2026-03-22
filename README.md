# ReleaseCheck

A simple internal tool to manage and track software release checklists.

## What it does

Create releases, track their progress through a fixed checklist of steps, and add notes. The release status (planned → ongoing → done) updates automatically based on how many steps are completed.

## Tech Stack

- **Frontend:** React + Vite, deployed on Vercel
- **Backend:** FastAPI + Python, deployed on Render
- **Database:** PostgreSQL on Neon

## Running locally

**Backend**
```bash
cd backend
uv sync
# add your DATABASE_URL to .env
uv run uvicorn main:app --reload
```

**Frontend**
```bash
cd frontend
bun install
# set VITE_API_URL=http://localhost:8000 in .env
bun run dev
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/releases` | Get all releases |
| POST | `/releases` | Create a release |
| GET | `/releases/{id}` | Get a single release |
| PATCH | `/releases/{id}` | Update steps / additional info |
| DELETE | `/releases/{id}` | Delete a release |

## Database Schema
```sql
CREATE TABLE releases (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(255) NOT NULL,
  date            TIMESTAMP NOT NULL,
  steps_state     JSONB NOT NULL DEFAULT '{}',
  additional_info TEXT,
  created_at      TIMESTAMP DEFAULT NOW()
);
```

`steps_state` stores which of the 8 checklist steps are completed per release, e.g. `{"step_1": true, "step_2": false, ...}`. Status is never stored — it's computed on the fly.