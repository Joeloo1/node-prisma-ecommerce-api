import express from "express";

import { updateOrder, adminCancelOrder } from "../../controller/orderController";

const router = express.Router();

router.route("/:id/status").patch(updateOrder);
router.route("/:id/cancel").patch(adminCancelOrder)

export default router;
