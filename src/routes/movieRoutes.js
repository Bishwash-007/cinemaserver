import { Router } from 'express';
import {
  getMovies,
  getMovieById,
  getMovieReviews,
  createReview,
  getShowtimes,
  getTheaters,
  getScreenSeats,
} from '../controllers/movieControllers.js';
import {
  authenticate,
  validate,
  validateQuery,
} from '../middlewares/authMiddlewares.js';
import {
  createReviewSchema,
  movieQuerySchema,
} from '../validations/movieValidations.js';

const router = Router();

router.get('/', validateQuery(movieQuerySchema), getMovies);
router.get('/theaters', getTheaters);
router.get('/:id', getMovieById);
router.get('/:id/reviews', getMovieReviews);
router.get('/:id/showtimes', getShowtimes);
router.get('/screens/:screenId/seats', getScreenSeats);

router.post(
  '/:id/reviews',
  authenticate,
  validate(createReviewSchema),
  createReview
);

export default router;
