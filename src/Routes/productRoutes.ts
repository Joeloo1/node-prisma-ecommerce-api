import express from "express";

import { createProduct,
         deleteProduct,
         getAllProducts, 
         getProduct, 
         updateProduct } from "../controller/productController";
import { validateBody, validateParams } from "../middleware/validationMiddleware";
import { createProductSchema , productIdSchema, updateProductSchema} from "../Schema/productSchema";

const router = express.Router()

router
    .route('/')
    .get(getAllProducts)
    .post(validateBody(createProductSchema), createProduct);

router
    .route('/:id')
    .get(validateParams(productIdSchema), getProduct)
    .patch(
    validateParams(productIdSchema), 
    validateBody(updateProductSchema) , 
     updateProduct)
     .delete(validateParams(productIdSchema), deleteProduct);
export default router