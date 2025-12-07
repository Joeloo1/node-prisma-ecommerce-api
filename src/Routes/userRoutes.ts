import express from 'express';

import { signup } from '../controller/authController';
import { validateBody } from '../middleware/validationMiddleware';
import { signupSchema } from '../Schema/userSchema';

const router = express.Router();

router.post('/Signup', validateBody(signupSchema),  signup);

export default router;