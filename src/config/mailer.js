import nodemailer from 'nodemailer';
import { env } from './env.js';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export const sendMail = async ({ to, subject, html, text }) => {
  const info = await transporter.sendMail({
    from: `"${env.MAIL_FROM_NAME}" <${env.MAIL_FROM_ADDRESS}>`,
    to,
    subject,
    html,
    text,
  });
  return info;
};

export default transporter;
