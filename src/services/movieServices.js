import { isNull, ilike, eq } from 'drizzle-orm';
import * as movieRepo from '../repositories/movieRepository.js';
import * as theaterRepo from '../repositories/theaterRepository.js';
import { AppError } from '../utils/error.js';

const slugify = text =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const getMovies = async ({ page, limit, status, language, search }) => {
  const offset = (page - 1) * limit;
  const { moviesTable } = await import('../models/movie.js');

  const conditions = [isNull(moviesTable.deletedAt)];
  if (status) conditions.push(eq(moviesTable.status, status));
  if (language) conditions.push(ilike(moviesTable.language, `%${language}%`));
  if (search) conditions.push(ilike(moviesTable.title, `%${search}%`));

  const movies = await movieRepo.findMovies({ conditions, limit, offset });
  return { movies, page, limit };
};

export const getMovieById = async id => {
  const movie = await movieRepo.findMovieById(id);
  if (!movie) {
    throw new AppError('Movie not found', 404);
  }
  return movie;
};

export const createMovie = async data => {
  const slug = slugify(data.title);

  const existing = await movieRepo.findMovieBySlug(slug);
  if (existing) {
    throw new AppError('A movie with this title already exists', 409);
  }

  return movieRepo.createMovie({ ...data, slug });
};

export const updateMovie = async (id, data) => {
  const updates = data.title
    ? { ...data, slug: slugify(data.title), updatedAt: new Date() }
    : { ...data, updatedAt: new Date() };

  const movie = await movieRepo.updateMovie(id, updates);
  if (!movie) {
    throw new AppError('Movie not found', 404);
  }
  return movie;
};

export const deleteMovie = async id => {
  const deleted = await movieRepo.softDeleteMovie(id);
  if (!deleted) {
    throw new AppError('Movie not found', 404);
  }
  return { message: 'Movie deleted successfully' };
};

export const getMovieReviews = async (movieId, { page, limit }) => {
  const offset = (page - 1) * limit;
  const reviews = await movieRepo.findReviews(movieId, { limit, offset });
  return { reviews, page, limit };
};

export const createReview = async (movieId, userId, { rating, comment }) => {
  await getMovieById(movieId); // throws 404 if not found

  const existing = await movieRepo.findReviewByUserAndMovie(movieId, userId);
  if (existing) {
    throw new AppError('You have already reviewed this movie', 409);
  }

  const review = await movieRepo.createReview({
    movieId,
    userId,
    rating,
    comment,
  });

  const avg = await movieRepo.getAverageRating(movieId);
  await movieRepo.updateMovieRating(movieId, String(avg.toFixed(1)));

  return review;
};

export const getShowtimes = async movieId =>
  theaterRepo.findShowtimesByMovie(movieId);

export const createShowtime = async ({
  movieId,
  screenId,
  startTime,
  endTime,
  basePrice,
}) =>
  theaterRepo.createShowtime({
    movieId,
    screenId,
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    basePrice: String(basePrice),
  });

export const getTheaters = async ({ page, limit }) => {
  const offset = (page - 1) * limit;
  const theaters = await theaterRepo.findActiveTheaters({ limit, offset });
  return { theaters, page, limit };
};

export const createTheater = async data => theaterRepo.createTheater(data);

export const createScreen = async data => theaterRepo.createScreen(data);

export const getScreenSeats = async screenId =>
  theaterRepo.findSeatsByScreen(screenId);
