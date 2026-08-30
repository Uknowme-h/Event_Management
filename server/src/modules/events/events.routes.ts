import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authenticate } from "../../middleware/authenticate.js";
import { validate } from "../../middleware/validate.js";
import {
  eventBodySchema,
  eventIdParamsSchema,
  listEventsQuerySchema,
} from "./events.schema.js";
import * as eventsController from "./events.controller.js";
import rsvpRouter from "../rsvp/rsvp.routes.js";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  validate({ query: listEventsQuerySchema }),
  asyncHandler(eventsController.list),
);

router.post(
  "/",
  validate(eventBodySchema),
  asyncHandler(eventsController.create),
);

router.get(
  "/:id",
  validate({ params: eventIdParamsSchema }),
  asyncHandler(eventsController.getOne),
);

router.patch(
  "/:id",
  validate({ params: eventIdParamsSchema, body: eventBodySchema }),
  asyncHandler(eventsController.update),
);

router.delete(
  "/:id",
  validate({ params: eventIdParamsSchema }),
  asyncHandler(eventsController.remove),
);

// RSVP sub-routes: PUT /events/:id/rsvp, DELETE /events/:id/rsvp
router.use("/:id/rsvp", rsvpRouter);

export default router;