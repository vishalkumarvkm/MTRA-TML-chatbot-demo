// HealthyME — Montefiore Tuition Reimbursement Agent
// Frontend TypeScript Types

export type ProgramType =
  | "TuitionReimbursement"
  | "CMEReimbursement"
  | "MMCScholarship"
  | "DependentTuition";

export type ApplicationStatus =
  | "Draft"
  | "Submitted"
  | "UnderReview"
  | "PendingApproval"
  | "Approved"
  | "Rejected"
  | "Escalated"
  | "Expired";

export type SlaStatus = "OnTrack" | "AtRisk" | "Overdue";

export type ApprovalStatus = "Pending" | "Approved" | "Rejected" | "Escalated" | "Expired";

export type UserRole = "employee" | "manager" | "admin";

export interface Document {
  id: string;
  name: string;
  type:
    | "transcript"
    | "receipt"
    | "enrollment"
    | "grade"
    | "agreement"
    | "other";
  uploadedAt: string;
  size: number;
  status: "processing" | "verified" | "rejected" | "pending";
  aiConfidence?: number;
  extractedData?: Record<string, string>;
}

export interface Application {
  id: string;
  employeeId: string;
  programType: ProgramType;
  status: ApplicationStatus;
  submittedAt: string | null;
  amount: number;
  credits: number;
  institution: string;
  courseTitle: string;
  documents: Document[];
  createdAt: string;
  updatedAt: string;
  term?: string;
  notes?: string;
  trackingId?: string;
}

export interface Employee {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  title: string;
  hireDate: string;
  tuitionBalance: number;
  tuitionUsed: number;
  tuitionMax: number;
  creditBalance: number;
  creditUsed: number;
  creditMax: number;
  email: string;
  phone: string;
  managerId: string | null;
  avatar?: string;
  location?: string;
  isNYSNA?: boolean;
}

export interface CaseItem {
  id: string;
  applicationId: string;
  employeeId: string;
  employeeName: string;
  programType: ProgramType;
  status: ApplicationStatus;
  submittedDate: string;
  dueDate: string;
  slaStatus: SlaStatus;
  aiConfidence: number;
  assignedAdmin: string;
  escalated: boolean;
  amount: number;
  institution: string;
  priority: "low" | "medium" | "high" | "critical";
}

export interface ApprovalItem {
  id: string;
  applicationId: string;
  employeeId: string;
  employeeName: string;
  employeeTitle: string;
  employeeDepartment: string;
  programType: ProgramType;
  amount: number;
  submittedDate: string;
  dueDate: string;
  aiSummary: string;
  status: ApprovalStatus;
  institution: string;
  courseTitle: string;
  credits: number;
}

export interface Program {
  id: string;
  name: string;
  description: string;
  maxAmount: number;
  maxCredits: number;
  eligibilityRules: string[];
  programType: ProgramType;
  icon: string;
  color: string;
  available: boolean;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  actorRole: UserRole;
  entityId: string;
  entityType: "application" | "case" | "user" | "document" | "system";
  description: string;
  ipAddress?: string;
  changes?: Record<string, { from: string; to: string }>;
}

export interface Notification {
  id: string;
  userId: string;
  type:
    | "deadline"
    | "approval"
    | "status_change"
    | "document"
    | "system"
    | "sla";
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  actionUrl?: string;
  priority: "low" | "medium" | "high";
}

export interface AuthUser {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  title: string;
  avatar?: string;
}

export interface CourseEntry {
  id: string;
  courseTitle: string;
  courseCode?: string;
  institution: string;
  credits: number;
  amount: number;
  startDate?: string;
  endDate?: string;
  term?: string;
  level?: string;
  creditType?: string;
  gradeReceived?: string; // 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'In Progress', 'Enrolled'
}

export interface WizardData {
  programType?: ProgramType;
  eligibilityChecked?: boolean;
  eligibilityResult?: {
    eligible: boolean;
    reasons: string[];
    warnings: string[];
  };
  employeeInfo?: Partial<Employee>;
  institution?: string;
  courseTitle?: string;
  term?: string;
  amount?: number;
  credits?: number;
  courses?: CourseEntry[];
  documents?: Document[];
  aiGapReport?: {
    missingDocuments: string[];
    validationErrors: string[];
    suggestions: string[];
  };
}

export interface DashboardStats {
  tuitionBalance: number;
  tuitionUsed: number;
  tuitionMax: number;
  creditBalance: number;
  creditUsed: number;
  creditMax: number;
  activeApplications: number;
  approvedThisYear: number;
  pendingAmount: number;
}

export interface ScholarshipApplicant {
  id: string;
  applicationId: string;
  anonymizedId: string;
  degreeProgram: string;
  institution: string;
  gpa: number;
  financialNeedScore: number;
  aiSummary: string;
  totalScore?: number;
  status: "Pending" | "Scored" | "Awarded" | "Rejected";
  conflictFlag?: boolean;
}

export interface CommitteeScore {
  id: string;
  applicantId: string;
  memberId: string;
  financialNeed: number;
  academicStanding: number;
  leadershipPotential: number;
  comments: string;
  submittedAt: string;
}

export interface ServiceAgreement {
  id: string;
  employeeId: string;
  employeeName: string;
  applicationId: string;
  amount: number;
  signedDate: string;
  startDate: string;
  endDate: string;
  status: "Active" | "ExpiringSoon" | "Breached" | "Completed";
  docusignUrl: string;
  proratedRepayment: number;
}

export interface ChatMessage {
  id: string;
  role: "ai" | "user";
  text: string;
  timestamp: string;
  isProactive?: boolean;
}

export interface SupportCaseMessage {
  id: string;
  senderName: string;
  senderRole: "employee" | "manager" | "admin" | "system";
  message: string;
  timestamp: string;
  isInternal?: boolean;
  attachment?: {
    name: string;
    size: string;
  };
}

export interface SupportCase {
  id: string;
  employeeId: string;
  employeeName: string;
  linkedAppId?: string;
  linkedAppProgram?: string;
  linkedAppDate?: string;
  linkedAppStatus?: string;
  subject: string;
  category: "Document Issue" | "Eligibility Question" | "Payment Query" | "Service Agreement" | "Technical Issue" | "Other";
  description: string;
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  createdDate: string;
  lastUpdated: string;
  assignedTo: string;
  messages: SupportCaseMessage[];
  attachments?: string[];
  resolutionNotes?: string;
  reopenedFlag?: boolean;
  reopenedDate?: string;
  priority?: "Low" | "Medium" | "High";
  unread?: boolean;
}
