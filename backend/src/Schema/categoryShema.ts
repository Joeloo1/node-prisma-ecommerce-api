import { z } from "zod";

// Get category by ID
export const categoryIdSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .positive("Category ID must be a positive integer"),
});

// Create category
export const createCategorySchema = z.object({
  category_id: z.number().int().positive(),
  name: z
    .string()
    .min(1, { message: "A category must have a name" })
    .max(100)
    .trim(),
});
