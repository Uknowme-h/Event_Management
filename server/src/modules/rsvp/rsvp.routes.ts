import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middleware/validate.js";
import { rsvpBodySchema } from "./rsvp.schema.js";
import * as rsvpController from "./rsvp.controller.js";

// mergeParams lets this router read :id set by the parent events router
const router = Router({ mergeParams: true });

router.put("/", validate(rsvpBodySchema), asyncHandler(rsvpController.upsert));
router.delete("/", asyncHandler(rsvpController.remove));

export default router;
