import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type ApplicationId = string;
export type Timestamp = bigint;
export interface Application {
    id: ApplicationId;
    status: ApplicationStatus;
    credits: bigint;
    documents: Array<Document>;
    institution: string;
    createdAt: Timestamp;
    submittedAt?: Timestamp;
    updatedAt: Timestamp;
    employeeId: UserId;
    programType: ProgramType;
    courseTitle: string;
    amount: number;
}
export type AuditEntryId = string;
export interface CreditBalance {
    total: bigint;
    remaining: bigint;
}
export interface Document {
    id: string;
    url: string;
    ocrExtracted: boolean;
    name: string;
    aiConfidence?: number;
    docType: string;
    uploadedAt: Timestamp;
}
export interface AuditEntry {
    id: AuditEntryId;
    action: string;
    entityId: string;
    performedBy: string;
    timestamp: Timestamp;
    details: string;
}
export type UserId = string;
export interface TuitionBalance {
    total: number;
    remaining: number;
}
export type ProgramId = string;
export type CaseId = string;
export interface Program {
    id: ProgramId;
    maxAmount: number;
    name: string;
    description: string;
    maxCredits: bigint;
    eligibilityRules: Array<string>;
}
export type NotificationId = string;
export interface Notification {
    id: NotificationId;
    title: string;
    notifType: NotificationType;
    userId: UserId;
    createdAt: Timestamp;
    read: boolean;
    message: string;
}
export interface Employee {
    id: UserId;
    title: string;
    hireDate: Timestamp;
    name: string;
    tuitionBalance: TuitionBalance;
    email: string;
    employeeId: string;
    creditBalance: CreditBalance;
    managerId?: UserId;
    phone: string;
    department: string;
}
export interface CaseItem {
    id: CaseId;
    submittedDate: Timestamp;
    status: ApplicationStatus;
    employeeName: string;
    assignedHR: string;
    applicationId: ApplicationId;
    escalated: boolean;
    dueDate: Timestamp;
    aiConfidence: number;
    employeeId: UserId;
    programType: ProgramType;
    slaStatus: SlaStatus;
}
export interface ApprovalItem {
    id: string;
    submittedDate: Timestamp;
    status: ApprovalStatus;
    employeeName: string;
    applicationId: ApplicationId;
    dueDate: Timestamp;
    employeeId: UserId;
    aiSummary: string;
    programType: ProgramType;
    amount: number;
}
export interface ApplicationInput {
    credits: bigint;
    institution: string;
    employeeId: UserId;
    programType: ProgramType;
    courseTitle: string;
    amount: number;
}
export enum ApplicationStatus {
    UnderReview = "UnderReview",
    Approved = "Approved",
    Draft = "Draft",
    Rejected = "Rejected",
    Submitted = "Submitted",
    PendingApproval = "PendingApproval",
    Escalated = "Escalated"
}
export enum ApprovalStatus {
    Approved = "Approved",
    Rejected = "Rejected",
    Escalated = "Escalated",
    Pending = "Pending"
}
export enum NotificationType {
    Info = "Info",
    Deadline = "Deadline",
    Approval = "Approval",
    Warning = "Warning"
}
export enum ProgramType {
    CMEReimbursement = "CMEReimbursement",
    DependentTuition = "DependentTuition",
    TuitionReimbursement = "TuitionReimbursement",
    MMCScholarship = "MMCScholarship"
}
export enum SlaStatus {
    Overdue = "Overdue",
    OnTrack = "OnTrack",
    AtRisk = "AtRisk"
}
export interface backendInterface {
    approveApplication(id: string, comment: string): Promise<void>;
    escalateApplication(id: string, reason: string): Promise<void>;
    getApplications(employeeId: UserId): Promise<Array<Application>>;
    getAuditLog(): Promise<Array<AuditEntry>>;
    getCaseQueue(): Promise<Array<CaseItem>>;
    getEmployee(employeeId: UserId): Promise<Employee | null>;
    getNotifications(userId: UserId): Promise<Array<Notification>>;
    getPendingApprovals(): Promise<Array<ApprovalItem>>;
    getPrograms(): Promise<Array<Program>>;
    markNotificationRead(notifId: NotificationId): Promise<void>;
    rejectApplication(id: string, reason: string): Promise<void>;
    submitApplication(input: ApplicationInput): Promise<ApplicationId>;
    updateApplicationStatus(id: ApplicationId, status: ApplicationStatus): Promise<void>;
}
