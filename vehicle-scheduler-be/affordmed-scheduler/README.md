# AffordMed Vehicle Maintenance Scheduler Microservice

A production-ready Node.js + Express microservice that optimises vehicle maintenance task scheduling across depots using the **0/1 Knapsack Dynamic Programming** algorithm.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Algorithm](#algorithm)
4. [Prerequisites](#prerequisites)
5. [Installation & Setup](#installation--setup)
6. [Environment Variables](#environment-variables)
7. [Running the Service](#running-the-service)
8. [API Reference](#api-reference)
9. [Postman Collection](#postman-collection)
10. [Project Structure](#project-structure)
11. [Design Decisions](#design-decisions)

---

## Overview

This microservice:

1. **Fetches depots** from the AffordMed Depot API (authenticated with Bearer token).
2. **Fetches vehicles** (with their maintenance tasks) from the AffordMed Vehicle API.
3. **Groups** all maintenance tasks by `depotId`.
4. **Runs 0/1 Knapsack DP** per depot to maximise total **Impact** while keeping total **Duration ≤ MechanicHours**.
5. **Returns** the selected `TaskID`s for every depot in a single JSON response.

No vehicle or depot data is ever hardcoded — all data comes from the APIs at runtime.

---

## Architecture

```
src/
├── config/          # Centralised env-driven configuration + startup guard
├── controllers/     # Thin HTTP layer — parse req, call service, send res
├── middleware/      # AffordMed logging middleware (request / response / error)
├── routes/          # Express router definitions
├── services/        # Business logic + external API calls
│   ├── depotService.js      – fetches depots
│   ├── vehicleService.js    – fetches vehicles
│   └── schedulerService.js  – orchestrates + runs knapsack per depot
└── utils/
    ├── httpClient.js   – Axios factory with auth & logging interceptors
    ├── knapsack.js     – 0/1 Knapsack DP (O(n×W) time, O(W) space)
    └── logger.js       – Structured JSON logger
```

---

## Algorithm

### 0/1 Knapsack Dynamic Programming

For each depot with **MechanicHours = W** and a set of **n tasks** each with `duration` and `impact`:

- **Capacity** = W (available mechanic hours)
- **Weight** of each task = `duration`
- **Value** of each task = `impact`
- **Goal** = maximise total `impact` without exceeding `duration` budget W

**Implementation highlights** (`src/utils/knapsack.js`):

| Property | Detail |
|---|---|
| Time complexity | O(n × W) |
| Space complexity | O(W) — single rolling row |
| Backtracking | Separate `Uint8Array[n][W]` chosen-flag matrix |
| Float support | Durations scaled ×100 → integers before DP, unscaled in output |
| Memory | `Float64Array` for `dp` table (faster than plain JS Array) |

---

## Prerequisites

- **Node.js ≥ 18**
- **npm ≥ 9**
- Valid AffordMed API Bearer token
- Network access to the Depot and Vehicle APIs

---

## Installation & Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd affordmed-vehicle-maintenance-scheduler

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# → Edit .env and fill in your values (see below)
```

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `3000` | HTTP port the server listens on |
| `NODE_ENV` | No | `development` | `development` or `production` |
| `AFFORDMED_API_TOKEN` | **Yes** | — | Bearer token for all AffordMed API calls |
| `DEPOT_API_BASE_URL` | **Yes** | — | Base URL of the Depot API (e.g. `https://api.affordmed.com`) |
| `VEHICLE_API_BASE_URL` | **Yes** | — | Base URL of the Vehicle API |
| `DEPOT_API_PATH` | No | `/depots` | Path appended to `DEPOT_API_BASE_URL` |
| `VEHICLE_API_PATH` | No | `/vehicles` | Path appended to `VEHICLE_API_BASE_URL` |
| `API_TIMEOUT` | No | `10000` | Axios request timeout in milliseconds |
| `LOG_LEVEL` | No | `info` | `debug`, `info`, `warn`, or `error` |

The service **exits at startup** if any required variable is missing, so misconfiguration is caught immediately.

---

## Running the Service

```bash
# Production
npm start

# Development (auto-restart on file changes)
npm run dev
```

Expected startup log:
```json
{"timestamp":"...","level":"info","message":"AffordMed Maintenance Scheduler started","port":3000,"env":"development","pid":12345}
```

---

## API Reference

### `GET /health`

Liveness probe.

**Response 200:**
```json
{
  "status": "ok",
  "service": "affordmed-vehicle-maintenance-scheduler",
  "timestamp": "2024-06-01T10:00:00.000Z",
  "uptime": 42.3,
  "memory": { "rss": 30457856, "heapUsed": 5242880 }
}
```

---

### `GET /api/schedule`

Runs the full optimisation pipeline and returns the maintenance schedule.

**Response 200:**
```json
{
  "success": true,
  "timestamp": "2024-06-01T10:00:00.000Z",
  "count": 2,
  "schedule": [
    {
      "depotId": "D1",
      "depotName": "Central Depot",
      "mechanicHours": 40,
      "taskCount": 10,
      "selectedTaskIds": ["T1", "T3", "T7"],
      "totalImpact": 85,
      "totalDuration": 38
    },
    {
      "depotId": "D2",
      "depotName": "East Depot",
      "mechanicHours": 30,
      "taskCount": 6,
      "selectedTaskIds": ["T2", "T5"],
      "totalImpact": 60,
      "totalDuration": 28
    }
  ]
}
```

**Response 500** (upstream API failure):
```json
{
  "success": false,
  "timestamp": "...",
  "error": { "message": "Depot API error: Request failed with status code 401" }
}
```

---

## Postman Collection

Import `postman/AffordMed_Scheduler.postman_collection.json` into Postman.

Set the **`baseUrl`** collection variable to your server address (default: `http://localhost:3000`).

The collection includes:
- `GET /health`
- `GET /api/schedule` with example 200 and 500 responses

---

## Project Structure

```
affordmed-vehicle-maintenance-scheduler/
├── .env.example
├── .gitignore
├── package.json
├── README.md
├── postman/
│   └── AffordMed_Scheduler.postman_collection.json
└── src/
    ├── app.js                          # Express app (middleware + routes)
    ├── server.js                       # HTTP server + graceful shutdown
    ├── config/
    │   └── index.js                    # Env config + startup guard
    ├── controllers/
    │   ├── healthController.js
    │   └── schedulerController.js
    ├── middleware/
    │   └── loggingMiddleware.js        # requestLogger, errorHandler, notFoundHandler
    ├── routes/
    │   ├── healthRoutes.js
    │   └── schedulerRoutes.js
    ├── services/
    │   ├── depotService.js
    │   ├── vehicleService.js
    │   └── schedulerService.js
    └── utils/
        ├── httpClient.js               # Axios factory with auth + logging interceptors
        ├── knapsack.js                 # 0/1 Knapsack DP
        └── logger.js                   # Structured JSON logger
```

---

## Design Decisions

| Decision | Rationale |
|---|---|
| Single-row rolling DP | Reduces space from O(n×W) → O(W); essential for large W |
| `Float64Array` for DP table | ~2–3× faster than plain JS Array for numeric operations |
| `Uint8Array` for chosen flags | 1 byte/cell vs 8 bytes for Boolean; significant for large n×W grids |
| Decimal scaling (×100) | Avoids floating-point comparison bugs when durations have decimals |
| Parallel depot+vehicle fetch | `Promise.all` cuts wall-clock time roughly in half |
| Startup config guard | Exits immediately if required env vars are missing — fail-fast |
| Structured JSON logging | Machine-parseable; compatible with ELK, Datadog, Cloud Logging |
| Defensive field normalisation | Handles minor API response shape variations without crashing |
