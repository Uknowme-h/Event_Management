import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authenticate } from "../../middleware/authenticate.js";
import * as tagsController from "./tags.controller.js";

const router = Router();

router.get("/", authenticate, asyncHandler(tagsController.list));

export default router;