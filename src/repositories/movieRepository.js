import { eq, isNull, and, sql } from 'drizzle-orm';
import { db } from '../config/db.js';
import { moviesTable, reviewsTable } from '../models/movie.js';

export const findMovies = async ({ conditions, limit, offset }) =>
  db
    .select()
    .from(moviesTable)
    .where(and(...conditions))
    .limit(limit)
    .offset(offset)
    .orderBy(moviesTable.createdAt);

export const findMovieById = async id =>
  db
    .select()
    .from(moviesTable)
    .where(and(eq(moviesTable.id, id), isNull(moviesTable.deletedAt)))
    .then(([row]) => row ?? null);

export const findMovieBySlug = async slug =>
  db
    .select({ id: moviesTable.id })
    .from(moviesTable)
    .where(eq(moviesTable.slug, slug))
    .then(([row]) => row ?? null);

export const createMovie = async data =>
  db
    .insert(moviesTable)
    .values(data)
    .returning()
    .then(([row]) => row);

export const updateMovie = async (id, data) =>
  db
    .update(moviesTable)
    .set(data)
    .where(and(eq(moviesTable.id, id), isNull(moviesTable.deletedAt)))
    .returning()
    .then(([row]) => row ?? null);

export const softDeleteMovie = async id =>
  db
    .update(moviesTable)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(moviesTable.id, id), isNull(moviesTable.deletedAt)))
    .returning({ id: moviesTable.id })
    .then(([row]) => row ?? null);

export const findReviews = async (movieId, { limit, offset }) =>
  db
    .select()
    .from(reviewsTable)
    .where(eq(reviewsTable.movieId, movieId))
    .limit(limit)
    .offset(offset)
    .orderBy(reviewsTable.createdAt);

export const findReviewByUserAndMovie = async (movieId, userId) =>
  db
    .select({ id: reviewsTable.id })
    .from(reviewsTable)
    .where(
      and(eq(reviewsTable.movieId, movieId), eq(reviewsTable.userId, userId))
    )
    .then(([row]) => row ?? null);

export const createReview = async data =>
  db
    .insert(reviewsTable)
    .values(data)
    .returning()
    .then(([row]) => row);

export const getAverageRating = async movieId =>
  db
    .select({ avg: sql`AVG(${reviewsTable.rating})`.mapWith(Number) })
    .from(reviewsTable)
    .where(eq(reviewsTable.movieId, movieId))
    .then(([row]) => row.avg ?? 0);

export const updateMovieRating = async (movieId, rating) =>
  db
    .update(moviesTable)
    .set({ rating, updatedAt: new Date() })
    .where(eq(moviesTable.id, movieId));
