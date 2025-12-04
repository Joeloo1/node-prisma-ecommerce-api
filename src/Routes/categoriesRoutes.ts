import express from 'express';

import {  getAllCategories,
          getCategoryById,
          createCategory, 
          deleteCategory} from '../controller/categoryController';
import { validateParams, 
         validateBody,
         validateQuery } from '../middleware/validationMiddleware';
import { categoryIdSchema, 
         createCategorySchema } from '../Schema/categoryShema';


const router = express.Router();

router
    .route('/')
        .get(getAllCategories)
        .post(validateBody(createCategorySchema), createCategory);


router
    .route('/:id')
        .get(validateParams(categoryIdSchema), getCategoryById)
        .delete(validateParams(categoryIdSchema), deleteCategory)

export default router; 