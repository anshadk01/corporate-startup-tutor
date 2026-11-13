/**
 * Official ENT 3805 Syllabus & Course Handout Data
 * BML Munjal University | School of Engineering & Technology (SOET)
 * Faculty: Prof. Kulbir Lamba (kulbir.lamba@bmu.edu.in)
 */

export interface CourseSession {
  sessionNumber: number;
  title: string;
  courseOutcome: string;
  bloomsLevel: string;
  preRead?: string;
  pedagogy: string;
  keyTopics: string[];
}

export const COURSE_FACULTY = {
  name: "Prof. Kulbir Lamba",
  email: "kulbir.lamba@bmu.edu.in",
  title: "Faculty & Deep-Tech Entrepreneurship Scholar",
  institution: "Institute of Innovation and Entrepreneurship, BML Munjal University",
  bio: "15+ years experience spanning deep-tech industry, incubation leadership at IIT Jodhpur & IIIT-Delhi, MBA from IIT Delhi, PhD candidate at IIT Jodhpur on technology commercialization. Teaching cases for Ivey Publishing."
};

export const COURSE_EVALUATION_COMPONENTS = [
  {
    name: "Individual Participation & Reflective Learning",
    weight: "20%",
    timeline: "Continuous Assessment",
    cos: "CO 1, 2",
    description: "Constructive contribution in class discussions, case studies, and attending outside startup/corporate events."
  },
  {
    name: "Corporate Startup Tutor (This AI Tutor System)",
    weight: "20%",
    timeline: "Continuous Assessment",
    cos: "CO 1, 2, 3",
    description: "Exactly two tasks: (1) create a short class reflection after every session, (2) curate corporate-startup collaboration news once every fortnight. Visible prompt log for instructor."
  },
  {
    name: "Industry Undercurrents: Where is the money?",
    weight: "20%",
    timeline: "2nd Half of October",
    cos: "CO 1, 2",
    description: "Select 5 companies from GCV Powerlist 2025; analyze 2 deals from 2025 across 2 different companies. Submit 2-page writeup with final comparison table."
  },
  {
    name: "End Term Field Project (Group Field Immersion)",
    weight: "40%",
    timeline: "2nd / 3rd Week of Nov",
    cos: "CO 1, 2, 3",
    description: "Field interaction with an Indian startup or corporate partnership (more than client-vendor). Real interviews, notes, photos, and partner gain analysis."
  }
];

