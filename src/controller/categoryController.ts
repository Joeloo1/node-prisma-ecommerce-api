import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync";
import AppError from "../utils/AppError";
import { prisma } from "./../config/database"

// GET ALL CATEGORIES 
export const getAllCategories = catchAsync(async (
    req: Request, res: Response, next: NextFunction) => {
    const categories = await prisma.categories.findMany();

    res.status(200).json({
        status: 'Success',
        result: categories.length,
        data: {
            categories
        }
    })
})

// GET CATEGORY BY ID
export const getCategoryById = catchAsync(async (
    req: Request, res: Response, next: NextFunction) => {
        const categoryId = parseInt(req.params.id);
        const category = await prisma.categories.findUnique({
            where: { category_id: categoryId}
        })
        if (!category) {
            return next(new AppError(
                `Category with ID: ${categoryId} not found`, 404
            ));
        }
          res.status(200).json({
                status: 'Success',
                data: {
                    category
                }
            })
    })