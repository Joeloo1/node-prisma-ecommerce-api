import fs from "fs";
import path from "path";
import multer, { FileFilterCallback } from "multer";
import sharp from "sharp";
import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";
import catchAsync from "../utils/catchAsync";
import logger from "../config/logger";

// Multer memory storage
const multeStorage = multer.memoryStorage();

const multerFilter = (
  req: Request,
  file: Express.Multer.File,
  cd: FileFilterCallback,
) => {
  logger.info(
    `File upload attempt: ${file.originalname} with mimetype: ${file.mimetype}`,
  );
  if (file.mimetype.startsWith("image")) {
    cd(null, true);
  } else {
    logger.warn("Upload failed: Not an image file");
    cd(new AppError("Not an image! Please upload only images", 400));
  }
};

const upload = multer({
  storage: multeStorage,
  fileFilter: multerFilter,
});

// middleware to upload single file
export const uploadUserPhoto = upload.single("profileImage");

// middleware to upload multiple product images
export const uploadProductImages = upload.array("images", 10);

// resize image
export const resizeUserPhoto = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    logger.info("Resizing user photo");
    if (!req.file) return next();

    if (!req.user || !req.user.id) {
      logger.error("User not authenticated for photo upload");
      return next(new AppError("User not authenticated", 401));
    }

    // Generate unique filename
    const filename = `user-${req.user.id}-${Date.now()}.jpeg`;
    const uploadDir = path.join(__dirname, "../../public/users");
    const filepath = path.join(uploadDir, filename);
    fs.mkdirSync(uploadDir, { recursive: true });

    // Resize and save image
    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(filepath);

    req.file.filename = filename;

    next();
  },
);

export const resizeProductImages = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const files = (req.files ?? []) as Express.Multer.File[];
    if (!files.length) return next();

    const productId = req.params.id;
    if (!productId) return next(new AppError("Product id is required", 400));

    const uploadDir = path.join(__dirname, "../../public/products");
    fs.mkdirSync(uploadDir, { recursive: true });

    const savedPaths: string[] = [];

    await Promise.all(
      files.map(async (file, idx) => {
        const filename = `product-${productId}-${Date.now()}-${idx + 1}.jpeg`;
        const filepath = path.join(uploadDir, filename);
        await sharp(file.buffer)
          .resize(1400, 1400, { fit: "inside", withoutEnlargement: true })
          .toFormat("jpeg")
          .jpeg({ quality: 88 })
          .toFile(filepath);
        savedPaths.push(`/public/products/${filename}`);
      }),
    );

    (req as any).uploadedProductImages = savedPaths;
    next();
  },
);
