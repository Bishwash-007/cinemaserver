export function otpEmailTemplate(code) {
  return {
    subject: 'Your Email verification code',
    html: `<p>Your verification code is <strong>${code}</strong>. It expires in 10 minutes.</p>`,
  };
}
