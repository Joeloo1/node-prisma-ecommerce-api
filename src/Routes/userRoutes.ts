import express from 'express';

import { login, signup } from '../controller/authController';
import { validateBody } from '../middleware/validationMiddleware';
import { signupSchema, loginSchema } from '../Schema/userSchema';

const router = express.Router();

router.post('/Signup', validateBody(signupSchema),  signup);

router.post('/Login', validateBody(loginSchema),  login);

export default router;
