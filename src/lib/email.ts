import { Resend } from "resend";

// Resend over Nodemailer: Nodemailer needs an SMTP relay (Gmail app
// passwords, a mail server, etc.) which is one more moving part to
// configure and debug in a 4-day build. Resend is an HTTP API — just an
// API key — and its free tier comfortably covers a demo/MVP's volume.

let resendClient: Resend | null = null;

function getClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error("RESEND_API_KEY is not set");
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export async function sendOtpEmail(to: string, code: string) {
  const from = process.env.EMAIL_FROM ?? "Student Housing <noreply@example.com>";
  return getClient().emails.send({
    from,
    to,
    subject: "Your verification code",
    html: `<p>Your verification code is:</p><h2 style="letter-spacing:4px">${code}</h2><p>This code expires in ${
      process.env.OTP_TTL_MINUTES ?? 10
    } minutes.</p>`,
  });
}

export async function sendConfirmationLetterEmail(params: {
  to: string[];
  studentName: string;
  propertyAddress: string;
  pdfBuffer: Buffer;
  letterReference: string;
}) {
  const from = process.env.EMAIL_FROM ?? "Student Housing <noreply@example.com>";
  return getClient().emails.send({
    from,
    to: params.to,
    subject: `Tenancy Confirmation Letter — ${params.studentName}`,
    html: `<p>Please find attached the tenancy confirmation letter for <strong>${params.studentName}</strong> at ${params.propertyAddress}.</p><p>Reference: ${params.letterReference}</p>`,
    attachments: [
      {
        filename: `confirmation-letter-${params.letterReference}.pdf`,
        content: params.pdfBuffer.toString("base64"),
      },
    ],
  });
}

export async function sendMaintenanceReportEmail(params: {
  to: string;
  landlordName: string;
  studentName: string;
  propertyTitle: string;
  subject: string;
  description: string;
  severity: string;
  reportId: string;
}) {
  const from = process.env.EMAIL_FROM ?? "Student Housing <noreply@example.com>";
  return getClient().emails.send({
    from,
    to: params.to,
    subject: `Maintenance report: ${params.propertyTitle}`,
    html: `<p>Hi ${params.landlordName},</p><p>${params.studentName} reported an issue at <strong>${params.propertyTitle}</strong>.</p><p><strong>Severity:</strong> ${params.severity}<br /><strong>Subject:</strong> ${params.subject}</p><p>${params.description}</p><p>Report reference: ${params.reportId}</p>`,
  });
}

export async function sendSrcEscalationEmail(params: {
  to: string[];
  studentName: string;
  propertyTitle: string;
  subject: string;
  description: string;
  reportId: string;
}) {
  const from = process.env.EMAIL_FROM ?? "Student Housing <noreply@example.com>";
  return getClient().emails.send({
    from,
    to: params.to,
    subject: `SRC escalation: ${params.propertyTitle}`,
    html: `<p>A student has escalated a residence complaint to the SRC.</p><p><strong>Student:</strong> ${params.studentName}<br /><strong>Residence:</strong> ${params.propertyTitle}<br /><strong>Subject:</strong> ${params.subject}</p><p>${params.description}</p><p>Report reference: ${params.reportId}</p>`,
  });
}
