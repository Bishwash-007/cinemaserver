import { sql, eq, and, gte, lte, isNull } from 'drizzle-orm';
import { db } from '../config/db.js';
import { usersTable } from '../models/user.js';
import { moviesTable } from '../models/movie.js';
import {
  theatersTable,
  screensTable,
  seatsTable,
  showtimesTable,
} from '../models/theater.js';
import {
  bookingsTable,
  bookingTicketsTable,
  bookingPaymentsTable,
  discountCodesTable,
  bookingDiscountsTable,
} from '../models/booking.js';

const dateRange = (from, to) => [
  gte(bookingsTable.createdAt, new Date(from)),
  lte(bookingsTable.createdAt, new Date(to)),
];

export const getOverview = async () => {
  const [revenue] = await db
    .select({
      totalRevenue: sql`COALESCE(SUM(${bookingsTable.totalAmount}),0)`,
      totalBookings: sql`COUNT(*)`,
      avgOrderValue: sql`COALESCE(AVG(${bookingsTable.totalAmount}),0)`,
    })
    .from(bookingsTable)
    .where(eq(bookingsTable.bookingStatus, 'confirmed'));

  const [thisMonth] = await db
    .select({
      revenue: sql`COALESCE(SUM(${bookingsTable.totalAmount}),0)`,
      bookings: sql`COUNT(*)`,
    })
    .from(bookingsTable)
    .where(
      and(
        eq(bookingsTable.bookingStatus, 'confirmed'),
        gte(bookingsTable.createdAt, sql`date_trunc('month', now())`)
      )
    );

  const [users] = await db
    .select({ total: sql`COUNT(*)` })
    .from(usersTable)
    .where(isNull(usersTable.deletedAt));

  const [pending] = await db
    .select({ count: sql`COUNT(*)` })
    .from(bookingsTable)
    .where(eq(bookingsTable.bookingStatus, 'pending'));

  const topMovies = await db
    .select({
      id: moviesTable.id,
      title: moviesTable.title,
      ticketsSold: sql`COUNT(${bookingTicketsTable.id})`,
    })
    .from(moviesTable)
    .innerJoin(showtimesTable, eq(showtimesTable.movieId, moviesTable.id))
    .innerJoin(bookingsTable, eq(bookingsTable.showtimeId, showtimesTable.id))
    .innerJoin(
      bookingTicketsTable,
      eq(bookingTicketsTable.bookingId, bookingsTable.id)
    )
    .where(eq(bookingsTable.bookingStatus, 'confirmed'))
    .groupBy(moviesTable.id, moviesTable.title)
    .orderBy(sql`COUNT(${bookingTicketsTable.id}) DESC`)
    .limit(5);

  return {
    revenue: { total: revenue.totalRevenue, thisMonth: thisMonth.revenue },
    bookings: {
      total: revenue.totalBookings,
      thisMonth: thisMonth.bookings,
      pending: pending.count,
    },
    avgOrderValue: revenue.avgOrderValue,
    totalUsers: users.total,
    topMovies,
  };
};

export const getRevenueSummary = async (from, to) => {
  const [row] = await db
    .select({
      totalRevenue: sql`COALESCE(SUM(${bookingsTable.totalAmount}),0)`,
      totalBookings: sql`COUNT(*)`,
      avgOrderValue: sql`COALESCE(AVG(${bookingsTable.totalAmount}),0)`,
      minOrderValue: sql`COALESCE(MIN(${bookingsTable.totalAmount}),0)`,
      maxOrderValue: sql`COALESCE(MAX(${bookingsTable.totalAmount}),0)`,
    })
    .from(bookingsTable)
    .where(
      and(eq(bookingsTable.bookingStatus, 'confirmed'), ...dateRange(from, to))
    );

  return row;
};

export const getRevenueTrend = async (from, to, granularity = 'day') => {
  const allowed = ['day', 'week', 'month', 'year'];
  const grain = allowed.includes(granularity) ? granularity : 'day';

  return db
    .select({
      period: sql`date_trunc(${grain}, ${bookingsTable.createdAt})`,
      revenue: sql`COALESCE(SUM(${bookingsTable.totalAmount}),0)`,
      bookings: sql`COUNT(*)`,
      ticketsSold: sql`COUNT(${bookingTicketsTable.id})`,
    })
    .from(bookingsTable)
    .innerJoin(
      bookingTicketsTable,
      eq(bookingTicketsTable.bookingId, bookingsTable.id)
    )
    .where(
      and(eq(bookingsTable.bookingStatus, 'confirmed'), ...dateRange(from, to))
    )
    .groupBy(sql`date_trunc(${grain}, ${bookingsTable.createdAt})`)
    .orderBy(sql`date_trunc(${grain}, ${bookingsTable.createdAt})`);
};

