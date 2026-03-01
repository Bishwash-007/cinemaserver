import { z } from 'zod';

export const createMovieSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  releaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  durationInMinutes: z.number().int().positive(),
  language: z.string().min(1).max(50),
  genre: z.array(z.string()).min(1),
  posterUrls: z.array(z.string().url()).min(1),
  backdropUrl: z.string().url().optional(),
  trailerUrl: z.string().url().optional(),
  imdbId: z.string().max(20).optional(),
  imdbRating: z.number().min(0).max(10).optional(),
  letterboxdUrl: z.string().url().optional(),
  tmdbId: z.number().int().optional(),
  status: z.enum(['upcoming', 'released', 'archived']).default('upcoming'),
  isAdult: z.boolean().default(false),
  director: z.string().min(1).max(255),
});

export const updateMovieSchema = createMovieSchema.partial();

export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(10),
  comment: z.string().max(2000).optional(),
});

export const movieQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(['upcoming', 'released', 'archived']).optional(),
  genre: z.string().optional(),
  language: z.string().optional(),
  search: z.string().optional(),
});

export const createShowtimeSchema = z.object({
  movieId: z.number().int().positive(),
  screenId: z.number().int().positive(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  basePrice: z.number().positive(),
});

export const createTheaterSchema = z.object({
  name: z.string().min(1).max(255),
  location: z.string().min(1).max(255),
  city: z.string().min(1).max(100),
  address: z.string().min(1),
  contactNumber: z.string().max(20).optional(),
  amenities: z.array(z.string()).optional(),
});

export const createScreenSchema = z.object({
  theaterId: z.number().int().positive(),
  name: z.string().min(1).max(50),
  totalSeats: z.number().int().positive(),
  screenType: z.string().max(50).default('2D'),
});
