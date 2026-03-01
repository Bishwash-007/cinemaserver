import * as p from 'drizzle-orm/pg-core';
import { usersTable } from './user.js';
import { seatsTable, showtimesTable } from './theater.js';

export const bookingStatusEnum = p.pgEnum('cinema_booking_status', [
  'pending',
  'confirmed',
  'cancelled',
  'failed',
]);

export const paymentStatusEnum = p.pgEnum('cinema_payment_status', [
  'pending',
  'completed',
  'refunded',
  'failed',
]);

export const discountTypeEnum = p.pgEnum('cinema_discount_type', [
  'percentage',
  'flat',
]);

export const discountScopeEnum = p.pgEnum('cinema_discount_scope', [
  'booking',
  'ticket',
]);

export const bookingsTable = p.pgTable('bookings', {
  id: p.integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: p
    .integer()
    .references(() => usersTable.id, { onDelete: 'cascade' })
    .notNull(),
  showtimeId: p
    .integer()
    .references(() => showtimesTable.id, { onDelete: 'cascade' })
    .notNull(),
  bookingNumber: p.varchar({ length: 100 }).unique().notNull(),
  totalAmount: p.decimal({ precision: 10, scale: 2 }).notNull(),
  bookingStatus: bookingStatusEnum('booking_status')
    .default('pending')
    .notNull(),
  createdAt: p.timestamp().defaultNow().notNull(),
  updatedAt: p.timestamp().defaultNow().notNull(),
});

export const discountCodesTable = p.pgTable('discount_codes', {
  id: p.integer().primaryKey().generatedAlwaysAsIdentity(),
  code: p.varchar({ length: 50 }).notNull().unique(),
  description: p.text(),
  type: discountTypeEnum('type').notNull(),
  scope: discountScopeEnum('scope').default('booking').notNull(),
  value: p.decimal({ precision: 6, scale: 2 }).notNull(),
  minAmount: p.decimal({ precision: 10, scale: 2 }),
  maxDiscountAmount: p.decimal({ precision: 10, scale: 2 }),
  maxUsageCount: p.integer(),
  maxUsagePerUser: p.integer().default(1).notNull(),
  usageCount: p.integer().default(0).notNull(),
  startsAt: p.timestamp(),
  expiresAt: p.timestamp(),
  isStackable: p.boolean().default(false).notNull(),
  isActive: p.boolean().default(true).notNull(),
  createdBy: p
    .integer()
    .references(() => usersTable.id, { onDelete: 'set null' }),
  createdAt: p.timestamp().defaultNow().notNull(),
  updatedAt: p.timestamp().defaultNow().notNull(),
});

export const bookingDiscountsTable = p.pgTable('booking_discounts', {
  id: p.integer().primaryKey().generatedAlwaysAsIdentity(),
  bookingId: p
    .integer()
    .references(() => bookingsTable.id, { onDelete: 'cascade' })
    .notNull(),
  discountCodeId: p
    .integer()
    .references(() => discountCodesTable.id, { onDelete: 'set null' }),
  appliedAmount: p.decimal({ precision: 10, scale: 2 }).notNull(),
  metadata: p.jsonb(),
  createdAt: p.timestamp().defaultNow().notNull(),
});

export const bookingHistoryTable = p.pgTable('booking_history', {
  id: p.integer().primaryKey().generatedAlwaysAsIdentity(),
  bookingId: p
    .integer()
    .references(() => bookingsTable.id, { onDelete: 'cascade' })
    .notNull(),
  previousStatus: bookingStatusEnum('previous_status'),
  newStatus: bookingStatusEnum('new_status').notNull(),
  reason: p.text(),
  actorId: p
    .integer()
    .references(() => usersTable.id, { onDelete: 'set null' }),
  metadata: p.jsonb(),
  createdAt: p.timestamp().defaultNow().notNull(),
});

export const bookingTicketsTable = p.pgTable(
  'tickets',
  {
    id: p.integer().primaryKey().generatedAlwaysAsIdentity(),
    bookingId: p
      .integer()
      .references(() => bookingsTable.id, { onDelete: 'cascade' })
      .notNull(),
    seatId: p
      .integer()
      .references(() => seatsTable.id, { onDelete: 'cascade' })
      .notNull(),
    ticketNumber: p.varchar({ length: 100 }).unique().notNull(),
    price: p.decimal({ precision: 10, scale: 2 }).notNull(),
    isCheckedIn: p.boolean().default(false).notNull(),
  },
  table => [p.unique().on(table.bookingId, table.seatId)]
);

export const bookingPaymentsTable = p.pgTable('payments', {
  id: p.integer().primaryKey().generatedAlwaysAsIdentity(),
  bookingId: p
    .integer()
    .references(() => bookingsTable.id, { onDelete: 'cascade' })
    .notNull(),
  transactionId: p.varchar({ length: 255 }).unique().notNull(),
  amount: p.decimal({ precision: 10, scale: 2 }).notNull(),
  provider: p.varchar({ length: 50 }).notNull(),
  paymentStatus: paymentStatusEnum('payment_status')
    .default('pending')
    .notNull(),
  paymentMetadata: p.jsonb(),
  createdAt: p.timestamp().defaultNow().notNull(),
  updatedAt: p.timestamp().defaultNow().notNull(),
});

export const seatLocksTable = p.pgTable(
  'seat_locks',
  {
    id: p.integer().primaryKey().generatedAlwaysAsIdentity(),
    showtimeId: p
      .integer()
      .references(() => showtimesTable.id, { onDelete: 'cascade' })
      .notNull(),
    seatId: p
      .integer()
      .references(() => seatsTable.id, { onDelete: 'cascade' })
      .notNull(),
    userId: p
      .integer()
      .references(() => usersTable.id, { onDelete: 'cascade' })
      .notNull(),
    expiresAt: p.timestamp().notNull(),
  },
  table => [p.unique().on(table.showtimeId, table.seatId)]
);