export const getRevenueByProvider = async (from, to) =>
  db
    .select({
      provider: bookingPaymentsTable.provider,
      transactions: sql`COUNT(*)`,
      totalAmount: sql`COALESCE(SUM(${bookingPaymentsTable.amount}),0)`,
    })
    .from(bookingPaymentsTable)
    .innerJoin(
      bookingsTable,
      eq(bookingsTable.id, bookingPaymentsTable.bookingId)
    )
    .where(
      and(
        eq(bookingPaymentsTable.paymentStatus, 'completed'),
        gte(bookingPaymentsTable.createdAt, new Date(from)),
        lte(bookingPaymentsTable.createdAt, new Date(to))
      )
    )
    .groupBy(bookingPaymentsTable.provider)
    .orderBy(sql`SUM(${bookingPaymentsTable.amount}) DESC`);

export const getBookingStatusBreakdown = async (from, to) =>
  db
    .select({
      status: bookingsTable.bookingStatus,
      count: sql`COUNT(*)`,
      totalAmount: sql`COALESCE(SUM(${bookingsTable.totalAmount}),0)`,
    })
    .from(bookingsTable)
    .where(and(...dateRange(from, to)))
    .groupBy(bookingsTable.bookingStatus)
    .orderBy(sql`COUNT(*) DESC`);

export const getBookingTrend = async (from, to, granularity = 'day') => {
  const allowed = ['day', 'week', 'month', 'year'];
  const grain = allowed.includes(granularity) ? granularity : 'day';

  return db
    .select({
      period: sql`date_trunc(${grain}, ${bookingsTable.createdAt})`,
      total: sql`COUNT(*)`,
      confirmed: sql`COUNT(*) FILTER (WHERE ${bookingsTable.bookingStatus} = 'confirmed')`,
      cancelled: sql`COUNT(*) FILTER (WHERE ${bookingsTable.bookingStatus} = 'cancelled')`,
      pending: sql`COUNT(*) FILTER (WHERE ${bookingsTable.bookingStatus} = 'pending')`,
    })
    .from(bookingsTable)
    .where(and(...dateRange(from, to)))
    .groupBy(sql`date_trunc(${grain}, ${bookingsTable.createdAt})`)
    .orderBy(sql`date_trunc(${grain}, ${bookingsTable.createdAt})`);
};

export const getMoviePerformance = async (from, to, limit = 20) =>
  db
    .select({
      movieId: moviesTable.id,
      title: moviesTable.title,
      slug: moviesTable.slug,
      posterUrl: moviesTable.posterUrl,
      totalBookings: sql`COUNT(DISTINCT ${bookingsTable.id})`,
      ticketsSold: sql`COUNT(${bookingTicketsTable.id})`,
      revenue: sql`COALESCE(SUM(${bookingsTable.totalAmount}),0)`,
    })
    .from(moviesTable)
    .innerJoin(showtimesTable, eq(showtimesTable.movieId, moviesTable.id))
    .innerJoin(bookingsTable, eq(bookingsTable.showtimeId, showtimesTable.id))
    .innerJoin(
      bookingTicketsTable,
      eq(bookingTicketsTable.bookingId, bookingsTable.id)
    )
    .where(
      and(eq(bookingsTable.bookingStatus, 'confirmed'), ...dateRange(from, to))
    )
    .groupBy(
      moviesTable.id,
      moviesTable.title,
      moviesTable.slug,
      moviesTable.posterUrl
    )
    .orderBy(sql`COUNT(${bookingTicketsTable.id}) DESC`)
    .limit(limit);

