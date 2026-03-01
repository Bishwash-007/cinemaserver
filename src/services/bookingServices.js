import crypto from 'crypto';
import * as bookingRepo from '../repositories/bookingRepository.js';
import * as theaterRepo from '../repositories/theaterRepository.js';
import { AppError } from '../utils/error.js';

const generateBookingNumber = () =>
  `BK-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

const generateTicketNumber = () =>
  `TK-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

const _fetchValidShowtime = async showtimeId => {
  const showtime = await theaterRepo.findShowtimeById(showtimeId);
  if (!showtime) throw new AppError('Showtime not found or inactive', 404);
  return showtime;
};

const _fetchValidSeats = async seatIds => {
  const seats = await bookingRepo.findSeatsByIds(seatIds);
  if (seats.length !== seatIds.length) {
    throw new AppError('One or more seats not found', 404);
  }
  return seats;
};

const _checkSeatConflicts = async (userId, showtimeId, seatIds) => {
  const locks = await bookingRepo.findSeatLocks(showtimeId, seatIds);
  const now = new Date();
  const conflicting = locks.filter(
    lock => lock.userId !== userId && lock.expiresAt > now
  );
  if (conflicting.length > 0) {
    throw new AppError(
      'One or more seats are temporarily held by another user',
      409
    );
  }
  return locks;
};

const _calculateTicketPrices = (seats, basePrice) =>
  seats.map(seat => ({
    seatId: seat.id,
    price: (basePrice * Number(seat.priceMultiplier || 1)).toFixed(2),
  }));

const _computeDiscountAmount = async (discountCode, rawTotal) => {
  const discount = await bookingRepo.findActiveDiscountByCode(discountCode);
  if (!discount) return 0;

  const now = new Date();
  if (discount.startsAt && discount.startsAt > now) return 0;
  if (discount.expiresAt && discount.expiresAt < now) return 0;
  if (discount.maxUsageCount && discount.usageCount >= discount.maxUsageCount)
    return 0;
  if (discount.minAmount && rawTotal < Number(discount.minAmount)) return 0;

  const raw =
    discount.type === 'percentage'
      ? rawTotal * (Number(discount.value) / 100)
      : Number(discount.value);

  return discount.maxDiscountAmount
    ? Math.min(raw, Number(discount.maxDiscountAmount))
    : raw;
};

const _recordDiscountUsage = async (
  bookingId,
  discountCode,
  discountAmount
) => {
  const discount = await bookingRepo.findDiscountByCode(discountCode);
  if (!discount) return;

  await bookingRepo.insertBookingDiscount({
    bookingId,
    discountCodeId: discount.id,
    appliedAmount: discountAmount.toFixed(2),
  });
  await bookingRepo.incrementDiscountUsage(discount.id, discount.usageCount);
};

export const createBooking = async (
  userId,
  { showtimeId, seatIds, discountCode }
) => {
  const showtime = await _fetchValidShowtime(showtimeId);
  const seats = await _fetchValidSeats(seatIds);
  const existingLocks = await _checkSeatConflicts(userId, showtimeId, seatIds);

  const basePrice = Number(showtime.basePrice);
  const ticketPrices = _calculateTicketPrices(seats, basePrice);
  const rawTotal = ticketPrices.reduce((sum, t) => sum + Number(t.price), 0);

  const discountAmount = discountCode
    ? await _computeDiscountAmount(discountCode, rawTotal)
    : 0;

  const totalAmount = Math.max(0, rawTotal - discountAmount).toFixed(2);

  const booking = await bookingRepo.insertBooking({
    userId,
    showtimeId,
    bookingNumber: generateBookingNumber(),
    totalAmount,
  });

  const ticketValues = ticketPrices.map(({ seatId, price }) => ({
    bookingId: booking.id,
    seatId,
    ticketNumber: generateTicketNumber(),
    price,
  }));
  const tickets = await bookingRepo.insertTickets(ticketValues);

  await bookingRepo.insertBookingHistory({
    bookingId: booking.id,
    newStatus: 'pending',
    reason: 'Booking created',
    actorId: userId,
  });

  if (discountCode && discountAmount > 0) {
    await _recordDiscountUsage(booking.id, discountCode, discountAmount);
  }

  const userHadLocks = existingLocks.some(l => l.userId === userId);
  if (userHadLocks) {
    await bookingRepo.deleteUserSeatLocks(userId, showtimeId, seatIds);
  }

  return { booking, tickets };
};

