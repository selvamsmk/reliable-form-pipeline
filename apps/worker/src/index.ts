import { processSubmission } from '@reliable/queue';
import { generateSubmissionPdf, sendSubmissionEmail, type Submission as MailerSubmission } from '@reliable/mailer';
import prisma from '@reliable/db';
import { ChaosController } from '@reliable/chaos';

// Worker entry: process submission jobs from the submissionQueue
console.log('worker: starting submission processor');

processSubmission(async (job) => {
  const data = job.data as MailerSubmission;
  console.log('worker: processing job', job.id, data);

  try {
    // allow configured PDF delay for chaos testing
    await ChaosController.delayPdf();

    const pdf = await generateSubmissionPdf(data as any);

    // send email
    await sendSubmissionEmail(data as any, pdf as Buffer);

    // before writing to DB, allow chaos to optionally fail DB ops
    try {
      ChaosController.maybeFailDb();
    } catch (chaosErr) {
      console.error('worker: chaos triggered DB failure before update', chaosErr);
      // throw so the job fails and can be retried
      throw chaosErr;
    }

    // update db status to COMPLETED
    try {
      await prisma.submission.update({ where: { id: data.id as string }, data: { status: 'COMPLETED' } });
    } catch (dbErr) {
      console.error('worker: failed updating DB status to COMPLETED', dbErr);
      // still treat job as failed so it can be retried or logged
      throw dbErr;
    }

    console.log('worker: job completed', job.id);
  } catch (err) {
    console.error('worker: job failed', job.id, err);
    // mark submission as FAILED in DB if we have an id
    if (data?.id) {
      try {
        // allow chaos to optionally fail DB ops when marking FAILED
        try {
          ChaosController.maybeFailDb();
        } catch (chaosErr) {
          console.error('worker: chaos triggered DB failure before marking FAILED', chaosErr);
          // rethrow so the job remains failed and can be retried
          throw chaosErr;
        }

        await prisma.submission.update({ where: { id: data.id as string }, data: { status: 'FAILED' } });
      } catch (updateErr) {
        console.error('worker: failed to mark submission as FAILED', updateErr);
      }
    }
    // rethrow to allow BullMQ to handle retries / failures
    throw err;
  }
}, 1);

console.log('worker: running (Bun + TypeScript)');
