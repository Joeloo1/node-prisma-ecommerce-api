import express from "express";
import { Protect, restrictTo } from "../../controller/authController";
import {
  createOrder,
  getMyOrder,
  getOrderById,
  updateOrder,
  cancelOrder,
} from "../../controller/orderController";
import { Role } from "../../types/role.types";

const router = express.Router();

router.use(Protect);

router.route("/").get(getMyOrder).post(createOrder);

router
  .route("/:id")
  .get(getOrderById)
  .patch(cancelOrder);

router.patch("/:id/admin", restrictTo(Role.ADMIN), updateOrder);

export default router;
