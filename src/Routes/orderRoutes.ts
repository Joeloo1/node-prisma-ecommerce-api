import express from "express";
import { Protect } from "../controller/authController";
import { createOrder,  getMyOrder, getOrderById } from "../controller/orderController";


const router = express.Router();

router.use(Protect);

router
    .route('/')
    .get(getMyOrder)
    .post(createOrder)

router
    .route('/:id')
    .get(getOrderById)

export default router;

