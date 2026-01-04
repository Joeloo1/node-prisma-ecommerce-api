import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import catchAsync from "../utils/catchAsync";
import AppError from "../utils/AppError";
import { productQuerySchema } from "../Schema/querySchema";
import {
  buildWhereClause,
  buildOrderByClause,
  buildSelectClause,
  getPaginationParams,
} from "../utils/queryBuilder";
import logger from "../config/logger";

const prisma = new PrismaClient();

// CREATE PRODUCT
export const createProduct = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = req.body;
    if (data.category_id) {
      const categoryExists = await prisma.category.findUnique({
        where: { category_id: data.category_id },
      });
      if (!categoryExists) {
        logger.warn(`Category with ID: ${data.category_id} does not exist`);
        return next(
          new AppError(
            `Category with ID ${data.category_id} does not exist`,
            400,
          ),
        );
      }
    }

    logger.info("Creating new Product");
    const product = await prisma.products.create({
      data,
      include: {
        category: {
          select: {
            category_id: true,
            name: true,
          },
        },
      },
    });

    logger.info("Product created successfully");
    res.status(201).json({
      status: "Success",
      data: {
        product,
      },
    });
  },
);

// GET ALL PRODUCTS WITH FILTERING, SORTING & PAGINATION
export const getAllProducts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Validate and parse query parameters
    const filters = productQuerySchema.parse(req.query);

    logger.info("Fetching all Products");
    // Build query components
    const where = buildWhereClause(filters);
    const orderBy = buildOrderByClause(filters);
    const select = buildSelectClause(filters.fields);
    const { skip, take } = getPaginationParams(filters.page, filters.limit);

    // Execute query with count in parallel
    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where,
        orderBy,
        skip,
        take,
        include: !select
          ? {
              category: {
                select: {
                  category_id: true,
                  name: true,
                },
              },
            }
          : undefined,
      }),
      prisma.products.count({ where }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / filters.limit);

    logger.info("Fetched all products successfully");
    res.status(200).json({
      status: "Success",
      results: products.length,
      data: {
        products,
      },
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages,
        hasNext: filters.page < totalPages,
        hasPrev: filters.page > 1,
      },
    });
  },
);

// GET SINGLE PRODUCT
export const getProduct = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const productId = req.params.id;
    logger.info(`Fetching Product by ID: ${productId}`);
    const product = await prisma.products.findUnique({
      where: { product_id: productId },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!product) {
      logger.warn(`Prouct with ID: ${productId} not found`);
      return next(new AppError("Product not found", 400));
    }

    logger.info("Product Fetched by ID successfully");
    res.status(200).json({
      status: "Success",
      data: { product },
    });
  },
);

// UPDATE PRODUCT
export const updateProduct = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const productId = req.params.id;
    const data = req.body;

    const existingProduct = await prisma.products.findUnique({
      where: { product_id: productId },
    });

    if (!existingProduct) {
      logger.warn(`Product with ${productId} not found`);
      return next(new AppError(`product with ${productId} not found`, 404));
    }

    if (data.category_id) {
      const categoryExists = await prisma.category.findUnique({
        where: { category_id: data.category_id },
      });
      if (!categoryExists) {
        logger.warn(`Category with ID: ${data.category_id} oes not exist`);
        return next(
          new AppError(
            `Category with ID ${data.category_id} does not exist`,
            400,
          ),
        );
      }
    }

    logger.info("Updating product");
    const product = await prisma.products.update({
      where: { product_id: productId },
      data,
      include: {
        category: {
          select: {
            category_id: true,
            name: true,
          },
        },
      },
    });

    logger.info(`Product with ID: ${productId} updated successfully`);
    res.status(200).json({
      status: "Success",
      data: {
        product,
      },
    });
  },
);

// delete product
export const deleteProduct = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const productId = req.params.id;

    const existingProduct = await prisma.products.findUnique({
      where: { product_id: productId },
    });

    if (!existingProduct) {
      logger.warn(`Product with ID: ${productId} not found`);
      return next(new AppError(`Product with ID: ${productId} not found`, 404));
    }

    logger.info(`Deleting product with ID: ${productId}`);
    await prisma.products.delete({
      where: { product_id: productId },
    });

    logger.info(`Product with ID: ${productId} deleted successfully`);
    res.status(200).json({
      status: "Success",
      data: null,
    });
  },
);
