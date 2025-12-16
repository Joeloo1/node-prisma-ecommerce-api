import express from "express";

import {
  createCategory,
  deleteCategory,
} from "../../controller/categoryController";
import {
  validateBody,
  validateParams,
} from "../../middleware/validationMiddleware";
import {
  categoryIdSchema,
  createCategorySchema,
} from "../../Schema/categoryShema";

const router = express.Router();

router.route("/").post(validateBody(createCategorySchema), createCategory);

router.route("/:d").delete(validateParams(categoryIdSchema), deleteCategory);

export default router;
