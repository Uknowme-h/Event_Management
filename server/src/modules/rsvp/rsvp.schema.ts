import { z } from "zod";

export const rsvpBodySchema = z.object({
  status: z.enum(["yes", "no", "maybe"], {
    errorMap: () => ({ message: 'status must be "yes", "no", or "maybe"' }),
  }),
});

export type RsvpBody = z.infer<typeof rsvpBodySchema>;
