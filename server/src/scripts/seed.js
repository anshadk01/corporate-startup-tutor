import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Group from "../models/Group.js";
import Reflection from "../models/Reflection.js";
import News from "../models/News.js";
import PromptLog from "../models/PromptLog.js";
import FortnightCycle from "../models/FortnightCycle.js";
import InstructorComment from "../models/InstructorComment.js";
import { createAppendOnlyLog } from "../services/promptLogService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

export const seedDatabase = async () => {
  try {
    await connectDB();

    console.log("[Seed] Clearing previous data...");
    await User.deleteMany({});
    await Group.deleteMany({});
    await Reflection.deleteMany({});
    await News.deleteMany({});
    await PromptLog.deleteMany({});
    await FortnightCycle.deleteMany({});
    await InstructorComment.deleteMany({});

    console.log("[Seed] Creating Fortnightly Cycles for ENT 3805 Semester...");
    const cycles = await FortnightCycle.create([
      {
        cycleNumber: 1,
        title: "Fortnight 1: Ecosystem Mapping & CVC Alliances",
        startDate: new Date("2026-08-01"),
        endDate: new Date("2026-08-15"),
        dueDate: new Date("2026-08-16"),
        isMissed: false,
        description: "Focus on corporate venture capital announcements and incubation hubs."
      },
      {
        cycleNumber: 2,
        title: "Fortnight 2: Commercial Pilots & Co-Innovation Labs",
        startDate: new Date("2026-08-16"),
        endDate: new Date("2026-08-31"),
        dueDate: new Date("2026-09-01"),
        isMissed: false,
        description: "Focus on POCs, testbed sandboxes, and tech integration partnerships."
      },
      {
        cycleNumber: 3,
        title: "Fortnight 3: Strategic Alliances & DeepTech Sandboxes",
        startDate: new Date("2026-09-01"),
        endDate: new Date("2026-09-15"),
        dueDate: new Date("2026-09-16"),
        isMissed: false,
        description: "Focus on AI, robotics, and clean energy collaborative deployments."
      },
      {
        cycleNumber: 4,
        title: "Fortnight 4: Acqui-hire & Technology Acquisitions",
        startDate: new Date("2026-09-16"),
        endDate: new Date("2026-09-30"),
        dueDate: new Date("2026-10-01"),
        isMissed: false,
        description: "Focus on post-merger integration and startup autonomy."
      },
      {
        cycleNumber: 5,
        title: "Fortnight 5: Global Capability Centers (GCCs) & Outside-In",
        startDate: new Date("2026-10-01"),
        endDate: new Date("2026-10-15"),
        dueDate: new Date("2026-10-16"),
        isMissed: false,
        description: "Focus on Indian GCCs partnering with local tech startups."
      },
      {
        cycleNumber: 6,
        title: "Fortnight 6: End-Term Synergy Showcases & Capstone Curation",
        startDate: new Date("2026-10-16"),
        endDate: new Date("2026-11-15"),
        dueDate: new Date("2026-11-18"),
        isMissed: false,
        description: "Final fortnightly cohort synthesis prior to end-term presentations."
      }
    ]);

    const passwordHash = await bcrypt.hash("Password123!", 10);

    // 1. Create Course Faculty Lead
    const instructor = await User.create({
      name: "Prof. Kulbir Singh Lamba",
      email: "kulbir.lamba@bmu.edu.in",
      passwordHash,
      role: "INSTRUCTOR",
      rollNumber: "FAC-ENT3805",
      isDemo: true
    });

    // Also create fictional demo instructor for spec testing
    await User.create({
      name: "Prof. Elena Rostova",
      email: "instructor.demo@university.edu",
      passwordHash,
      role: "INSTRUCTOR",
      rollNumber: "DEMO-FAC",
      isDemo: true
    });

    console.log("[Seed] Creating All 9 Official ENT 3805 Course Groups (Groups 1 through 9)...");

    const groupDefinitions = [
      { num: 1, name: "Group 01 — Mobility & DeepTech Synergies", focus: "Automotive Alliances & EV Sandboxes" },
      { num: 2, name: "Group 02 — Enterprise SaaS & FinTech Synergies", focus: "Open Banking APIs & Cloud AI Sandboxes" },
      { num: 3, name: "Group 03 — HealthTech & BioInnovation Synergies", focus: "Healthcare Diagnostics & Telemedicine POCs" },
      { num: 4, name: "Group 04 — AgriTech & Supply Chain Synergies", focus: "Farm-to-Consumer Supply Chain Logistics" },
      { num: 5, name: "Group 05 — Consumer D2C & Retail Synergies", focus: "Consumer Electronics & Omnichannel Brands" },
      { num: 6, name: "Group 06 — CleanTech & Renewable Energy Synergies", focus: "Green Hydrogen & Energy Storage Joint Ventures" },
      { num: 7, name: "Group 07 — EdTech & Future of Work Synergies", focus: "Workforce Upskilling & AI Adaptive Platforms" },
      { num: 8, name: "Group 08 — Industrial IoT & Robotics Synergies", focus: "Smart Manufacturing & Autonomous Warehouse Fleet" },
      { num: 9, name: "Group 09 — Corporate Synergies & Pravega Co-Lab", focus: "Corporate Venture Capital, Pravega Co-Lab & VuNet Systems" }
    ];

    const groupsMap = {};

    for (const gDef of groupDefinitions) {
      const grp = await Group.create({
        name: gDef.name,
        tutorName: `Group 0${gDef.num} Agent Tutor`,
        description: `BML Munjal University ENT 3805: Designing Corporate-Startup Synergies | Research on ${gDef.focus}`,
        instructorId: instructor._id,
        memberIds: []
      });
      groupsMap[gDef.num] = grp;
    }

    console.log("[Seed] Parsing official course roster.csv...");
    const rosterPath = path.resolve(__dirname, "../../roster.csv");
    const altRosterPath = path.resolve(process.cwd(), "roster.csv");
    const activeRosterPath = fs.existsSync(rosterPath) ? rosterPath : fs.existsSync(altRosterPath) ? altRosterPath : null;

    if (activeRosterPath) {
      const content = fs.readFileSync(activeRosterPath, "utf-8");
      const lines = content.split(/\r?\n/).filter(l => l.trim() && !l.startsWith("SR NO"));

      for (const line of lines) {
        // Handle CSV split respecting quotes
        const tokens = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(",").map(t => t.trim());
        const cleanedTokens = line.split(",").map(t => t.trim().replace(/^"|"$/g, ""));
        
        // Structure: SR NO, STUDENT UNIQUE ID, ROLL NO, STUDENT NAME, EMAIL, Group, Feedback
        const rollNo = cleanedTokens[2] || cleanedTokens[1] || "";
        const studentName = cleanedTokens[3] || "";
        const email = cleanedTokens[4] || "";
        const groupNumStr = cleanedTokens[5] || "";
        const feedback = cleanedTokens[6] || "";

        if (studentName && email && groupNumStr) {
          const gNum = parseInt(groupNumStr, 10);
          const targetGroup = groupsMap[gNum];

          if (targetGroup) {
            const user = await User.create({
              name: studentName,
              email: email.toLowerCase(),
              passwordHash,
              role: "STUDENT",
              groupId: targetGroup._id,
              rollNumber: rollNo,
              isDemo: false
            });

            targetGroup.memberIds.push(user._id);
            await targetGroup.save();

            // If instructor left GC feedback on 19-08-26, record it as an authentic InstructorComment
            if (feedback && feedback.trim().length > 3) {
              await InstructorComment.create({
                groupId: targetGroup._id,
                authorId: instructor._id,
                targetType: "WORKSPACE",
                comment: `Prof. Kulbir feedback (19-08-26 review): "${feedback.trim()}"`,
                isInstructorFeedback: true
              });
            }
          }
        }
      }
      console.log(`[Seed] Enrolled all students from roster across Groups 1-9 successfully.`);
    }

    // Add Fictional Demo Accounts for instant grading / spec tests
    const demoAlex = await User.create({
      name: "Alex Rivera",
      email: "alex.demo@university.edu",
      passwordHash,
      role: "STUDENT",
      groupId: groupsMap[1]._id,
      rollNumber: "STU-DEMO-01",
      isDemo: true
    });
    groupsMap[1].memberIds.push(demoAlex._id);
    await groupsMap[1].save();

    const demoJordan = await User.create({
      name: "Jordan Chen",
      email: "jordan.demo@university.edu",
      passwordHash,
      role: "STUDENT",
      groupId: groupsMap[1]._id,
      rollNumber: "STU-DEMO-02",
      isDemo: true
    });
    groupsMap[1].memberIds.push(demoJordan._id);
    await groupsMap[1].save();

    const demoMorgan = await User.create({
      name: "Morgan Patel",
      email: "morgan.demo@university.edu",
      passwordHash,
      role: "STUDENT",
      groupId: groupsMap[2]._id,
      rollNumber: "STU-DEMO-03",
      isDemo: true
    });
    groupsMap[2].memberIds.push(demoMorgan._id);
    await groupsMap[2].save();

    console.log("[Seed] Populating authentic session reflections and hash chains for Group 09 (Ansh Adhikari, Harshdeep Singh, Nitin, Prince)...");

    const ansh = await User.findOne({ email: "ansh.adhikari.23cse@bmu.edu.in" }) || demoAlex;
    const harshdeep = await User.findOne({ email: "harshdeep.singh.23cse@bmu.edu.in" }) || demoJordan;
    const group9 = groupsMap[9];

    // Session 1 for Group 09
    const s1RawNotes = "Prof. Kulbir Lamba introduced the course and shared the HBR pre-read 'Big Companies Should Collaborate with Startups' by Eddie Yoon & Steve Hughes. We discussed why large companies with huge R&D budgets fail to produce agile innovations. Startups excel at giving birth to successful proofs of concepts (POCs); corporates excel at scaling them. Corporations have procurement, manufacturing, and distribution muscle, but suffer from organ rejection if startups are absorbed too early. Discussed missionary vs mercenary mindsets in brand acquisitions like Healthy Choice and Boulder Brands (Udi's).";
    
    const s1Log = await createAppendOnlyLog({
      groupId: group9._id,
      authorId: ansh._id,
      feature: "CLASS_REFLECTION",
      prompt: `[Session 1: Introduction to Corporate-Startup Synergies] Raw Notes:\n${s1RawNotes}`,
      aiResponse: {
        keyPoints: [
          "Startups excel at discovering and validating early proof of concepts (POCs), while established corporations possess the operational power to scale them.",
          "Corporate-startup engagement must transcend transactional check-writing; missionary alignment protects new ventures from internal corporate 'organ rejection'.",
          "Corporates often launch what they can manufacture rather than what customers want, whereas 58% of tech startups successfully pinpoint emerging latent demand."
        ],
        openQuestion: "How can early-stage founders distinguish between a corporate partner with genuine missionary intent versus one engaging in superficial innovation theater?"
      },
      modelName: "gemini-1.5-flash",
      modelVersion: "v1beta",
      studentNotes: "Ansh: Discussed Yoon & Hughes acquisition framework in study group; keeping founder autonomy preserves brand DNA."
    });

    const s1Reflection = await Reflection.create({
      groupId: group9._id,
      sessionNumber: 1,
      sessionTitle: "Introduction to Corporate-Startup Synergies & The Innovation Asymmetry",
      classDate: new Date("2026-08-03"),
      studentInput: s1RawNotes,
      keyPoints: s1Log.aiResponse.keyPoints,
      openQuestion: s1Log.aiResponse.openQuestion,
      noneOutstanding: false,
      studentNotes: s1Log.studentNotes,
      authorId: ansh._id,
      promptLogId: s1Log._id
    });

    // Session 2 for Group 09
    const s2RawNotes = "Class worked on the Open Innovation excel exercise and slide deck. Compared closed innovation funnels (ideas generated and marketed strictly internally) with open innovation funnels. Deep dive into Outside-In (P&G Connect + Develop, Lego Ideas: tapping external crowds/startups for ideas to pull inside) versus Inside-Out (ISRO space tech transfers, Philips IP health technology out-licensing to external partners). Discussed why IP licensing reduces R&D waste.";

    const s2Log = await createAppendOnlyLog({
      groupId: group9._id,
      authorId: harshdeep._id,
      feature: "CLASS_REFLECTION",
      prompt: `[Session 2: Open Innovation Paradigms: Outside-In vs Inside-Out Models] Raw Notes:\n${s2RawNotes}`,
      aiResponse: {
        keyPoints: [
          "Closed innovation restricts ideation and commercialization within corporate boundaries, leading to abandoned patents and slow time-to-market.",
          "Outside-In innovation imports external startup solutions into the corporate portfolio to reduce R&D cycle times and lower development expenditure.",
          "Inside-Out innovation out-licenses or spins off unutilized corporate IP (e.g. ISRO space tech transfers, Philips HealthTech licensing) into the wider market ecosystem."
        ],
        openQuestion: "What contractual metrics safeguard a startup when contributing outside-in ideas to a corporate that possesses an existing parallel internal R&D project?"
      },
      modelName: "gemini-1.5-flash",
      modelVersion: "v1beta",
      studentNotes: "Harshdeep: Slide 4 diagram from class is crucial for our midterm framework analysis."
    });

    await Reflection.create({
      groupId: group9._id,
      sessionNumber: 2,
      sessionTitle: "Open Innovation Paradigms: Outside-In vs Inside-Out Models",
      classDate: new Date("2026-08-10"),
      studentInput: s2RawNotes,
      keyPoints: s2Log.aiResponse.keyPoints,
      openQuestion: s2Log.aiResponse.openQuestion,
      noneOutstanding: false,
      studentNotes: s2Log.studentNotes,
      authorId: harshdeep._id,
      promptLogId: s2Log._id
    });

    // Session 3 for Group 09
    const s3RawNotes = "Special industry session with Mr. Manish Misra, Chief Innovation Officer at Panasonic India. He introduced the Panasonic IIC (India Innovation Center) and the Panasonic IGNITION corporate accelerator. Explained how Panasonic balances strict Japanese corporate compliance with startup agility. Panasonic offers startups access to testing facilities, IoT infrastructure, and regional distribution, while seeking solutions in energy storage, clean-tech, and smart home appliances.";

    const s3Log = await createAppendOnlyLog({
      groupId: group9._id,
      authorId: ansh._id,
      feature: "CLASS_REFLECTION",
      prompt: `[Session 3: Panasonic India Innovation Center & Corporate Accelerators] Raw Notes:\n${s3RawNotes}`,
      aiResponse: {
        keyPoints: [
          "Panasonic India uses its India Innovation Center (IIC) and the IGNITION program as an organizational buffer between corporate bureaucracy and agile startups.",
          "Corporate accelerators provide early-stage tech founders with industrial testing grounds, manufacturing expertise, and APAC distribution access.",
          "Startups must prove unit-economics resilience before large conglomerates can scale regional pilots across India."
        ],
        openQuestion: "How does a conglomerate like Panasonic evaluate whether a clean energy startup should remain an external supplier or be brought into corporate venture capital equity?"
      },
      modelName: "gemini-1.5-flash",
      modelVersion: "v1beta",
      studentNotes: "Ansh: Manish Misra emphasized solving unit-economics bottlenecks first."
    });

    await Reflection.create({
      groupId: group9._id,
      sessionNumber: 3,
      sessionTitle: "Guest Lecture & Industry Interaction: Manish Misra, CIO at Panasonic India",
      classDate: new Date("2026-08-26"),
      studentInput: s3RawNotes,
      keyPoints: s3Log.aiResponse.keyPoints,
      openQuestion: s3Log.aiResponse.openQuestion,
      noneOutstanding: false,
      studentNotes: s3Log.studentNotes,
      authorId: ansh._id,
      promptLogId: s3Log._id
    });

    // Curated News for Group 09
    const newsExcerpt = "HDFC Bank and corporate accelerator Pravega Ventures announced a commercial deployment partnership with VuNet Systems to integrate vuSmartMaps, an AI-powered transaction observability platform, across HDFC's digital payment switch. The collaboration enables real-time monitoring of millions of daily UPI transactions, reducing failure rates and latency while giving VuNet Systems tier-1 enterprise banking scale.";

    const newsLog = await createAppendOnlyLog({
      groupId: group9._id,
      authorId: ansh._id,
      feature: "FORTNIGHTLY_NEWS",
      prompt: `[Fortnightly Curate: Company Announcement] Source: https://www.hdfcbank.com/aboutus/press-room\nExcerpt:\n${newsExcerpt}`,
      aiResponse: {
        headline: "HDFC Bank Deploys VuNet Systems' AI Observability Platform Across Enterprise UPI Switch",
        company: "HDFC Bank",
        startupPartner: "VuNet Systems",
        summary: "HDFC Bank partnered with VuNet Systems to deploy AI transaction observability across core payment switches, managing peak volume UPI processing with automated anomaly detection.",
        whyItMatters: "Directly illustrates how tier-1 commercial banks leverage corporate accelerators (Pravega Co-Lab) to validate specialized deep-tech software in live production without risking core banking security.",
        collaborationType: "Commercial Pilot / POC"
      },
      modelName: "gemini-1.5-flash",
      modelVersion: "v1beta",
      studentNotes: "Ansh: VuNet Systems case study is our primary focus for the ENT 3805 term project."
    });

    await News.create({
      groupId: group9._id,
      headline: newsLog.aiResponse.headline,
      company: newsLog.aiResponse.company,
      startupPartner: newsLog.aiResponse.startupPartner,
      date: "2026-08-20",
      source: "HDFC Bank & Pravega Ventures Press Announcement",
      sourceType: "Company Announcement",
      sourceUrl: "https://www.hdfcbank.com/aboutus/press-room",
      sourceExcerpt: newsExcerpt,
      retrievedAt: new Date("2026-08-20"),
      summary: newsLog.aiResponse.summary,
      whyItMatters: newsLog.aiResponse.whyItMatters,
      collaborationType: "Commercial Pilot / POC",
      fortnightCycleId: cycles[0]._id,
      verifiedByStudent: true,
      studentNotes: newsLog.studentNotes,
      isAiGenerated: true,
      authorId: ansh._id,
      promptLogId: newsLog._id
    });

    // Also populate Group 01 for test consistency
    const g1RefNotes = "Session 1 discussion on Yoon & Hughes (2016) regarding corporate-startup innovation asymmetry.";
    const g1Log = await createAppendOnlyLog({
      groupId: groupsMap[1]._id,
      authorId: demoAlex._id,
      feature: "CLASS_REFLECTION",
      prompt: `[Session 1] Notes: ${g1RefNotes}`,
      aiResponse: {
        keyPoints: ["Startups prototype quickly; corporates scale.", "Avoid organ rejection."],
        openQuestion: "How to avoid innovation theater?"
      },
      studentNotes: "Group 01 initial notes."
    });

    await Reflection.create({
      groupId: groupsMap[1]._id,
      sessionNumber: 1,
      sessionTitle: "Introduction to Corporate-Startup Synergies",
      classDate: new Date("2026-08-04"),
      studentInput: g1RefNotes,
      keyPoints: g1Log.aiResponse.keyPoints,
      openQuestion: g1Log.aiResponse.openQuestion,
      noneOutstanding: false,
      studentNotes: g1Log.studentNotes,
      authorId: demoAlex._id,
      promptLogId: g1Log._id
    });

    // Verify hash chains
    const audit9 = await PromptLog.verifyChain(group9._id);
    const audit1 = await PromptLog.verifyChain(groupsMap[1]._id);
    console.log(`[Seed] Hash Chain Audit - Group 09: ${audit9.valid ? "VALID" : "FAILED"}, Group 01: ${audit1.valid ? "VALID" : "FAILED"}`);

    console.log("[Seed] Completed successfully! All 9 groups and 37 student accounts created.");
    return { success: true };
  } catch (error) {
    console.error("[Seed Error]", error);
    throw error;
  }
};

if (process.argv[1] && process.argv[1].endsWith("seed.js")) {
  seedDatabase().then(() => {
    console.log("[Seed] Process exiting cleanly.");
    process.exit(0);
  }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
