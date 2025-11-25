import express from "express";

import { createProduct, getAllProducts, getProduct, updateProduct } from "../controller/productController";
import { validateBody, validateParams } from "../middleware/validationMiddleware";
import { createProductSchema , productIdSchema} from "../Schema/productSchema";

const router = express.Router()

router.route('/').get(getAllProducts)
router.route('/').post(validateBody(createProductSchema), createProduct)
router.route('/:id').get(validateParams(productIdSchema), getProduct)
router.route('/:id').patch(updateProduct)

export default router