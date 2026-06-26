## notification-app-be

Notification microservice with auth, notification CRUD, Redis caching, BullMQ job queue, WebSocket delivery, and external API sync.

### Structure

- `src/app.js` — Express application entry point
- `src/config/` — environment, database, JWT, and Redis configuration
- `src/controllers/` — HTTP request handlers
- `src/routes/` — API route definitions
- `src/services/` — business logic and external API clients
- `src/repositories/` — database access layer (Prisma)
- `src/middleware/` — auth, validation, logging, and error handling
- `src/validators/` — Zod request schemas
- `src/utils/` — shared helpers (errors, responses, cache keys)
- `src/cache/` — Redis cache service
- `src/queues/` — BullMQ queue definitions
- `src/workers/` — background notification delivery worker
- `src/socket/` — Socket.IO real-time notifications

### Scripts

```bash
npm run dev      # Start API with file watch
npm start        # Start API
npm run worker   # Start notification delivery worker
```

### API routes

- `/api/auth` — registration, login, profile
- `/api/notifications` — notification management
- `/health` — health check
