# reliable-form-pipeline

Monorepo scaffold using Turborepo with Bun and TypeScript.

Prerequisites
- Install Bun: https://bun.sh/

Install

```bash
bun install
```

Run

Run turbo scripts (root):

```bash
bun run dev
# or
bun run build
```

Run an individual app (from its directory):

```bash
cd apps/api
bun run src/index.ts
```

Structure
- apps/api, apps/worker, apps/web — minimal Bun TypeScript apps
- packages/db, packages/queue, packages/mailer — minimal packages

Recent additions & how to use them

- **Database (Prisma + Postgres)**
	- Package: `packages/db` (Prisma v7, generator output under `packages/db/src/generated`).
	- Configure `DATABASE_URL` in `apps/api/.env` for local development (we load that .env when running Prisma from the workspace).
	- Generate client and run migrations inside `packages/db`:
		```bash
		# from repo root
		bun install

		# generate client
		cd packages/db
		bun x prisma generate

		# run dev migration (requires DATABASE_URL)
		bun x prisma migrate dev --name init
		```

- **Mailer (PDF generation + SMTP sender)**
	- Package: `packages/mailer` — uses `pdfkit` to generate a PDF from submission data and `nodemailer` to send via SMTP.
	- The API imports `@reliable/mailer` and uses `generateSubmissionPdf()` and `sendSubmissionEmail()`.
	- Environment variables (in `apps/api/.env` or system env):
		- `MAIL_HOST` (default `localhost`)
		- `MAIL_PORT` (default `1025`)

- **MailHog (local SMTP + UI)**
	- `docker-compose.yml` includes a `mailhog` service exposing SMTP on `1025` and UI on `8025`.
	- To start MailHog only (won't stop Postgres):
		```bash
		# start the mailhog service only
		docker compose up -d mailhog

		# or start an already-created service
		docker compose start mailhog

		# view MailHog logs
		docker compose logs -f mailhog
		```
	- MailHog UI: http://localhost:8025 — SMTP host for the API: `localhost:1025` (or `mailhog:1025` from inside compose network).

- **API behavior**
	- Endpoint: `POST /submit` (apps/api)
	- Payload: `{ name, email, message }` (JSON)
	- Flow (synchronous): create submission → generate PDF → send email with PDF attachment (SMTP) → update DB `status` to `COMPLETED` → return `{ status: 'ok', id: <submission-id> }`

Troubleshooting
- If TypeScript cannot resolve internal packages (e.g. `@reliable/db`), restart the TS server and run `bun install` to ensure workspace linking. You can also add `paths` to `tsconfig.base.json` mapping `@reliable/db` and `@reliable/mailer` to their `src` entries.

Examples
- Send a submission (example):
	
```bash
	curl -X POST http://localhost:3002/submit \
		-H "Content-Type: application/json" \
		-d '{"name":"Alice","email":"alice@example.com","message":"Hello"}'
	
    # response: { status: 'ok', id: 'cjadfa' }
```

