import * as reportRepo from '../repositories/reportRepository.js';
import { sendMail } from '../config/mailer.js';
import { bookingReceiptTemplate } from '../utils/emailTemplate.js';
import { AppError } from '../utils/error.js';

const defaultRange = () => {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return { from: from.toISOString(), to: to.toISOString() };
};

const resolveRange = (rawFrom, rawTo) => {
  const { from: defFrom, to: defTo } = defaultRange();
  return {
    from: rawFrom || defFrom,
    to: rawTo || defTo,
  };
};

export const getDashboardOverview = async () => reportRepo.getOverview();

export const getRevenueReport = async ({ from, to, granularity } = {}) => {
  const range = resolveRange(from, to);
  const [summary, trend, byProvider] = await Promise.all([
    reportRepo.getRevenueSummary(range.from, range.to),
    reportRepo.getRevenueTrend(range.from, range.to, granularity),
    reportRepo.getRevenueByProvider(range.from, range.to),
  ]);
  return { range, summary, trend, byProvider };
};

export const getBookingsReport = async ({ from, to, granularity } = {}) => {
  const range = resolveRange(from, to);
  const [statusBreakdown, trend] = await Promise.all([
    reportRepo.getBookingStatusBreakdown(range.from, range.to),
    reportRepo.getBookingTrend(range.from, range.to, granularity),
  ]);
  return { range, statusBreakdown, trend };
};

export const getMoviesReport = async ({ from, to, limit } = {}) => {
  const range = resolveRange(from, to);
  const movies = await reportRepo.getMoviePerformance(
    range.from,
    range.to,
    limit ?? 20
  );
  return { range, movies };
};

export const getOccupancyReport = async ({ from, to } = {}) => {
  const range = resolveRange(from, to);
  const [showtimes, theaters] = await Promise.all([
    reportRepo.getShowtimeOccupancy(range.from, range.to, 50),
    reportRepo.getTheaterOccupancy(range.from, range.to),
  ]);
  return { range, showtimes, theaters };
};

export const getUsersReport = async ({ from, to, granularity } = {}) => {
  const range = resolveRange(from, to);
  const [stats, growth, topSpenders] = await Promise.all([
    reportRepo.getUserStats(),
    reportRepo.getUserGrowth(range.from, range.to, granularity),
    reportRepo.getTopSpenders(10),
  ]);
  return { range, stats, growth, topSpenders };
};

export const getDiscountsReport = async () => {
  const codes = await reportRepo.getDiscountUsageReport();
  return { codes };
};

export const getReceipt = async (bookingId, requesterId, role) => {
  const data = await reportRepo.getReceiptData(bookingId);
  if (!data) throw new AppError('Booking not found', 404);
  if (role !== 'admin' && data.booking && data.user.id !== requesterId) {
    throw new AppError('Forbidden', 403);
  }
  return data;
};

export const sendReceiptEmail = async (bookingId, requesterId, role) => {
  const data = await reportRepo.getReceiptData(bookingId);
  if (!data) throw new AppError('Booking not found', 404);
  if (role !== 'admin' && data.user.id !== requesterId) {
    throw new AppError('Forbidden', 403);
  }
  if (!data.payment || data.payment.paymentStatus !== 'completed') {
    throw new AppError('Cannot send receipt for an unpaid booking', 400);
  }

  const template = bookingReceiptTemplate(data);
  await sendMail({ to: data.user.email, ...template });
  return { message: 'Receipt sent to ' + data.user.email };
};
