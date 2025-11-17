import { z } from "zod"

// create products
export const createProductSchema = z.object({
    product_id: z.number().int(),
    name: z.string().max(255),
    description: z.string().optional(),
    price: z
    .string()
    .refine((val) => !isNaN(Number(val)), { message: "Price must be a numeric string" }), 
    unit: z.string().max(50).optional(),
    Image: z.string().url().optional(),
    discoumt: z
    .string()
    .optional()
    .refine((val) => val === undefined || !isNaN(Number(val)), 
    { message: "Discount must be a valid decimal" }),
    availability: z.boolean().optional().default(true),
    brand: z.string().max(100).optional(),
    rating: z
    .string()
    .optional()
    .refine((val) => val === undefined || !isNaN(Number(val)), { message: "Rating must be a valid decimal" }),
    category_id: z.number().int().optional(),
    created_at: z.date().optional().default(() => new Date()),
    updated_at: z.date().optional().default(() => new Date()),
})

export type CreateProductInput = z.infer<typeof createProductSchema>;
