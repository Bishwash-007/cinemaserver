import { Router } from 'express';
import {
  authenticate,
  authorize,
  validate,
  validateQuery,
} from '../middlewares/authMiddlewares.js';

import { getAllUsers, updateUserRole } from '../controllers/userControllers.js';
import {
  createMovie,
  updateMovie,
  deleteMovie,
  createShowtime,
  createTheater,
  createScreen,
} from '../controllers/movieControllers.js';
import {
  getAllBookings,
  createDiscountCode,
  updateBookingStatus,
} from '../controllers/bookingControllers.js';
import {
  getDashboardOverview,
  getRevenueReport,
  getBookingsReport,
  getMoviesReport,
  getOccupancyReport,
  getUsersReport,
  getDiscountsReport,
} from '../controllers/reportControllers.js';

import { updateUserRoleSchema } from '../validations/userValidations.js';
import {
  createMovieSchema,
  updateMovieSchema,
  createShowtimeSchema,
  createTheaterSchema,
  createScreenSchema,
} from '../validations/movieValidations.js';
import {
  bookingQuerySchema,
  createDiscountCodeSchema,
  updateBookingStatusSchema,
} from '../validations/bookingValidations.js';
import {
  reportQuerySchema,
  reportMoviesQuerySchema,
} from '../validations/reportValidations.js';

const router = Router();

router.use(authenticate, authorize('admin'));
router.get('/users', getAllUsers);
router.put('/users/:id/role', validate(updateUserRoleSchema), updateUserRole);
router.post('/movies', validate(createMovieSchema), createMovie);
router.put('/movies/:id', validate(updateMovieSchema), updateMovie);
router.delete('/movies/:id', deleteMovie);
router.post(
  '/movies/showtimes',
  validate(createShowtimeSchema),
  createShowtime
);
router.post('/theaters', validate(createTheaterSchema), createTheater);
router.post('/screens', validate(createScreenSchema), createScreen);
router.get('/bookings', validateQuery(bookingQuerySchema), getAllBookings);
router.post(
  '/discounts',
  validate(createDiscountCodeSchema),
  createDiscountCode
);
router.patch(
  '/bookings/:id',
  validate(updateBookingStatusSchema),
  updateBookingStatus
);
router.get('/reports/overview', getDashboardOverview);
router.get(
  '/reports/revenue',
  validateQuery(reportQuerySchema),
  getRevenueReport
);
router.get(
  '/reports/bookings',
  validateQuery(reportQuerySchema),
  getBookingsReport
);
router.get(
  '/reports/movies',
  validateQuery(reportMoviesQuerySchema),
  getMoviesReport
);
router.get(
  '/reports/occupancy',
  validateQuery(reportQuerySchema),
  getOccupancyReport
);
router.get('/reports/users', validateQuery(reportQuerySchema), getUsersReport);
router.get('/reports/discounts', getDiscountsReport);

export default router;
