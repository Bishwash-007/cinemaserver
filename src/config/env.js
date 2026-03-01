import dotenv from 'dotenv';

dotenv.config();
export const env = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',

  // SMTP / Mailer
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: Number(process.env.SMTP_PORT) || 587,
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  MAIL_FROM_NAME: process.env.MAIL_FROM_NAME || 'Cinemaghar',
  MAIL_FROM_ADDRESS: process.env.MAIL_FROM_ADDRESS || 'noreply@cinemaghar.com',

  // Cloudinary
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '',
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || '',

  // Neon local proxy (optional — for local dev without real Neon)
  NEON_LOCAL_PROXY: process.env.NEON_LOCAL_PROXY === 'true',
  NEON_LOCAL_HTTP_ENDPOINT:
    process.env.NEON_LOCAL_HTTP_ENDPOINT || 'http://neon-local:5423/sql',

  // App
  APP_NAME: process.env.APP_NAME || 'Cinemaghar',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};
