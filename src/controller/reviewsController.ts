import { Request, Response, NextFunction, Router } from "express";
import catchAsync from "../utils/catchAsync";
import AppError from "../utils/AppError";
import { createReviewSchema } from "../Schema/reviewsSchema";
import { prisma } from "./../config/database";
import logger from "../config/logger";

// create review
export const createReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { product_id, rating, content } = createReviewSchema.parse(req.body);

    const existingReview = await prisma.review.findUnique({
      where: {
        userId_product_id: { userId, product_id },
      },
    });

    if (existingReview) {
      logger.warn(`User already reviewed this product`);
      return next(new AppError("You already reviewed this product", 400));
    }

    logger.info(`Creating review for product ID: ${product_id} by user ID: ${userId}`);
    const review = await prisma.review.create({
      data: {
        userId,
        product_id,
        rating,
        content,
      },
    });

    logger.info('Review created successfully')
    res.status(200).json({
      status: "success",
      data: {
        review,
      },
    });
  },
);

// Update review
export const updateReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { content, rating } = req.body;
    const review = await prisma.review.findUnique({
      where: { id: req.params.id },
    });

    if (!review || review.userId !== req.user!.id) {
      logger.info(`Review with ID: ${req.params.id} not found`);
      return next(new AppError("Review not found", 404));
    }

    logger.info(`Updating review with ID: ${req.params.id}`);
    const updatedReview = await prisma.review.update({
      where: { id: req.params.id },
      data: {
        content,
        rating,
      },
    });

    logger.info(`Review with ID: ${req.params.id} updated successfully`);
    res.status(201).json({
      status: "success",
      data: {
        updatedReview,
      },
    });
  },
);

// Get reviews for products
export const getProductReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    logger.info(`Fetching reviews for product ID: ${req.params.product_id}`);
    const reviews = await prisma.review.findMany({
      where: { product_id: req.params.product_id },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    logger.info(`Reviews for Product ID: ${req.params.product_id} fetched successfully`);
    res.status(200).json({
      status: "success",
      data: {
        reviews,
      },
    });
  },
);

// delete Review
export const deleteReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const review = await prisma.review.findUnique({
      where: { id: req.params.id },
    });

    if (!review || review.userId !== req.user!.id) {
      logger.info(`Review with ID: ${req.params.id} not found`);
      return next(new AppError("Review not found", 404));
    }

    logger.info(`Deleting review with ID: ${req.params.id}`);
    await prisma.review.delete({
      where: { id: req.params.id },
    });

    logger.info(`Review with ID: ${req.params.id} deleted successfully`);
    res.status(200).json({
      status: "success",
      data: null,
    });
  },
);
