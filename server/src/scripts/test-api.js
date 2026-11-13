import http from "http";
import mongoose from "mongoose";
import app from "../app.js";
import { connectDB } from "../config/db.js";
import { seedDatabase } from "./seed.js";
import PromptLog, { calculateLogHash } from "../models/PromptLog.js";
import User from "../models/User.js";
import Group from "../models/Group.js";
import Reflection from "../models/Reflection.js";

let server;
let BASE_URL = "";

const request = (path, method = "GET", body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };
    if (token) {
      options.headers["Authorization"] = `Bearer ${token}`;
    }

    const req = http.request(url, options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json, raw: data });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data, data: null });
        }
      });
    });

    req.on("error", reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

async function runTestSuite() {
  console.log("==================================================");
  console.log(" ENT 3805 Backend Verification Suite (Phase 1)   ");
  console.log("==================================================");

  await connectDB();
  await seedDatabase();

  // Start test server on ephemeral port
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      BASE_URL = `http://localhost:${port}`;
      console.log(`[Test Suite] Ephemeral test server active on ${BASE_URL}`);
      resolve();
    });
  });

  try {
    // 1. Authenticate Demo Personas
    const student1Login = await request("/api/auth/login", "POST", {
      email: "alex.demo@university.edu",
      password: "Password123!"
    });
    if (student1Login.status !== 200) throw new Error("Student 1 login failed");
    const student1Token = student1Login.data.token;
    const student1Group = student1Login.data.user.groupId?._id || student1Login.data.user.groupId;

    const student2Login = await request("/api/auth/login", "POST", {
      email: "morgan.demo@university.edu",
      password: "Password123!"
    });
    if (student2Login.status !== 200) throw new Error("Student 2 login failed");
    const student2Token = student2Login.data.token;
    const student2Group = student2Login.data.user.groupId?._id || student2Login.data.user.groupId;

    const instructorLogin = await request("/api/auth/login", "POST", {
      email: "instructor.demo@university.edu",
      password: "Password123!"
    });
    if (instructorLogin.status !== 200) throw new Error("Instructor login failed");
    const instructorToken = instructorLogin.data.token;

    console.log("[PASS] 1. Auth & Token Issuance: Student 1 (Group 1), Student 2 (Group 2), Instructor authenticated.");

    // 2. Test: Student cannot read another group (Group Isolation)
    const crossGroupReflection = await request(`/api/reflections?groupId=${student2Group}`, "GET", null, student1Token);
    // Student 1 querying with query param should only receive Group 1's reflections, never Group 2's
    const group2Reflections = crossGroupReflection.data.filter(r => r.groupId?._id?.toString() === student2Group.toString());
    if (group2Reflections.length > 0) {
      throw new Error("FAIL: Student 1 was able to access Group 2 reflections!");
    }

    // Direct access to group 2 endpoint
    const crossGroupChain = await request(`/api/prompt-logs/verify-chain/${student2Group}`, "GET", null, student1Token);
    if (crossGroupChain.status !== 403) {
      throw new Error(`FAIL: Student 1 should be forbidden (403) from verifying Group 2 chain, got ${crossGroupChain.status}`);
    }
    console.log("[PASS] 2. Group Isolation: Student cannot query or verify another group's workspace/logs (HTTP 403).");

    // 3. Test: Student cannot delete or edit a prompt log entry (Append-only enforcement)
    const anyLog = await PromptLog.findOne({ groupId: student1Group });
    if (!anyLog) throw new Error("No prompt log found for testing append-only");

    const putAttempt = await request(`/api/prompt-logs/${anyLog._id}`, "PUT", { prompt: "Hacked Prompt" }, student1Token);
    const deleteAttempt = await request(`/api/prompt-logs/${anyLog._id}`, "DELETE", null, student1Token);
    
    // In Express, routes without PUT/DELETE will return 404
    if (putAttempt.status !== 404 && putAttempt.status !== 405 && putAttempt.status !== 403) {
      throw new Error(`FAIL: PUT on prompt log returned unexpected status ${putAttempt.status}`);
    }
    if (deleteAttempt.status !== 404 && deleteAttempt.status !== 405 && deleteAttempt.status !== 403) {
      throw new Error(`FAIL: DELETE on prompt log returned unexpected status ${deleteAttempt.status}`);
    }
    console.log(`[PASS] 3. Append-Only Prompt Log: PUT and DELETE routes are strictly blocked (HTTP ${putAttempt.status}/${deleteAttempt.status}).`);

    // 4. Test: Instructor cannot modify student content (Read-only enforcement)
    const instructorCreateRef = await request("/api/reflections", "POST", {
      sessionNumber: 5,
      sessionTitle: "Unauthorized Instructor Reflection",
      classDate: "2026-09-01",
      studentInput: "Instructor writing notes directly",
      keyPoints: ["Point 1"],
      openQuestion: "Should instructor be able to write this?"
    }, instructorToken);

    if (instructorCreateRef.status !== 403) {
      throw new Error(`FAIL: Instructor was not blocked from creating student reflection (got status ${instructorCreateRef.status})`);
    }

    const instructorCreateNews = await request("/api/news", "POST", {
      headline: "Unauthorized Instructor News",
      company: "Company",
      startupPartner: "Startup",
      sourceUrl: "https://example.com",
      sourceExcerpt: "Source text here with sufficient characters for validation.",
      summary: "Summary text",
      whyItMatters: "Why it matters"
    }, instructorToken);

    if (instructorCreateNews.status !== 403) {
      throw new Error(`FAIL: Instructor was not blocked from creating student news (got status ${instructorCreateNews.status})`);
    }
    console.log("[PASS] 4. Instructor Read-Only Role: Instructor blocked from creating/mutating student reflections and news (HTTP 403).");

    // 5. Test: openQuestion validator accepts a single question and rejects multiple
    const multiQuestionAttempt = await request("/api/reflections", "POST", {
      sessionNumber: 4,
      sessionTitle: "Session 4 Testing Question Validator",
      classDate: "2026-08-25",
      studentInput: "Detailed discussion on corporate accelerators and POC validation frameworks.",
      keyPoints: ["Accelerators accelerate testing cycles.", "Corporates provide sandbox scale."],
      openQuestion: "How do we evaluate the pilot? And when should we invest?" // Multiple questions!
    }, student1Token);

    if (multiQuestionAttempt.status !== 400) {
      throw new Error(`FAIL: openQuestion validator allowed multiple questions! Got status ${multiQuestionAttempt.status}`);
    }

    // Valid single question
    const singleQuestionAttempt = await request("/api/reflections", "POST", {
      sessionNumber: 4,
      sessionTitle: "Session 4 Testing Question Validator",
      classDate: "2026-08-25",
      studentInput: "Detailed discussion on corporate accelerators and POC validation frameworks.",
      keyPoints: ["Accelerators accelerate testing cycles.", "Corporates provide sandbox scale."],
      openQuestion: "How do we evaluate pilot success metrics before commercial deployment?" // Single question!
    }, student1Token);

    if (singleQuestionAttempt.status !== 201) {
      throw new Error(`FAIL: Single question reflection failed to save! Status: ${singleQuestionAttempt.status}, err: ${JSON.stringify(singleQuestionAttempt.data)}`);
    }
    console.log("[PASS] 5. openQuestion Validator: Successfully rejected multiple questions (HTTP 400) and accepted single question (HTTP 201).");

    // 6. Test: Tamper-check detects a modified hash
    const initialAudit = await PromptLog.verifyChain(student1Group);
    if (!initialAudit.valid) {
      throw new Error(`FAIL: Initial prompt log chain is invalid: ${initialAudit.reason}`);
    }

    // Intentionally tamper with a stored prompt log's prompt content directly in the database
    let targetLog = await PromptLog.findOne({ groupId: student1Group, sequenceNumber: 2 });
    if (!targetLog) {
      targetLog = await PromptLog.findOne({ groupId: student1Group });
    }
    const originalPrompt = targetLog.prompt;
    targetLog.prompt = "[MALICIOUS TAMPER] Injected unauthorized modification without updating hash";
    await targetLog.save();

    const tamperedAudit = await PromptLog.verifyChain(student1Group);
    if (tamperedAudit.valid) {
      throw new Error("FAIL: Tamper detection failed! Chain reported valid after malicious modification.");
    }
    if (tamperedAudit.tamperedAtSequence !== targetLog.sequenceNumber) {
      throw new Error(`FAIL: Tamper detection reported wrong sequence. Expected ${targetLog.sequenceNumber}, got ${tamperedAudit.tamperedAtSequence}`);
    }

    // Restore original prompt and verify it passes again
    targetLog.prompt = originalPrompt;
    await targetLog.save();

    const restoredAudit = await PromptLog.verifyChain(student1Group);
    if (!restoredAudit.valid) {
      throw new Error("FAIL: Restored chain should be valid.");
    }
    console.log(`[PASS] 6. Cryptographic Tamper-Check: Correctly flagged tamper at sequence #${tamperedAudit.tamperedAtSequence}: "${tamperedAudit.reason}"`);

    // 7. Test: 1-Click CSV Export for Instructor
    const exportRes = await request(`/api/instructor/export/${student1Group}`, "GET", null, instructorToken);
    if (exportRes.status !== 200 || !exportRes.raw || !exportRes.raw.includes("Seq#,Feature,Author Name")) {
      throw new Error(`FAIL: Instructor CSV export did not return formatted CSV data. Status: ${exportRes.status}, Data: ${JSON.stringify(exportRes.data || exportRes.raw)}`);
    }
    console.log("[PASS] 7. Academic CSV Export: Generated compliant prompt-response-note audit CSV for instructor.");

    console.log("==================================================");
    console.log(" ALL PHASE 1 BACKEND SPEC TESTS PASSED (7/7)      ");
    console.log("==================================================");
  } finally {
    if (server) {
      server.close();
    }
  }
}

runTestSuite().catch((err) => {
  console.error("Test Suite Execution Failed:", err);
  process.exit(1);
});
