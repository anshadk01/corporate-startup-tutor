import express from "express";
import {
  generateReflection,
  createReflection,
  getReflections,
  getReflectionById,
  updateReflection,
  deleteReflection
} from "../controllers/reflectionController.js";
import { protect, requireStudentAuthor } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", getReflections);
router.get("/:id", getReflectionById);

// Creation, generation and updates require student role (instructors are read-only)
router.post("/generate", requireStudentAuthor, generateReflection);
router.post("/", requireStudentAuthor, createReflection);
router.put("/:id", requireStudentAuthor, updateReflection);
router.delete("/:id", requireStudentAuthor, deleteReflection);

export default router;
