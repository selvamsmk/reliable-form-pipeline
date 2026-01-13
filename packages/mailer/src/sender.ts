import nodemailer from 'nodemailer';
import type { Submission } from './pdf';

const SMTP_HOST = process.env.MAIL_HOST ?? 'localhost';
const SMTP_PORT = Number(process.env.MAIL_PORT ?? 1025);

export async function sendSubmissionEmail(sub: Submission, pdfBuffer: Buffer): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false,
    tls: { rejectUnauthorized: false },
  });

  const mailOptions = {
    from: 'no-reply@reliable.local',
    to: sub.email,
    subject: `Submission received: ${sub.name}`,
    text: `Thanks ${sub.name}, we received your submission.`,
    attachments: [
      {
        filename: `submission-${sub.id}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  };

  await transporter.sendMail(mailOptions);
}
