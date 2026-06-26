## logging-middleware

Shared logging middleware used by Campus Evaluation backend services. Validates log payloads and forwards them to the evaluation-service log API.

### Structure

- `src/config/` — authentication config for the log API
- `src/constants/` — allowed stacks, levels, and package names
- `src/middleware/` — main `Log()` entry point
- `src/services/` — HTTP client for sending logs
- `src/validator/` — input validation for log payloads
- `example/` — usage examples

### Run example

```bash
npm run example
```
