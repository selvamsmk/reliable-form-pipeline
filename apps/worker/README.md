# Worker

Background worker that consumes `submissionQueue` jobs and performs the PDF generation + email + DB status update.

Run:

```bash
cd apps/worker
bun run src/index.ts
```

Environment:
- `REDIS_URL` to point to Redis (when running inside Docker Compose the default `redis:6379` is used).
