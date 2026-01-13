import { Hono } from 'hono';
import prisma from '@reliable/db';

type SubmitPayload = {
	name: string;
	email: string;
	message: string;
};

const app = new Hono();

app.post('/submit', async (c) => {
	try {
		const json = await c.req.json();

		const hasFields =
			json &&
			typeof json.name === 'string' &&
			typeof json.email === 'string' &&
			typeof json.message === 'string';

		if (!hasFields) {
			console.warn('POST /submit invalid payload', json);
			return c.json({ status: 'error', error: 'invalid_payload' }, 400);
		}

		const body = json as SubmitPayload;
		console.log('POST /submit', body);

		// Persist to Postgres via Prisma client
		try {
			await prisma.submission.create({ data: body });
		} catch (dbErr) {
			console.error('DB error saving submission', dbErr);
			return c.json({ status: 'error', error: 'db_error' }, 500);
		}

		return c.json({ status: 'ok' });
	} catch (err) {
		console.error('Error parsing JSON', err);
		return c.json({ status: 'error', error: 'invalid_json' }, 400);
	}
});

if (typeof Bun !== 'undefined') {
	Bun.serve({ fetch: app.fetch, port: 3002 });
} else {
	console.log('Bun not detected — Hono app exported for other runtimes');
}

export default app;
