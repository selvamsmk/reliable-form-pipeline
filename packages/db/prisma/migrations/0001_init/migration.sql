-- Create enum type for SubmissionStatus
DO $$ BEGIN
    CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING','COMPLETED','FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "Submission" (
    "id" text PRIMARY KEY,
    "name" text NOT NULL,
    "email" text NOT NULL,
    "message" text NOT NULL,
    "createdAt" timestamptz NOT NULL DEFAULT now(),
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING'
);