import { z } from "zod";

export const eventBodySchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255, "Title must be 255 characters or less"),
  description: z.string().max(5000, "Description must be 5000 characters or less").optional().default(""),
  start_at: z
    .string()
    .min(1, "Date and time is required")
    .refine((value) => new Date(value) > new Date(), {
      message: "Date and time must be in the future",
    }),
  location: z.string().max(255, "Location must be 255 characters or less").optional().default(""),
  type: z.enum(["public", "private"], {
    required_error: "Type is required",
    invalid_type_error: "Type must be public or private",
  }),
  tags: z
    .array(z.string().trim().min(1).max(50, "Each tag must be 50 characters or less"))
    .min(1, "At least one tag is required")
    .max(10, "A maximum of 10 tags is allowed"),
});

export type EventBodyInput = z.infer<typeof eventBodySchema>;
