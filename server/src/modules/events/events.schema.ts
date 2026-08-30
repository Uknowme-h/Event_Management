import {z} from 'zod';

export const eventIdParamsSchema = z.object({
    id: z.coerce.number().positive(),
});

export const eventBodySchema = z.object({
    title: z.string().trim().min(1, "Title is required").max(255),
    description: z.string().max(5000).optional().default(""),
    start_at: z
      .string()
      .min(1, "start_at is required")
      .refine((value) => !Number.isNaN(Date.parse(value)), {
        message: "start_at must be a valid datetime",
      })
      .refine((value) => new Date(value) > new Date(), {
        message: "start_at must be in the future",
      }),
    location: z.string().max(255).optional().default(""),
    type: z.enum(["public", "private"]),
    tags: z
      .array(z.string().trim().min(1).max(50))
      .min(1, "At least one tag is required")
      .max(10, "A maximum of 10 tags is allowed")
      .transform((names) => [...new Set(names)]),
  });

  export const listEventsQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
    status: z.enum(["upcoming", "past"]).optional(),
    type: z.enum(["public", "private"]).optional(),
    tags: z
      .string()
      .optional()
      .transform((value) => {
        if (!value) return undefined;
        const names = value
          .split(",")
          .map((name) => name.trim())
          .filter(Boolean);
        return names.length ? names : undefined;
      }),
    q: z
      .string()
      .trim()
      .optional()
      .transform((value) => value || undefined),
  });

  export type EventBody = z.infer<typeof eventBodySchema>;
  export type ListEventsQuery = z.infer<typeof listEventsQuerySchema>;
  export type EventIdParams = z.infer<typeof eventIdParamsSchema>;