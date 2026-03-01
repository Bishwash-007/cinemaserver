import { Router } from 'express';
import {
  initiatePayment,
  verifyPayment,
  getPaymentByBookingId,
  refundPayment,
} from '../controllers/paymentControllers.js';
import { authenticate, validate } from '../middlewares/authMiddlewares.js';
import {
  initiatePaymentSchema,
  verifyPaymentSchema,
  refundPaymentSchema,
} from '../validations/paymentValidations.js';

const router = Router();

router.use(authenticate);

router.post('/initiate', validate(initiatePaymentSchema), initiatePayment);
router.post('/verify', validate(verifyPaymentSchema), verifyPayment);
router.post('/refund', validate(refundPaymentSchema), refundPayment);
router.get('/:bookingId', getPaymentByBookingId);

export default router;
