import { z } from "zod";

// create Address
export const createAddressSchema = z.object({
  street: z.string().min(2),
  city: z.string().min(2),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
});

// update Address
export const updateAddressSchema = z.object({
  street: z.string().min(2).optional(),
  city: z.string().min(2).optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
});

// Get Address BY ID
 export const addressIdSchema = z.object({
    id: z.string().uuid("Invalid product ID format"),
})
