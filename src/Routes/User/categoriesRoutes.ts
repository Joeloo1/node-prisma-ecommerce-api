import express from "express";

import {
  getAllCategories,
  getCategoryById,
} from "../../controller/categoryController";
import { validateParams } from "../../middleware/validationMiddleware";
import { categoryIdSchema } from "../../Schema/categoryShema";

const router = express.Router();

router.route("/").get(getAllCategories);

router.route("/:id").get(validateParams(categoryIdSchema), getCategoryById);

export default router;
