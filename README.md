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
