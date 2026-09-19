// CampusNest Modular Email Service with Brevo API & Offline Fallback

const SENDER_NAME = "CampusNest";
const configuredFrom = process.env.EMAIL_FROM || process.env.BREVO_SENDER_EMAIL || "campusnest402@gmail.com";
const SENDER_EMAIL = configuredFrom.match(/<([^>]+)>/)?.[1] || configuredFrom;

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  fromName?: string;
  fromEmail?: string;
  attachments?: Array<{ filename: string; content: string }>;
}

export async function sendRawEmail({
  to,
  subject,
  html,
  fromName = SENDER_NAME,
  fromEmail = SENDER_EMAIL,
  attachments,
}: SendEmailOptions) {
  const recipients = Array.isArray(to) ? to : [to];

  // 1. Brevo REST API
  if (process.env.BREVO_API_KEY) {
    try {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          sender: { name: fromName, email: fromEmail },
          to: recipients.map((r) => ({ email: r })),
          subject,
          htmlContent: html,
          attachment: attachments?.map((a) => ({ name: a.filename, content: a.content })),
        }),
      });

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        console.log(`✉️ [Brevo Email Delivered] Successfully dispatched to ${recipients.join(", ")} (MessageID: ${data.messageId || "N/A"})`);
        return { success: true, messageId: data.messageId, provider: "brevo" };
      }
      const errText = await res.text().catch(() => "Unknown Brevo error");
      console.warn("⚠️ [Brevo API Warning]:", errText);
      if (errText.includes("unrecognised IP address") || errText.includes("authorised_ips")) {
        console.warn("👉 Action required in Brevo: Visit https://app.brevo.com/security/authorised_ips to authorize your current IP address.");
      }
    } catch (err) {
      console.warn("Brevo API network error:", err);
    }
  }

  // 2. Resend Fallback
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      const resendRes = await resend.emails.send({
        from: process.env.EMAIL_FROM || `${fromName} <${fromEmail}>`,
        to: recipients,
        subject,
        html,
        attachments,
      });
      if (resendRes.error) {
        throw new Error(resendRes.error.message || "Resend rejected the email");
      }
      return { success: true, data: resendRes, provider: "resend" };
    } catch (err) {
      console.warn("Resend email error:", err);
    }
  }

  throw new Error("No working email provider is configured. Set RESEND_API_KEY or BREVO_API_KEY and EMAIL_FROM.");
}

export async function sendOtpEmail(params: {
  to: string;
  code: string;
  name?: string;
  role?: string;
}) {
  console.log(`\n======================================================`);
  console.log(`🔐 [CAMPUSNEST OTP VERIFICATION CODE]`);
  console.log(`👤 Recipient : ${params.to}`);
  console.log(`🔑 6-Digit OTP: ${params.code}`);
  console.log(`⏳ Valid For  : 15 minutes`);
  console.log(`======================================================\n`);

  const roleDisplay =
    params.role === "LANDLORD"
      ? "Residence Provider / Landlord Hub"
      : params.role === "SRC_REPRESENTATIVE"
      ? "SRC Council Housing Desk"
      : "Student Housing Portal";

  const greeting = params.name ? `Hi ${params.name},` : "Hello,";

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <div style="max-width: 560px; margin: 32px auto; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
          <div style="background: linear-gradient(135deg, #099250 0%, #065f46 100%); padding: 32px 28px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">CampusNest</h1>
            <p style="margin: 6px 0 0 0; font-size: 12px; color: #d1fae5; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
              ${roleDisplay}
            </p>
          </div>

          <div style="padding: 32px 28px; color: #1e293b;">
            <p style="font-size: 15px; font-weight: 600; color: #0f172a; margin-top: 0;">${greeting}</p>
            <p style="font-size: 13px; line-height: 1.6; color: #475569;">
              Thank you for registering on <strong>CampusNest</strong>. To verify your email address and proceed, enter the 6-digit verification code below:
            </p>

            <div style="margin: 28px 0; text-align: center;">
              <div style="display: inline-block; background-color: #f0fdf4; border: 2px dashed #059669; border-radius: 16px; padding: 16px 36px;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 900; letter-spacing: 10px; color: #065f46;">
                  ${params.code}
                </span>
              </div>
              <p style="margin: 10px 0 0 0; font-size: 11px; color: #64748b;">
                This code expires in <strong>10 minutes</strong>. Do not share this code with anyone.
              </p>
            </div>

            <p style="font-size: 12px; line-height: 1.5; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 18px; margin-bottom: 0;">
              If you didn't create an account with CampusNest, you can safely disregard this message.
            </p>
          </div>

          <div style="background-color: #f8fafc; padding: 18px 28px; text-align: center; border-top: 1px solid #f1f5f9;">
            <p style="margin: 0; font-size: 11px; color: #94a3b8;">
              CampusNest • Accredited Student Housing & Safety Platform • South Africa
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendRawEmail({
    to: params.to,
    subject: `Your 6-digit verification code is ${params.code} — CampusNest`,
    html,
  });
}

export async function sendPasswordResetEmail(params: {
  to: string;
  resetUrl: string;
  name?: string;
}) {
  const greeting = params.name ? `Hi ${params.name},` : "Hello,";

  const html = `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px;">
      <h2 style="color: #099250; margin-top: 0;">CampusNest Password Reset</h2>
      <p>${greeting}</p>
      <p>We received a request to reset your CampusNest password. Click the button below to choose a new password:</p>
      <div style="margin: 24px 0;">
        <a href="${params.resetUrl}" style="background-color: #099250; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 10px; display: inline-block;">
          Reset Password →
        </a>
      </div>
      <p style="font-size: 12px; color: #64748b;">If you did not request this, you can ignore this email.</p>
    </div>
  `;

  return sendRawEmail({
    to: params.to,
    subject: "Reset your CampusNest password",
    html,
  });
}

export async function sendConfirmationLetterEmail(params: {
  to: string[];
  studentName: string;
  propertyAddress: string;
  pdfBuffer: Buffer;
  letterReference: string;
}) {
  return sendRawEmail({
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
  return sendRawEmail({
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
  return sendRawEmail({
    to: params.to,
    subject: `SRC escalation: ${params.propertyTitle}`,
    html: `<p>A student has escalated a residence complaint to the SRC.</p><p><strong>Student:</strong> ${params.studentName}<br /><strong>Residence:</strong> ${params.propertyTitle}<br /><strong>Subject:</strong> ${params.subject}</p><p>${params.description}</p><p>Report reference: ${params.reportId}</p>`,
  });
}



