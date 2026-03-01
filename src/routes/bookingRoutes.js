import { Router } from 'express';
import {
  createBooking,
  cancelBooking,
  getBookingById,
  getMyBookings,
  validateDiscount,
  lockSeats,
} from '../controllers/bookingControllers.js';
import { getReceipt, resendReceipt } from '../controllers/reportControllers.js';
import {
  authenticate,
  validate,
  validateQuery,
} from '../middlewares/authMiddlewares.js';
import {
  createBookingSchema,
  cancelBookingSchema,
  bookingQuerySchema,
  validateDiscountSchema,
} from '../validations/bookingValidations.js';

const router = Router();

router.use(authenticate);

router.post('/', validate(createBookingSchema), createBooking);
router.get('/mine', validateQuery(bookingQuerySchema), getMyBookings);
router.get('/:id', getBookingById);
router.put('/:id/cancel', validate(cancelBookingSchema), cancelBooking);
router.get('/:id/receipt', getReceipt);
router.post('/:id/receipt/resend', resendReceipt);
router.post('/seats/lock', lockSeats);
router.post(
  '/discounts/validate',
  validate(validateDiscountSchema),
  validateDiscount
);

export default router;