export const cancelBooking = async (userId, bookingId, { reason } = {}) => {
  const booking = await bookingRepo.findBookingById(bookingId);
  if (!booking) throw new AppError('Booking not found', 404);
  if (booking.userId !== userId) throw new AppError('Forbidden', 403);
  if (booking.bookingStatus === 'cancelled')
    throw new AppError('Booking already cancelled', 400);
  if (booking.bookingStatus === 'failed')
    throw new AppError('Cannot cancel a failed booking', 400);

  const prevStatus = booking.bookingStatus;
  const updated = await bookingRepo.updateBooking(bookingId, {
    bookingStatus: 'cancelled',
    updatedAt: new Date(),
  });

  await bookingRepo.insertBookingHistory({
    bookingId,
    previousStatus: prevStatus,
    newStatus: 'cancelled',
    reason: reason || 'Cancelled by user',
    actorId: userId,
  });

  return updated;
};

export const getBookingById = async (userId, bookingId, role) => {
  const booking = await bookingRepo.findBookingById(bookingId);
  if (!booking) throw new AppError('Booking not found', 404);
  if (role !== 'admin' && booking.userId !== userId)
    throw new AppError('Forbidden', 403);

  const tickets = await bookingRepo.findTicketsByBooking(bookingId);
  return { ...booking, tickets };
};

export const getUserBookings = async (userId, { page, limit, status }) => {
  const offset = (page - 1) * limit;
  const bookings = await bookingRepo.findUserBookings({
    userId,
    status,
    limit,
    offset,
  });
  return { bookings, page, limit };
};

export const getAllBookings = async ({ page, limit, status }) => {
  const offset = (page - 1) * limit;
  const bookings = await bookingRepo.findAllBookings({ status, limit, offset });
  return { bookings, page, limit };
};

export const validateDiscount = async (code, totalAmount) => {
  const discount = await bookingRepo.findActiveDiscountByCode(code);
  if (!discount) throw new AppError('Invalid discount code', 400);

  const now = new Date();
  if (discount.expiresAt && discount.expiresAt < now)
    throw new AppError('Discount code has expired', 400);
  if (discount.minAmount && totalAmount < Number(discount.minAmount)) {
    throw new AppError(
      `Minimum booking amount of ${discount.minAmount} required`,
      400
    );
  }

  const raw =
    discount.type === 'percentage'
      ? totalAmount * (Number(discount.value) / 100)
      : Number(discount.value);

  const discountAmount = discount.maxDiscountAmount
    ? Math.min(raw, Number(discount.maxDiscountAmount))
    : raw;

  return {
    code: discount.code,
    type: discount.type,
    value: discount.value,
    discountAmount: discountAmount.toFixed(2),
    finalAmount: Math.max(0, totalAmount - discountAmount).toFixed(2),
  };
};

export const createDiscountCode = async (adminId, data) => {
  const exists = await bookingRepo.discountCodeExists(data.code);
  if (exists) throw new AppError('Discount code already exists', 409);

  return bookingRepo.insertDiscountCode({
    ...data,
    value: String(data.value),
    minAmount: data.minAmount ? String(data.minAmount) : null,
    maxDiscountAmount: data.maxDiscountAmount
      ? String(data.maxDiscountAmount)
      : null,
    startsAt: data.startsAt ? new Date(data.startsAt) : null,
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    createdBy: adminId,
  });
};

// ─── Seat Locking ─────────────────────────────────────────────────────────────

export const lockSeats = async (userId, showtimeId, seatIds) => {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  // Replace any existing locks for this user on this showtime
  await bookingRepo.deleteAllUserSeatLocks(userId, showtimeId);

  const lockValues = seatIds.map(seatId => ({
    showtimeId,
    seatId,
    userId,
    expiresAt,
  }));
  const locks = await bookingRepo.insertSeatLocks(lockValues);
  return { locks, expiresAt };
};
