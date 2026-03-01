import { Router } from 'express';
import {
  getMe,
  updateProfile,
  changePassword,
  deleteAccount,
} from '../controllers/userControllers.js';
import { authenticate, validate } from '../middlewares/authMiddlewares.js';
import {
  updateProfileSchema,
  changePasswordSchema,
} from '../validations/userValidations.js';

const router = Router();

router.use(authenticate);

router.get('/me', getMe);
router.put('/me', validate(updateProfileSchema), updateProfile);
router.put('/me/password', validate(changePasswordSchema), changePassword);
router.delete('/me', deleteAccount);

export default router;
