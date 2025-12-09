import express from 'express';

import { login,
        signup,
        forgetPassword,
        resetPassword,
        Protect,
        updatePassword,
        restrictTo} from '../controller/authController';
import { validateBody } from '../middleware/validationMiddleware';
import { signupSchema, loginSchema, updateUserSchema } from '../Schema/userSchema';
import { updateMe, getMe, deleteMe, getAllUsers, getUser, createUser } from "../controller/userController";

const router = express.Router();

router
  .post('/Signup',
  validateBody(signupSchema), 
    signup);

router
  .post('/Login',
    validateBody(loginSchema), 
    login);

router.post('/forgetPassword', forgetPassword);
router.patch('/resetPassword/:token', resetPassword);

router.use(Protect);

router
  .patch('/updateMyPassword',
            validateBody(updateUserSchema),
             updatePassword);


export default router;
