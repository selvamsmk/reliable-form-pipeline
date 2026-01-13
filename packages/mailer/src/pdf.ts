import PDFDocument from 'pdfkit';

export type Submission = {
  id?: string | number;
  name: string;
  email: string;
  message: string;
  createdAt?: string;
};

export async function generateSubmissionPdf(sub: Submission): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    try {
      const doc = new PDFDocument({ autoFirstPage: true });
      const chunks: Uint8Array[] = [];

      doc.on('data', (chunk: Uint8Array) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // Document metadata
      doc.info = doc.info || {};
      if (sub.name) doc.info.Author = sub.name;
      doc.info.Title = `Submission - ${sub.name || 'unknown'}`;

      // Header
      doc.fontSize(20).text('Submission', { align: 'center' });
      doc.moveDown();

      // Submission details
      doc.fontSize(12);
      doc.text(`Name: ${sub.name}`);
      doc.moveDown(0.25);
      doc.text(`Email: ${sub.email}`);
      doc.moveDown(0.25);
      if (sub.createdAt) doc.text(`Submitted: ${sub.createdAt}`);
      doc.moveDown();

      doc.text('Message:', { underline: true });
      doc.moveDown(0.25);
      doc.fontSize(11).text(sub.message || '', { align: 'left' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
