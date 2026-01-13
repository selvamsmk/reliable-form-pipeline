import { Hono } from 'hono';
import prisma from '@reliable/db';
import { generateSubmissionPdf, type Submission as MailerSubmission, sendSubmissionEmail } from '@reliable/mailer';
import type { Submission as DbSubmission, SubmissionStatus as _SubmissionStatus } from '@reliable/db';

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
		let created: DbSubmission;
		try {
			created = await prisma.submission.create({ data: body });
		} catch (dbErr) {
			console.error('DB error saving submission', dbErr);
			return c.json({ status: 'error', error: 'db_error' }, 500);
		}

		// Generate a PDF from the saved submission, send it via SMTP, and update status
		try {
			const submissionForPdf: MailerSubmission = {
				id: created.id,
				name: created.name,
				email: created.email,
				message: created.message,
				createdAt: created.createdAt?.toString?.() ?? new Date().toISOString(),
			};

			const pdfBuffer = await generateSubmissionPdf(submissionForPdf as any);

			// Send email with PDF attachment (Mailhog-compatible SMTP assumed at localhost:1025)
			await sendSubmissionEmail(submissionForPdf, pdfBuffer);

			// Update DB status to COMPLETED
			try {
				await prisma.submission.update({ where: { id: created.id }, data: { status: 'COMPLETED' } });
			} catch (updateErr) {
				console.error('DB error updating submission status', updateErr);
				return c.json({ status: 'error', error: 'db_update_error' }, 500);
			}

			// Return submission id only
			return c.json({ status: 'ok', id: created.id });
		} catch (errSend) {
			console.error('Error during PDF/email/update flow', errSend);
			return c.json({ status: 'error', error: 'processing_failed' }, 500);
		}
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
