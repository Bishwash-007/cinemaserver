import crypto from 'crypto';
import * as paymentRepo from '../repositories/paymentRepository.js';
import { getReceiptData } from '../repositories/reportRepository.js';
import { sendMail } from '../config/mailer.js';
import { bookingReceiptTemplate } from '../utils/emailTemplate.js';
import { AppError } from '../utils/error.js';

const generateTransactionId = provider =>
  `${provider.toUpperCase()}-${Date.now()}-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;

export const initiatePayment = async (userId, { bookingId, provider }) => {
  const booking = await paymentRepo.findBookingByIdAndUser(bookingId, userId);
  if (!booking) throw new AppError('Booking not found', 404);
  if (booking.bookingStatus === 'cancelled')
    throw new AppError('Booking is cancelled', 400);
  if (booking.bookingStatus === 'confirmed')
    throw new AppError('Booking already paid', 400);

  const existing = await paymentRepo.findPendingPayment(bookingId);
  if (existing) {
    return {
      transactionId: existing.transactionId,
      amount: existing.amount,
      provider: existing.provider,
      status: existing.paymentStatus,
    };
  }

  const transactionId = generateTransactionId(provider);
  const payment = await paymentRepo.insertPayment({
    bookingId,
    transactionId,
    amount: booking.totalAmount,
    provider,
    paymentStatus: 'pending',
    paymentMetadata: { initiatedAt: new Date().toISOString() },
  });

  // Replace the URL below with real provider SDK integration
  return {
    transactionId: payment.transactionId,
    amount: payment.amount,
    provider,
    status: 'pending',
    paymentUrl: `https://pay.${provider}.com/checkout/${payment.transactionId}`,
  };
};

export const verifyPayment = async (
  userId,
  { bookingId, transactionId, provider, providerPayload }
) => {
  const booking = await paymentRepo.findBookingByIdAndUser(bookingId, userId);
  if (!booking) throw new AppError('Booking not found', 404);

  const payment = await paymentRepo.findPaymentByTransaction(
    bookingId,
    transactionId
  );
  if (!payment) throw new AppError('Payment record not found', 404);
  if (payment.paymentStatus === 'completed')
    throw new AppError('Payment already verified', 400);

  // Replace with real provider signature verification
  const isVerified = true;

  if (!isVerified) {
    await paymentRepo.updatePayment(payment.id, { paymentStatus: 'failed' });
    await paymentRepo.updateBooking(bookingId, { bookingStatus: 'failed' });
    throw new AppError('Payment verification failed', 402);
  }

  const updatedPayment = await paymentRepo.updatePayment(payment.id, {
    paymentStatus: 'completed',
    paymentMetadata: {
      ...payment.paymentMetadata,
      verifiedAt: new Date().toISOString(),
      providerPayload,
    },
  });

  const updatedBooking = await paymentRepo.updateBooking(bookingId, {
    bookingStatus: 'confirmed',
  });

  await paymentRepo.insertBookingHistory({
    bookingId,
    previousStatus: 'pending',
    newStatus: 'confirmed',
    reason: `Payment verified via ${provider}`,
    actorId: userId,
  });

  // Send receipt email asynchronously — do not block the response
  getReceiptData(bookingId)
    .then(receiptData => {
      if (receiptData) {
        const template = bookingReceiptTemplate(receiptData);
        return sendMail({ to: receiptData.user.email, ...template });
      }
    })
    .catch(err => console.error('[Receipt email error]', err.message));

  return { booking: updatedBooking, payment: updatedPayment };
};

export const getPaymentByBookingId = async (userId, bookingId, role) => {
  const booking = await paymentRepo.findBookingById(bookingId);
  if (!booking) throw new AppError('Booking not found', 404);
  if (role !== 'admin' && booking.userId !== userId)
    throw new AppError('Forbidden', 403);

  const payments = await paymentRepo.findPaymentsByBooking(bookingId);
  return { bookingId, payments };
};

export const refundPayment = async (userId, { bookingId, reason }) => {
  const booking = await paymentRepo.findBookingById(bookingId);
  if (!booking) throw new AppError('Booking not found', 404);
  if (booking.userId !== userId) throw new AppError('Forbidden', 403);
  if (booking.bookingStatus !== 'confirmed')
    throw new AppError('Only confirmed bookings can be refunded', 400);

  const payment = await paymentRepo.findCompletedPayment(bookingId);
  if (!payment)
    throw new AppError('No completed payment found for this booking', 404);

  // Replace with real provider refund SDK call
  const updatedPayment = await paymentRepo.updatePayment(payment.id, {
    paymentStatus: 'refunded',
    paymentMetadata: {
      ...payment.paymentMetadata,
      refundedAt: new Date().toISOString(),
      reason,
    },
  });

  await paymentRepo.updateBooking(bookingId, { bookingStatus: 'cancelled' });

  await paymentRepo.insertBookingHistory({
    bookingId,
    previousStatus: 'confirmed',
    newStatus: 'cancelled',
    reason: reason || 'Refund requested',
    actorId: userId,
  });

  return { payment: updatedPayment, message: 'Refund processed successfully' };
};