export const getShowtimeOccupancy = async (from, to, limit = 50) =>
  db
    .select({
      showtimeId: showtimesTable.id,
      startTime: showtimesTable.startTime,
      movieTitle: moviesTable.title,
      theaterName: theatersTable.name,
      theaterCity: theatersTable.city,
      screenName: screensTable.name,
      screenType: screensTable.screenType,
      totalSeats: screensTable.totalSeats,
      ticketsSold: sql`COUNT(${bookingTicketsTable.id})`,
      occupancyRate: sql`
        ROUND(
          (COUNT(${bookingTicketsTable.id})::numeric / NULLIF(${screensTable.totalSeats}, 0)) * 100,
          1
        )`,
      revenue: sql`COALESCE(SUM(${bookingsTable.totalAmount}),0)`,
    })
    .from(showtimesTable)
    .innerJoin(moviesTable, eq(moviesTable.id, showtimesTable.movieId))
    .innerJoin(screensTable, eq(screensTable.id, showtimesTable.screenId))
    .innerJoin(theatersTable, eq(theatersTable.id, screensTable.theaterId))
    .leftJoin(
      bookingsTable,
      and(
        eq(bookingsTable.showtimeId, showtimesTable.id),
        eq(bookingsTable.bookingStatus, 'confirmed')
      )
    )
    .leftJoin(
      bookingTicketsTable,
      eq(bookingTicketsTable.bookingId, bookingsTable.id)
    )
    .where(
      and(
        gte(showtimesTable.startTime, new Date(from)),
        lte(showtimesTable.startTime, new Date(to))
      )
    )
    .groupBy(
      showtimesTable.id,
      showtimesTable.startTime,
      moviesTable.title,
      theatersTable.name,
      theatersTable.city,
      screensTable.name,
      screensTable.screenType,
      screensTable.totalSeats
    )
    .orderBy(sql`COUNT(${bookingTicketsTable.id}) DESC`)
    .limit(limit);

export const getTheaterOccupancy = async (from, to) =>
  db
    .select({
      theaterId: theatersTable.id,
      theaterName: theatersTable.name,
      city: theatersTable.city,
      totalShowtimes: sql`COUNT(DISTINCT ${showtimesTable.id})`,
      totalBookings: sql`COUNT(DISTINCT ${bookingsTable.id})`,
      ticketsSold: sql`COUNT(${bookingTicketsTable.id})`,
      revenue: sql`COALESCE(SUM(${bookingsTable.totalAmount}),0)`,
    })
    .from(theatersTable)
    .innerJoin(screensTable, eq(screensTable.theaterId, theatersTable.id))
    .innerJoin(showtimesTable, eq(showtimesTable.screenId, screensTable.id))
    .leftJoin(
      bookingsTable,
      and(
        eq(bookingsTable.showtimeId, showtimesTable.id),
        eq(bookingsTable.bookingStatus, 'confirmed')
      )
    )
    .leftJoin(
      bookingTicketsTable,
      eq(bookingTicketsTable.bookingId, bookingsTable.id)
    )
    .where(
      and(
        gte(showtimesTable.startTime, new Date(from)),
        lte(showtimesTable.startTime, new Date(to))
      )
    )
    .groupBy(theatersTable.id, theatersTable.name, theatersTable.city)
    .orderBy(sql`SUM(${bookingsTable.totalAmount}) DESC NULLS LAST`);

export const getUserGrowth = async (from, to, granularity = 'day') => {
  const allowed = ['day', 'week', 'month', 'year'];
  const grain = allowed.includes(granularity) ? granularity : 'day';

  return db
    .select({
      period: sql`date_trunc(${grain}, ${usersTable.createdAt})`,
      newUsers: sql`COUNT(*)`,
      verifiedUsers: sql`COUNT(*) FILTER (WHERE ${usersTable.isVerified} = true)`,
    })
    .from(usersTable)
    .where(
      and(
        isNull(usersTable.deletedAt),
        gte(usersTable.createdAt, new Date(from)),
        lte(usersTable.createdAt, new Date(to))
      )
    )
    .groupBy(sql`date_trunc(${grain}, ${usersTable.createdAt})`)
    .orderBy(sql`date_trunc(${grain}, ${usersTable.createdAt})`);
};

export const getUserStats = async () => {
  const [row] = await db
    .select({
      total: sql`COUNT(*)`,
      verified: sql`COUNT(*) FILTER (WHERE ${usersTable.isVerified} = true)`,
      admins: sql`COUNT(*) FILTER (WHERE ${usersTable.role} = 'admin')`,
      deleted: sql`COUNT(*) FILTER (WHERE ${usersTable.deletedAt} IS NOT NULL)`,
    })
    .from(usersTable);

  return row;
};

export const getTopSpenders = async (limit = 10) =>
  db
    .select({
      userId: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      totalSpent: sql`COALESCE(SUM(${bookingsTable.totalAmount}),0)`,
      totalBookings: sql`COUNT(${bookingsTable.id})`,
    })
    .from(usersTable)
    .leftJoin(
      bookingsTable,
      and(
        eq(bookingsTable.userId, usersTable.id),
        eq(bookingsTable.bookingStatus, 'confirmed')
      )
    )
    .where(isNull(usersTable.deletedAt))
    .groupBy(usersTable.id, usersTable.name, usersTable.email)
    .orderBy(sql`SUM(${bookingsTable.totalAmount}) DESC NULLS LAST`)
    .limit(limit);

