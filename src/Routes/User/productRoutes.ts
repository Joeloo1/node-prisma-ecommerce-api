import express from "express";

import { getAllProducts, getProduct } from "../../controller/productController";
import { validateParams } from "../../middleware/validationMiddleware";
import { productIdSchema } from "../../Schema/productSchema";

const router = express.Router();

router.route("/").get(getAllProducts);
router.route("/:id").get(validateParams(productIdSchema), getProduct);

export default router;
