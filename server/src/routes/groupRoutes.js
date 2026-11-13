import express from "express";
import { getGroups, getGroupById } from "../controllers/groupController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", getGroups);
router.get("/:id", getGroupById);

export default router;