export const OFFICIAL_SESSIONS: CourseSession[] = [
  {
    sessionNumber: 1,
    title: "Setting the Context: Sources of Innovation & Open Innovation",
    courseOutcome: "CO 1",
    bloomsLevel: "BL-2 (Comprehension)",
    pedagogy: "Discussion & Lecture",
    keyTopics: [
      "Course Outline & Learning Objectives",
      "Sources of Innovation & Evolution of Corporate R&D",
      "Concept of Open Innovation (Outside-In vs Inside-Out)"
    ]
  },
  {
    sessionNumber: 2,
    title: "Understanding the Two Sides of a Coin: Corporates vs. Startups",
    courseOutcome: "CO 1",
    bloomsLevel: "BL-2 (Comprehension)",
    preRead: "Big Companies Should Collaborate with Startups (Yoon & Hughes, HBR)",
    pedagogy: "Discussion, Lecture, Live Examples, Class Activity",
    keyTopics: [
      "Corporate-Startup Paradox & Innovation Asymmetry",
      "POC Speed vs Manufacturing & Distribution Scale",
      "Preventing Bureaucratic 'Organ Rejection'"
    ]
  },
  {
    sessionNumber: 3,
    title: "Models of Collaboration: Accelerators, CVCs & Co-Innovation",
    courseOutcome: "CO 1, 2",
    bloomsLevel: "BL-4 (Analysis)",
    pedagogy: "Case, Article and Video Discussion; Group Exercise; Flipped Classroom",
    keyTopics: [
      "Accelerators & Incubators",
      "Corporate Venture Capital (CVC) Strategic vs Financial Objectives",
      "Co-Innovation Labs & Strategic Equity Partnerships"
    ]
  },
  {
    sessionNumber: 4,
    title: "Guest Interaction: Incubation & Corporate Accelerator Leaders",
    courseOutcome: "CO 1, 2",
    bloomsLevel: "BL-4 (Analysis)",
    pedagogy: "Guest Lecture & Interactive Q&A",
    keyTopics: [
      "Practitioner insights from corporate startup accelerators",
      "Structuring cohorts, mentorship, and POC milestones",
      "Transitioning from pilot to enterprise procurement"
    ]
  },
  {
    sessionNumber: 5,
    title: "Case Discussion: Carlsberg and the Green Fiber Bottle",
    courseOutcome: "CO 1, 2",
    bloomsLevel: "BL-4 (Analysis)",
    preRead: "Sustainability Through Open Innovation: Carlsberg and the Green Fiber Bottle",
    pedagogy: "Case Analysis & Plenary Discussion",
    keyTopics: [
      "Open Innovation Consortiums for Sustainable Packaging",
      "Corporate Brand Owner partnering with deep-tech startup (Paboco)",
      "IP Sharing, Risk Allocation, and Industry Standards"
    ]
  },
  {
    sessionNumber: 6,
    title: "Group Progress Review (Opportunity Mapping & Field Selection)",
    courseOutcome: "CO 1, 2",
    bloomsLevel: "BL-4 (Analysis)",
    pedagogy: "Group Presentations & Faculty Critique",
    keyTopics: [
      "Mid-term progress on Field Immersion project",
      "Selecting target Indian corporate-startup partnerships",
      "Establishing initial outreach and interview protocols"
    ]
  },
  {
    sessionNumber: 7,
    title: "Corporate Incubation Programs & GCCs as Engines of Innovation",
    courseOutcome: "CO 1, 2",
    bloomsLevel: "BL-4 (Analysis)",
    preRead: "Discussion on Maruti Suzuki Incubation Program for Startups (MISA)",
    pedagogy: "Case Scenario & Flipped Classroom",
    keyTopics: [
      "How corporates design specialized incubation programs",
      "Maruti Suzuki Incubation Program for Startups (MISA)",
      "Global Capability Centers (GCCs) in India partnering with startups"
    ]
  },
  {
    sessionNumber: 8,
    title: "Aligning Goals and Value Creation: Corporate KPIs vs. Startup Agility",
    courseOutcome: "CO 1, 2",
    bloomsLevel: "BL-4 (Analysis)",
    preRead: "Is Corporate Venture Capital Right for Your Startup?",
    pedagogy: "Framework Mapping & Case Debate",
    keyTopics: [
      "Reconciling differing objectives (quarterly EBITDA vs rapid valuation growth)",
      "Mapping value propositions and partnership KPIs",
      "Governance, board seats, and signaling effects of CVC"
    ]
  },
  {
    sessionNumber: 9,
    title: "Industry Talk: Startup Founder / Corporate Innovation Leader",
    courseOutcome: "CO 1, 2",
    bloomsLevel: "BL-4 (Analysis)",
    pedagogy: "Practitioner Keynote & Fireside Chat",
    keyTopics: [
      "Real-world lessons from scaling corporate partnerships",
      "Overcoming procurement roadblocks and slow contract cycles",
      "Balancing startup autonomy with corporate compliance"
    ]
  },
  {
    sessionNumber: 10,
    title: "Legal, IP, and Regulatory Challenges in India",
    courseOutcome: "CO 1, 2",
    bloomsLevel: "BL-4 (Analysis)",
    pedagogy: "Legal Case Scenarios & Risk Mitigation Workshop",
    keyTopics: [
      "Background IP vs Foreground IP ownership",
      "Exclusivity clauses, non-competes, and ROFR (Right of First Refusal)",
      "Indian regulatory frameworks for cross-border investments and data privacy"
    ]
  },
  {
    sessionNumber: 11,
    title: "Cultural and Operational Differences: Bridging the Divide",
    courseOutcome: "CO 1, 2",
    bloomsLevel: "BL-4 (Analysis)",
    pedagogy: "Simulated Role-Play & Case Vignettes",
    keyTopics: [
      "Decision-making cadence: Startup weeks vs corporate quarters",
      "Risk appetite and failure tolerance differences",
      "Appointing internal corporate champions and liaison buffers"
    ]
  },
  {
    sessionNumber: 12,
    title: "Ecosystem Platforms: TCS COIN & HCL Technologies Innovation Platform",
    courseOutcome: "CO 1, 2",
    bloomsLevel: "BL-4 (Analysis)",
    preRead: "Cases on TCS Co-Innovation Network (COIN) & HCL Technologies Ecosystem Platform",
    pedagogy: "Platform Architecture Case Study",
    keyTopics: [
      "How incubators and accelerators orchestrate ecosystem synergies",
      "Digital platforms enabling scalable, repeatable co-innovation",
      "Multi-sided partner networks (enterprises, startups, universities, VCs)"
    ]
  },
  {
    sessionNumber: 13,
    title: "How to Make the Relationship Work: Avoiding Post-Pilot Pitfalls",
    courseOutcome: "CO 1, 2",
    bloomsLevel: "BL-4 (Analysis)",
    preRead: "After the Honeymoon Ends: Making Corporate-Startup Relationships Work",
    pedagogy: "Synthesis Discussion & Best Practice Codification",
    keyTopics: [
      "Overcoming the 'pilot purgatory' trap",
      "Institutionalizing ongoing collaboration beyond executive champions",
      "Measuring long-term strategic and financial ROI"
    ]
  }
];
