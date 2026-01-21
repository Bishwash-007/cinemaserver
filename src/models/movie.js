import * as p from 'drizzle-orm/pg-core';
import { usersTable } from './user.js';

export const movieStatusEnum = p.pgEnum('cinema_movie_status', [
  'upcoming',
  'released',
  'archived',
]);

export const moviesTable = p.pgTable('movies', {
  id: p.integer().primaryKey().generatedAlwaysAsIdentity(),
  title: p.varchar({ length: 255 }).notNull(),
  slug: p.varchar({ length: 255 }).unique().notNull(),
  description: p.text().notNull(),
  releaseDate: p.date().notNull(),
  durationInMinutes: p.integer().notNull(),
  language: p.varchar({ length: 50 }).notNull(),
  genre: p.varchar({ length: 100 }).array().notNull(),

  posterUrls: p.varchar({ length: 500 }).array().notNull(),
  backdropUrl: p.varchar({ length: 500 }),
  trailerUrl: p.varchar({ length: 500 }),

  rating: p.decimal({ precision: 3, scale: 1 }).default('0.0'),
  imdbId: p.varchar({ length: 20 }),
  imdbRating: p.decimal({ precision: 3, scale: 1 }),
  letterboxdUrl: p.varchar({ length: 500 }),
  tmdbId: p.integer(),

  status: movieStatusEnum('status').default('upcoming').notNull(),
  isAdult: p.boolean().default(false).notNull(),
  director: p.varchar({ length: 255 }).notNull(),

  createdAt: p.timestamp().defaultNow().notNull(),
  updatedAt: p.timestamp().defaultNow().notNull(),
  deletedAt: p.timestamp(),
});

export const reviewsTable = p.pgTable('reviews', {
  id: p.integer().primaryKey().generatedAlwaysAsIdentity(),
  movieId: p
    .integer()
    .references(() => moviesTable.id, { onDelete: 'cascade' })
    .notNull(),
  userId: p
    .integer()
    .references(() => usersTable.id, { onDelete: 'cascade' })
    .notNull(),
  rating: p.integer().notNull(),
  comment: p.text(),
  createdAt: p.timestamp().defaultNow().notNull(),
});

export const castsTable = p.pgTable('casts', {
  id: p.integer().primaryKey().generatedAlwaysAsIdentity(),
  name: p.varchar({ length: 255 }).notNull(),
  profileImageUrl: p.varchar({ length: 500 }),
  bio: p.text(),
  birthDate: p.date(),
  nationality: p.varchar({ length: 100 }),
  socialMedia: p.jsonb(),
});

export const movieCastsTable = p.pgTable('movie_casts', {
  id: p.integer().primaryKey().generatedAlwaysAsIdentity(),
  movieId: p
    .integer()
    .references(() => moviesTable.id, { onDelete: 'cascade' })
    .notNull(),
  castId: p
    .integer()
    .references(() => castsTable.id, { onDelete: 'cascade' })
    .notNull(),
  characterName: p.varchar({ length: 255 }).notNull(),
  billingOrder: p.integer().default(0),
});
