import express from "express";
import { getCycles } from "../controllers/cycleController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.get("/", getCycles);

export default router;
