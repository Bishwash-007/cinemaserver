import { eq, and } from 'drizzle-orm';
import { db } from '../config/db.js';
import {
  bookingsTable,
  bookingPaymentsTable,
  bookingHistoryTable,
} from '../models/booking.js';

export const findBookingByIdAndUser = async (id, userId) =>
  db
    .select()
    .from(bookingsTable)
    .where(and(eq(bookingsTable.id, id), eq(bookingsTable.userId, userId)))
    .then(([row]) => row ?? null);

export const findBookingById = async id =>
  db
    .select()
    .from(bookingsTable)
    .where(eq(bookingsTable.id, id))
    .then(([row]) => row ?? null);

export const updateBooking = async (id, data) =>
  db
    .update(bookingsTable)
    .set(data)
    .where(eq(bookingsTable.id, id))
    .returning()
    .then(([row]) => row);

export const insertPayment = async data =>
  db
    .insert(bookingPaymentsTable)
    .values(data)
    .returning()
    .then(([row]) => row);

export const findPendingPayment = async bookingId =>
  db
    .select()
    .from(bookingPaymentsTable)
    .where(
      and(
        eq(bookingPaymentsTable.bookingId, bookingId),
        eq(bookingPaymentsTable.paymentStatus, 'pending')
      )
    )
    .then(([row]) => row ?? null);

export const findPaymentByTransaction = async (bookingId, transactionId) =>
  db
    .select()
    .from(bookingPaymentsTable)
    .where(
      and(
        eq(bookingPaymentsTable.bookingId, bookingId),
        eq(bookingPaymentsTable.transactionId, transactionId)
      )
    )
    .then(([row]) => row ?? null);

export const updatePayment = async (id, data) =>
  db
    .update(bookingPaymentsTable)
    .set(data)
    .where(eq(bookingPaymentsTable.id, id))
    .returning()
    .then(([row]) => row);

export const findPaymentsByBooking = async bookingId =>
  db
    .select()
    .from(bookingPaymentsTable)
    .where(eq(bookingPaymentsTable.bookingId, bookingId));

export const findCompletedPayment = async bookingId =>
  db
    .select()
    .from(bookingPaymentsTable)
    .where(
      and(
        eq(bookingPaymentsTable.bookingId, bookingId),
        eq(bookingPaymentsTable.paymentStatus, 'completed')
      )
    )
    .then(([row]) => row ?? null);

export const insertBookingHistory = async data =>
  db.insert(bookingHistoryTable).values(data);
