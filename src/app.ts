import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";

import productRoutes from "./Routes/User/productRoutes";
import categoryRoutes from "./Routes/User/categoriesRoutes";
import userRoutes from "./Routes/User/userRoutes";
import adminRoutes from "./Routes/Admin/adminRoutes";
import addressRoutes from "./Routes/User/addressRoutes";
import reviewsRoutes from "./Routes/User/reviewsRoutes";
import orderRoutes from "./Routes/User/orderRoutes";
import cartRoutes from "./Routes/User/cartRoutes";

import AppError from "./utils/AppError";
import { globalErrorHandler } from "./Error/globalErrorHandler";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Development logging
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
// product Routes
app.use("/api/v1/products", productRoutes);
// category Routes
app.use("/api/v1/categories", categoryRoutes);
// User Routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/admin", adminRoutes);
// Address Routes
app.use("/api/v1/addresses", addressRoutes);
// reviews Routes
app.use("/api/v1/reviews", reviewsRoutes);
// cart Routes
app.use("/api/v1/cart", cartRoutes);
// order Routes
app.use("/api/v1/order", orderRoutes);

// HANDLING  unhandled Routes
app.use((req: Request, res: Response, next: NextFunction) => {
  return next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

export default app;