export const getDiscountUsageReport = async () =>
  db
    .select({
      id: discountCodesTable.id,
      code: discountCodesTable.code,
      type: discountCodesTable.type,
      value: discountCodesTable.value,
      isActive: discountCodesTable.isActive,
      maxUsageCount: discountCodesTable.maxUsageCount,
      usageCount: discountCodesTable.usageCount,
      totalDiscountGiven: sql`COALESCE(SUM(${bookingDiscountsTable.appliedAmount}),0)`,
      timesApplied: sql`COUNT(${bookingDiscountsTable.id})`,
      expiresAt: discountCodesTable.expiresAt,
    })
    .from(discountCodesTable)
    .leftJoin(
      bookingDiscountsTable,
      eq(bookingDiscountsTable.discountCodeId, discountCodesTable.id)
    )
    .groupBy(
      discountCodesTable.id,
      discountCodesTable.code,
      discountCodesTable.type,
      discountCodesTable.value,
      discountCodesTable.isActive,
      discountCodesTable.maxUsageCount,
      discountCodesTable.usageCount,
      discountCodesTable.expiresAt
    )
    .orderBy(sql`COUNT(${bookingDiscountsTable.id}) DESC`);

export const getReceiptData = async bookingId => {
  const [bookingRow] = await db
    .select({
      booking: {
        id: bookingsTable.id,
        bookingNumber: bookingsTable.bookingNumber,
        totalAmount: bookingsTable.totalAmount,
        bookingStatus: bookingsTable.bookingStatus,
        createdAt: bookingsTable.createdAt,
      },
      user: {
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
      },
      showtimeId: bookingsTable.showtimeId,
    })
    .from(bookingsTable)
    .innerJoin(usersTable, eq(usersTable.id, bookingsTable.userId))
    .where(eq(bookingsTable.id, bookingId));

  if (!bookingRow) return null;

  const [showtimeRow] = await db
    .select({
      showtime: {
        id: showtimesTable.id,
        startTime: showtimesTable.startTime,
        endTime: showtimesTable.endTime,
        basePrice: showtimesTable.basePrice,
      },
      screen: {
        id: screensTable.id,
        name: screensTable.name,
        screenType: screensTable.screenType,
      },
      theater: {
        id: theatersTable.id,
        name: theatersTable.name,
        city: theatersTable.city,
        address: theatersTable.address,
      },
      movie: {
        id: moviesTable.id,
        title: moviesTable.title,
        slug: moviesTable.slug,
        posterUrl: moviesTable.posterUrl,
        duration: moviesTable.duration,
        language: moviesTable.language,
      },
    })
    .from(showtimesTable)
    .innerJoin(screensTable, eq(screensTable.id, showtimesTable.screenId))
    .innerJoin(theatersTable, eq(theatersTable.id, screensTable.theaterId))
    .innerJoin(moviesTable, eq(moviesTable.id, showtimesTable.movieId))
    .where(eq(showtimesTable.id, bookingRow.showtimeId));

  const tickets = await db
    .select({
      id: bookingTicketsTable.id,
      ticketNumber: bookingTicketsTable.ticketNumber,
      price: bookingTicketsTable.price,
      isCheckedIn: bookingTicketsTable.isCheckedIn,
      seatId: bookingTicketsTable.seatId,
      seatNumber: seatsTable.seatNumber,
      rowName: seatsTable.rowName,
      seatType: seatsTable.seatType,
    })
    .from(bookingTicketsTable)
    .innerJoin(seatsTable, eq(seatsTable.id, bookingTicketsTable.seatId))
    .where(eq(bookingTicketsTable.bookingId, bookingId));

  const [payment] = await db
    .select()
    .from(bookingPaymentsTable)
    .where(eq(bookingPaymentsTable.bookingId, bookingId))
    .orderBy(sql`${bookingPaymentsTable.createdAt} DESC`);

  const [discountRow] = await db
    .select({
      appliedAmount: bookingDiscountsTable.appliedAmount,
      code: discountCodesTable.code,
      type: discountCodesTable.type,
      value: discountCodesTable.value,
    })
    .from(bookingDiscountsTable)
    .innerJoin(
      discountCodesTable,
      eq(discountCodesTable.id, bookingDiscountsTable.discountCodeId)
    )
    .where(eq(bookingDiscountsTable.bookingId, bookingId));

  return {
    booking: bookingRow.booking,
    user: bookingRow.user,
    showtime: showtimeRow?.showtime ?? null,
    screen: showtimeRow?.screen ?? null,
    theater: showtimeRow?.theater ?? null,
    movie: showtimeRow?.movie ?? null,
    tickets,
    payment: payment ?? null,
    discount: discountRow ?? null,
  };
};
