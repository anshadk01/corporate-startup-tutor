import express from "express";
import {
  getNews,
  getNewsById,
  createNews,
  generateNews,
  updateNews,
  deleteNews
} from "../controllers/newsController.js";
import { protect, requireStudentAuthor } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", getNews);
router.get("/:id", getNewsById);

// Students author news; instructors have read-only access to student items
router.post("/generate", requireStudentAuthor, generateNews);
router.post("/", requireStudentAuthor, createNews);
router.put("/:id", requireStudentAuthor, updateNews);
router.delete("/:id", requireStudentAuthor, deleteNews);

export default router;
