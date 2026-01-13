# @reliable/queue

This package provides a BullMQ-backed queue for submission jobs.

Environment
- `REDIS_URL` - Redis connection URL (default: `redis://127.0.0.1:6379`).

Usage

Enqueue:
```ts
import { enqueueSubmission } from '@reliable/queue';

await enqueueSubmission({ name: 'Alice', email: 'a@e.com', message: 'Hello' });
```

Process:
```ts
import { processSubmission } from '@reliable/queue';

processSubmission(async (job) => {
  console.log('processing', job.data);
}, 2);
```
