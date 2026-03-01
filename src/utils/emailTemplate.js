import { env } from '../config/env.js';

export const verificationEmailTemplate = token => ({
  subject: `Verify your ${env.APP_NAME} account`,
  html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px">
      <h2 style="color:#1d4ed8;margin-bottom:8px">${env.APP_NAME}</h2>
      <h3 style="margin-top:0">Verify your email address</h3>
      <p>Click the button below to verify your account. This link expires in <strong>24 hours</strong>.</p>
      <a href="${env.CLIENT_URL}/verify-email?token=${token}"
         style="display:inline-block;background:#1d4ed8;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;margin:16px 0">
        Verify Email
      </a>
      <p style="color:#6b7280;font-size:13px;margin-top:24px">
        If you didn't create an account, you can safely ignore this email.
      </p>
    </div>
  `,
});

export const passwordResetEmailTemplate = (token, userName) => ({
  subject: `Reset your ${env.APP_NAME} password`,
  html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px">
      <h2 style="color:#1d4ed8;margin-bottom:8px">${env.APP_NAME}</h2>
      <h3 style="margin-top:0">Password reset request</h3>
      <p>Hi ${userName || 'there'},</p>
      <p>Click the button below to reset your password. This link expires in <strong>1 hour</strong>.</p>
      <a href="${env.CLIENT_URL}/reset-password?token=${token}"
         style="display:inline-block;background:#dc2626;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;margin:16px 0">
        Reset Password
      </a>
      <p style="color:#6b7280;font-size:13px;margin-top:24px">
        If you didn't request a password reset, please secure your account immediately.
      </p>
    </div>
  `,
});

export const bookingReceiptTemplate = ({
  booking,
  payment,
  showtime,
  movie,
  theater,
  screen,
  tickets,
  user,
  discount,
}) => {
  const fmtDate = d =>
    new Date(d).toLocaleString('en-US', {
      dateStyle: 'long',
      timeStyle: 'short',
    });

  const fmtCurrency = v => `NPR ${Number(v).toFixed(2)}`;

  const ticketRows = tickets
    .map(
      t => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb">${t.ticketNumber}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb">${t.seatNumber ?? t.seatId}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right">${fmtCurrency(t.price)}</td>
      </tr>`
    )
    .join('');

  const discountRow = discount
    ? `<tr>
        <td colspan="2" style="padding:8px;text-align:right;color:#16a34a">Discount (${discount.code})</td>
        <td style="padding:8px;text-align:right;color:#16a34a">-${fmtCurrency(discount.appliedAmount)}</td>
       </tr>`
    : '';

  return {
    subject: `Your booking confirmation — ${booking.bookingNumber}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px">
        <div style="background:#1d4ed8;color:#fff;padding:20px 24px;border-radius:6px;margin-bottom:24px">
          <h2 style="margin:0 0 4px">${env.APP_NAME}</h2>
          <p style="margin:0;opacity:.85">Booking Confirmation &amp; Receipt</p>
        </div>

        <p>Hi <strong>${user.name}</strong>, your booking is confirmed! 🎬</p>

        <div style="background:#f9fafb;padding:16px;border-radius:6px;margin-bottom:20px">
          <h3 style="margin:0 0 12px;color:#111827">${movie.title}</h3>
          <table style="width:100%;font-size:14px;border-collapse:collapse">
            <tr>
              <td style="padding:4px 0;color:#6b7280;width:140px">Date &amp; Time</td>
              <td style="padding:4px 0;font-weight:600">${fmtDate(showtime.startTime)}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;color:#6b7280">Theater</td>
              <td style="padding:4px 0">${theater.name}, ${theater.city}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;color:#6b7280">Screen</td>
              <td style="padding:4px 0">${screen.name} (${screen.screenType})</td>
            </tr>
            <tr>
              <td style="padding:4px 0;color:#6b7280">Booking #</td>
              <td style="padding:4px 0;font-family:monospace;font-weight:bold">${booking.bookingNumber}</td>
            </tr>
          </table>
        </div>

        <h4 style="color:#374151;margin-bottom:8px">Tickets</h4>
        <table style="width:100%;font-size:14px;border-collapse:collapse">
          <thead>
            <tr style="background:#f3f4f6">
              <th style="padding:8px;text-align:left">Ticket #</th>
              <th style="padding:8px;text-align:left">Seat</th>
              <th style="padding:8px;text-align:right">Price</th>
            </tr>
          </thead>
          <tbody>${ticketRows}</tbody>
          <tfoot>
            ${discountRow}
            <tr style="font-weight:bold;background:#f9fafb">
              <td colspan="2" style="padding:10px;text-align:right">Total Paid</td>
              <td style="padding:10px;text-align:right;color:#1d4ed8">${fmtCurrency(booking.totalAmount)}</td>
            </tr>
          </tfoot>
        </table>

        <div style="margin-top:20px;padding:12px;border:1px solid #d1fae5;background:#f0fdf4;border-radius:6px;font-size:13px">
          <strong style="color:#15803d">✓ Payment Confirmed</strong>
          <span style="color:#374151;margin-left:12px">
            via ${payment.provider} &nbsp;|&nbsp; Txn: ${payment.transactionId}
          </span>
        </div>

        <p style="color:#6b7280;font-size:12px;margin-top:28px;border-top:1px solid #e5e7eb;padding-top:16px">
          This is an automated receipt from ${env.APP_NAME}.
          Please carry this email or your booking number to the theater.
        </p>
      </div>
    `,
  };
};

export const otpEmailTemplate = code => ({
  subject: 'Your Email verification code',
  html: `<p>Your verification code is <strong>${code}</strong>. It expires in 10 minutes.</p>`,
});
