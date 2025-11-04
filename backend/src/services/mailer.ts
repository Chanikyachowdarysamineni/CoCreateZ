import nodemailer from 'nodemailer';

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || '587');
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

if (!smtpHost || !smtpUser || !smtpPass) {
  console.warn('SMTP not fully configured. Mailer will not send emails.');
}

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465, // true for 465, false for other ports
  auth: smtpUser ? { user: smtpUser, pass: smtpPass } : undefined
});

export const sendMail = async (to: string, subject: string, text: string, html?: string) => {
  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn('Skipping email because SMTP not configured');
    return;
  }

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || `no-reply@${process.env.SMTP_HOST || 'localhost'}`,
    to,
    subject,
    text,
    html
  });

  return info;
};

export default { sendMail };