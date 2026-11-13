export type UserRole = "STUDENT" | "INSTRUCTOR";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  groupId?: Group | string;
  rollNumber?: string;
  isDemo?: boolean;
  createdAt?: string;
}

export interface Group {
  _id: string;
  name: string;
  tutorName: string;
  description: string;
  memberIds: (User | string)[];
  instructorId?: User | string;
  createdAt?: string;
  stats?: {
    reflections: number;
    news: number;
    promptLogs: number;
    completionPercentage: number;
  };
}

export interface Reflection {
  _id: string;
  groupId: Group | string;
  sessionNumber: number;
  sessionTitle: string;
  classDate: string;
  studentInput: string;
  keyPoints: string[];
  openQuestion: string;
  noneOutstanding?: boolean;
  studentNotes: string;
  authorId?: {
    _id: string;
    name: string;
    email: string;
    rollNumber?: string;
  };
  createdBy?: {
    _id: string;
    name: string;
    email: string;
    rollNumber?: string;
  };
  promptLogId?: string;
  createdAt: string;
  updatedAt?: string;
}

export type CollaborationType =
  | "Corporate Venture Capital"
  | "Accelerator / Incubator"
  | "Co-Innovation Lab"
  | "Strategic Alliance"
  | "Startup Acquisition"
  | "Global Capability Center"
  | "Commercial Pilot / POC"
  | "Technology Integration"
  | "Outside-In Program"
  | "Inside-Out Platform Program";

export type NewsSourceType =
  | "LinkedIn Post"
  | "Company Announcement"
  | "Startup Announcement"
  | "Industry/VC Media";

export interface FortnightCycle {
  _id: string;
  cycleNumber: number;
  title: string;
  startDate: string;
  endDate: string;
  dueDate: string;
  isMissed: boolean;
  description?: string;
}

export interface NewsItem {
  _id: string;
  groupId: Group | string;
  headline: string;
  company: string;
  startupPartner: string;
  date: string;
  source: string;
  sourceType: NewsSourceType;
  sourceUrl: string;
  sourceExcerpt: string;
  retrievedAt?: string;
  summary: string;
  whyItMatters: string;
  collaborationType: CollaborationType;
  fortnightCycleId?: FortnightCycle | string;
  verifiedByStudent?: boolean;
  studentNotes: string;
  isAiGenerated: boolean;
  authorId?: {
    _id: string;
    name: string;
    email: string;
    rollNumber?: string;
  };
  createdBy?: {
    _id: string;
    name: string;
    email: string;
    rollNumber?: string;
  };
  promptLogId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PromptLog {
  _id: string;
  groupId: {
    _id: string;
    name: string;
    tutorName?: string;
  };
  authorId?: {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
    rollNumber?: string;
  };
  userId?: {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
    rollNumber?: string;
  };
  feature: "CLASS_REFLECTION" | "FORTNIGHTLY_NEWS";
  prompt: string;
  aiResponse: any;
  modelName?: string;
  modelVersion?: string;
  studentNotes?: string;
  sequenceNumber?: number;
  previousHash?: string;
  hash?: string;
  isEdit?: boolean;
  parentLogId?: string;
  editSummary?: string;
  timestamp?: string;
  createdAt?: string;
}

export interface InstructorComment {
  _id: string;
  groupId: string;
  authorId: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  targetType: "REFLECTION" | "NEWS" | "PROMPT_LOG" | "WORKSPACE";
  targetId?: string;
  comment: string;
  isInstructorFeedback: boolean;
  createdAt: string;
}

export interface SessionCoverageItem {
  sessionNumber: number;
  completed: boolean;
  classDate?: string | null;
  authorName?: string | null;
}

export interface GroupAnalytics {
  id: string;
  name: string;
  tutorName: string;
  memberCount: number;
  members: User[];
  reflectionsCompleted: number;
  totalExpectedSessions: number;
  completionRate: number;
  sessionCoverage?: SessionCoverageItem[];
  newsCount: number;
  promptLogCount: number;
  lastActiveSession: string;
}

export interface InstructorDashboardData {
  summary: {
    totalGroups: number;
    totalStudents: number;
    totalReflections: number;
    totalNews: number;
    totalPromptLogs: number;
    courseName: string;
    institution: string;
  };
  groups: GroupAnalytics[];
  recentActivity: PromptLog[];
}
