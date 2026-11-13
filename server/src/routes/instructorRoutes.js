import express from "express";
import {
  getInstructorDashboard,
  getInstructorGroupDetails,
  addInstructorComment,
  getGroupComments,
  exportGroupDataCsv
} from "../controllers/instructorController.js";
import { protect, authorize, enforceGroupMembership } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

// Instructor-only dashboard and details
router.get("/dashboard", authorize("INSTRUCTOR"), getInstructorDashboard);
router.get("/groups/:id", authorize("INSTRUCTOR"), getInstructorGroupDetails);
router.post("/comments", authorize("INSTRUCTOR"), addInstructorComment);

// Comments & Audit CSV export (shared between instructor and group members)
router.get("/comments/:groupId", enforceGroupMembership, getGroupComments);
router.get("/export/:groupId", enforceGroupMembership, exportGroupDataCsv);

export default router;
