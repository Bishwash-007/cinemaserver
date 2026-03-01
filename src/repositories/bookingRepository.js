import { eq, and, inArray } from 'drizzle-orm';
import { db } from '../config/db.js';
import {
  bookingsTable,
  bookingTicketsTable,
  bookingHistoryTable,
  bookingDiscountsTable,
  discountCodesTable,
  seatLocksTable,
} from '../models/booking.js';
import { seatsTable } from '../models/theater.js';

// ─── Seats (needed during booking creation) ───────────────────────────────────

export const findSeatsByIds = async seatIds =>
  db.select().from(seatsTable).where(inArray(seatsTable.id, seatIds));

// ─── Seat Locks ───────────────────────────────────────────────────────────────

export const findSeatLocks = async (showtimeId, seatIds) =>
  db
    .select()
    .from(seatLocksTable)
    .where(
      and(
        eq(seatLocksTable.showtimeId, showtimeId),
        inArray(seatLocksTable.seatId, seatIds)
      )
    );

export const insertSeatLocks = async values =>
  db.insert(seatLocksTable).values(values).returning();

export const deleteUserSeatLocks = async (userId, showtimeId, seatIds) =>
  db
    .delete(seatLocksTable)
    .where(
      and(
        eq(seatLocksTable.userId, userId),
        eq(seatLocksTable.showtimeId, showtimeId),
        inArray(seatLocksTable.seatId, seatIds)
      )
    );

export const deleteAllUserSeatLocks = async (userId, showtimeId) =>
  db
    .delete(seatLocksTable)
    .where(
      and(
        eq(seatLocksTable.userId, userId),
        eq(seatLocksTable.showtimeId, showtimeId)
      )
    );

// ─── Bookings ─────────────────────────────────────────────────────────────────

export const insertBooking = async data =>
  db
    .insert(bookingsTable)
    .values(data)
    .returning()
    .then(([row]) => row);

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

export const findUserBookings = async ({ userId, status, limit, offset }) => {
  const conditions = [eq(bookingsTable.userId, userId)];
  if (status) conditions.push(eq(bookingsTable.bookingStatus, status));

  return db
    .select()
    .from(bookingsTable)
    .where(and(...conditions))
    .limit(limit)
    .offset(offset)
    .orderBy(bookingsTable.createdAt);
};

export const findAllBookings = async ({ status, limit, offset }) => {
  const conditions = status ? [eq(bookingsTable.bookingStatus, status)] : [];

  return db
    .select()
    .from(bookingsTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .limit(limit)
    .offset(offset)
    .orderBy(bookingsTable.createdAt);
};

// ─── Tickets ──────────────────────────────────────────────────────────────────

export const insertTickets = async values =>
  db.insert(bookingTicketsTable).values(values).returning();

export const findTicketsByBooking = async bookingId =>
  db
    .select()
    .from(bookingTicketsTable)
    .where(eq(bookingTicketsTable.bookingId, bookingId));

// ─── Booking History ──────────────────────────────────────────────────────────

export const insertBookingHistory = async data =>
  db.insert(bookingHistoryTable).values(data);

// ─── Discount Codes ───────────────────────────────────────────────────────────

// Only active, valid codes
export const findActiveDiscountByCode = async code =>
  db
    .select()
    .from(discountCodesTable)
    .where(
      and(
        eq(discountCodesTable.code, code),
        eq(discountCodesTable.isActive, true)
      )
    )
    .then(([row]) => row ?? null);

// Any code regardless of active status (used for FK recording)
export const findDiscountByCode = async code =>
  db
    .select()
    .from(discountCodesTable)
    .where(eq(discountCodesTable.code, code))
    .then(([row]) => row ?? null);

export const discountCodeExists = async code =>
  db
    .select({ id: discountCodesTable.id })
    .from(discountCodesTable)
    .where(eq(discountCodesTable.code, code))
    .then(([row]) => !!row);

export const insertDiscountCode = async data =>
  db
    .insert(discountCodesTable)
    .values(data)
    .returning()
    .then(([row]) => row);

export const incrementDiscountUsage = async (discountId, currentCount) =>
  db
    .update(discountCodesTable)
    .set({ usageCount: currentCount + 1, updatedAt: new Date() })
    .where(eq(discountCodesTable.id, discountId));

// ─── Booking Discounts ────────────────────────────────────────────────────────

export const insertBookingDiscount = async data =>
  db.insert(bookingDiscountsTable).values(data);
