import express from "express";

import {
  createProduct,
  addProductImages,
  deleteProduct,
  updateProduct,
} from "../../controller/productController";
import {
  validateBody,
  validateParams,
} from "../../middleware/validationMiddleware";
import {
  createProductSchema,
  productIdSchema,
  updateProductSchema,
} from "../../Schema/productSchema";
import { uploadProductImages, resizeProductImages } from "../../middleware/uploadMiddleware";

const router = express.Router();

router.route("/").post(validateBody(createProductSchema), createProduct);

router.post(
  "/:id/images",
  validateParams(productIdSchema),
  uploadProductImages,
  resizeProductImages,
  addProductImages,
);

router
  .route("/:id")
  .patch(
    validateParams(productIdSchema),
    validateBody(updateProductSchema),
    updateProduct
  )
  .delete(validateParams(productIdSchema), deleteProduct);

export default router;
