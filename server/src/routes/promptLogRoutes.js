import express from "express";
import {
  getPromptLogs,
  verifyGroupChain,
  addNoteVersion
} from "../controllers/promptLogController.js";
import { protect, enforceGroupMembership } from "../middleware/auth.js";

const router = express.Router();

// All prompt log routes require authentication
router.use(protect);

// Read-only prompt logs (group-scoped)
router.get("/", getPromptLogs);

// Cryptographic hash chain verification
router.get("/verify-chain/:groupId", enforceGroupMembership, verifyGroupChain);

// Append-only student note update (creates a versioned log entry; no mutation)
router.post("/notes", addNoteVersion);

export default router;
