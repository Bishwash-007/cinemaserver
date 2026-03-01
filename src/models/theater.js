import * as p from 'drizzle-orm/pg-core';
import { moviesTable } from './movie.js';

export const theatersTable = p.pgTable('theaters', {
  id: p.integer().primaryKey().generatedAlwaysAsIdentity(),
  name: p.varchar({ length: 255 }).notNull(),
  location: p.varchar({ length: 255 }).notNull(),
  city: p.varchar({ length: 100 }).notNull(),
  address: p.text().notNull(),
  contactNumber: p.varchar({ length: 20 }),
  amenities: p.varchar({ length: 100 }).array(),
  isActive: p.boolean().default(true).notNull(),
  createdAt: p.timestamp().defaultNow().notNull(),
});

export const screensTable = p.pgTable('screens', {
  id: p.integer().primaryKey().generatedAlwaysAsIdentity(),
  theaterId: p
    .integer()
    .references(() => theatersTable.id, { onDelete: 'cascade' })
    .notNull(),
  name: p.varchar({ length: 50 }).notNull(),
  totalSeats: p.integer().notNull(),
  screenType: p.varchar({ length: 50 }).default('2D'),
  createdAt: p.timestamp().defaultNow().notNull(),
});

export const seatsTable = p.pgTable(
  'seats',
  {
    id: p.integer().primaryKey().generatedAlwaysAsIdentity(),
    screenId: p
      .integer()
      .references(() => screensTable.id, { onDelete: 'cascade' })
      .notNull(),
    seatNumber: p.varchar({ length: 10 }).notNull(),
    rowName: p.varchar({ length: 10 }).notNull(),
    columnNumber: p.integer().notNull(),
    seatType: p.varchar({ length: 50 }).default('standard'),
    priceMultiplier: p.decimal({ precision: 3, scale: 2 }).default('1.00'),
    isAvailable: p.boolean().default(true).notNull(),
  },
  table => [p.unique().on(table.screenId, table.seatNumber)]
);

export const showtimesTable = p.pgTable('showtimes', {
  id: p.integer().primaryKey().generatedAlwaysAsIdentity(),
  movieId: p
    .integer()
    .references(() => moviesTable.id, { onDelete: 'cascade' })
    .notNull(),
  screenId: p
    .integer()
    .references(() => screensTable.id, { onDelete: 'cascade' })
    .notNull(),
  startTime: p.timestamp().notNull(),
  endTime: p.timestamp().notNull(),
  basePrice: p.decimal({ precision: 10, scale: 2 }).notNull(),
  isActive: p.boolean().default(true).notNull(),
});
