import { Request, Response, NextFunction } from "express";
import { prisma } from "./../config/database";

import catchAsync from "../utils/catchAsync";
import AppError from "../utils/AppError";
import { CancelledBy, OrderStatus } from "@prisma/client";
import logger from "../config/logger";

export const createOrder = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      logger.warn("Item is required and can not be empty");
      return next(new AppError("Items is required and cannot be empty", 400));
    }

    // calculating total from DB produt price
    let calculatedTotal = 0;

    const orderItemsData: any[] = [];

    for (const item of items) {
      const product = await prisma.products.findUnique({
        where: { product_id: item.product_id },
      });

      logger.info(`Fetched product for ID ${item.product_id}: ${product}`);
      if (!product) {
        logger.warn(`product with ID ${item.product_id} not found`);
        return next(new AppError(`Product not found: ${item.product_id}`, 404));
      }

      if (item.quantity <= 0) {
        logger.warn(`Invalid quantity for product ID ${item.product_id}`);
        return next(new AppError("Quantity must be greater than 0", 400));
      }

      const itemTotal = product.price * item.quantity;
      calculatedTotal += itemTotal;

      orderItemsData.push({
        product_id: item.product_id,
        quantity: item.quantity,
        price: product.price,
      });
    }

    logger.info(`Calculated total order amount : ${calculatedTotal}`);
    // Transaction to store order + order items
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          total: calculatedTotal,
          status: "PENDING",
        },
      });

      logger.info(`Created new order with ID: ${newOrder.id}`);
      const orderItems = await Promise.all(
        orderItemsData.map((item) =>
          tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              product_id: item.product_id,
              quantity: item.quantity,
              price: item.price,
            },
          }),
        ),
      );

      return {
        ...newOrder,
        items: orderItems,
      };
    });

    logger.info(`order created successfully with ID: ${order.id}`);
    res.status(201).json({
      status: "success",
      message: "Order created successfully",
      data: { order },
    });
  },
);

//  Get My Order
export const getMyOrder = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    logger.info(`Fetching orders for user ID: ${req.user!.id}`);
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.id },
      include: { items: true },
    });

    logger.info("Orders fetched successfully");
    res.status(200).json({
      status: "success",
      results: orders.length,
      data: {
        orders,
      },
    });
  },
);

// Get single Order
export const getOrderById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    logger.info(`Fetching order with ID: ${req.params.id}`);
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: true,
        user: true,
      },
    });

    if (!order) {
      logger.warn(`Order with ID: ${req.params.id} not found`);
      return next(new AppError("Order not found", 404));
    }

    logger.info(`Order with ID: ${req.params.id} fetched suessfully`);
    res.status(200).json({
      status: "success",
      data: {
        order,
      },
    });
  },
);

// update Order (only Admin)
export const updateOrder = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { status } = req.body;

    logger.info("updating order status");
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
    });

    logger.info("Order status successfully updated");
    res.status(200).json({
      status: "success",
      message: "Order status updated successfully",
      data: { order },
    });
  },
);

// Cancel Order (USER)
export const cancelOrder = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const orderId = req.params.id;
    const userId = req.user!.id;

    const cancellableStatus: OrderStatus[] = [OrderStatus.PENDING];

    logger.info(`User with ID: ${userId} wants to cancel order ID: ${orderId}`);
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      logger.warn(`Order with ID: ${orderId} not found`);
      return next(new AppError("Order not found", 404));
    }

    if (order.userId !== userId) {
      logger.warn(
        `User with ID: ${userId} is not authorized to cancel order ID: ${orderId}`,
      );
      return next(
        new AppError("You are not allowed to cancel this Order", 403),
      );
    }

    if (order.status === OrderStatus.CANCELLED) {
      logger.warn(`Order with ID: ${orderId} id already cancelled`);
      return next(new AppError("Order already cancelled", 400));
    }

    if (!cancellableStatus.includes(order.status)) {
      logger.warn(
        `Order with ID : ${orderId} cannot be canceled at this stage`,
      );
      return next(new AppError("Order cannot be cancelled at this stage", 400));
    }

    logger.info(`Cancelling order with ID: ${orderId}`);
    const cancelledOrder = await prisma.order.update({
      where: {
        id: orderId,
        status: { in: cancellableStatus },
      },
      data: {
        status: OrderStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelledBy: CancelledBy.USER,
      },
    });

    logger.info(`Order with ID: ${orderId} sucessfully cancelled`);
    res.status(200).json({
      status: "success",
      data: {
        order: cancelledOrder,
      },
    });
  },
);

// Cancel Order (ADMIN)
export const adminCancelOrder = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const orderId = req.params.id;

    const cancellableStatus: OrderStatus[] = [
      OrderStatus.PENDING,
      OrderStatus.PAID,
      OrderStatus.PROCESSING,
    ];

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return next(new AppError("Order not found", 404));
    }

    if (order.status === OrderStatus.CANCELLED) {
      return next(new AppError("Order already cancelled", 400));
    }

    if (!cancellableStatus.includes(order.status)) {
      return next(new AppError("Order cannot be cancelled at this stage", 400));
    }

    const cancelledOrder = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: OrderStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelledBy: CancelledBy.ADMIN,
      },
    });

    res.status(200).json({
      status: "success",
      data: {
        order: cancelledOrder,
      },
    });
  },
);
