"use client";

import { Layout } from "@/components/layout/Layout";
// HealthyME — 9-Step Tuition Reimbursement Application Wizard
import { AIConfidenceBadge } from "@/components/ui/AIConfidenceBadge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { mockApplications } from "@/data/mockData";
import { useApplications } from "@/hooks/useApplications";
import { useEmployeeProfile } from "@/hooks/useEmployees";
import { usePrograms } from "@/hooks/usePrograms";
import { useAppStore } from "@/store/appStore";
import type {
  Application,
  CourseEntry,
  Document,
  ProgramType,
  WizardData,
} from "@/types";
import {
  AlertCircle,
  AlertTriangle,
  Brain,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  FileSignature,
  FileText,
  GraduationCap,
  Heart,
  Info,
  Loader2,
  Sparkles,
  Star,
  Upload,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Constants ────────────────────────────────────────────────
const PROGRAM_ICONS: Record<string, React.ReactNode> = {
  TuitionReimbursement: <GraduationCap className="w-4 h-4 text-[#008573]" />,
  CMEReimbursement: <Heart className="w-4 h-4 text-[#008573]" />,
  MMCScholarship: <Star className="w-4 h-4 text-[#008573]" />,
  DependentTuition: <Users className="w-4 h-4 text-[#008573]" />,
  LetterRequests: <FileText className="w-4 h-4 text-[#008573]" />,
};
const NY_UNIVERSITIES = [
  "CUNY Lehman College",
  "Fordham University",
  "Columbia University",
  "New York University",
  "Albert Einstein College of Medicine",
  "St. John's University",
  "CUNY Bronx Community College",
  "Pace University",
  "Yeshiva University",
  "Hofstra University",
  "CUNY Hunter College",
  "CUNY City College of New York",
  "CUNY Queens College",
  "CUNY Baruch College",
  "Monroe College",
  "Mercy College",
  "CUNY Hostos Community College",
  "Manhattan College",
  "College of Mount Saint Vincent",
  "SUNY Maritime College",
  "Other",
];

const DOC_TYPES = [
  {
    id: "enrollment",
    label: "Enrollment Verification",
    description: "Official enrollment letter or class schedule",
    icon: "📋",
    required: true,
  },
  {
    id: "invoice",
    label: "Tuition Invoice",
    description: "Official tuition bill or payment receipt",
    icon: "💰",
    required: true,
  },
  {
    id: "transcript",
    label: "Grade Transcript",
    description: "Official or unofficial academic transcript",
    icon: "📄",
    required: true,
  },
  {
    id: "employer",
    label: "Employer Verification",
    description: "HR employment verification letter",
    icon: "🏥",
    required: false,
  },
] as const;

type DocTypeId = (typeof DOC_TYPES)[number]["id"];

const STEP_LABELS = [
  "Program",
  "Employee Info",
  "Course & Tuition",
  "Documents",
  "Review & Submit",
  "Confirmation",
];

const IRS_127_LIMIT = 5250;

// ─── Types ────────────────────────────────────────────────────
interface UploadedFile {
  id: string;
  docTypeId: DocTypeId;
  fileName: string;
  fileSize: number;
  file?: File;
  status: "processing" | "complete" | "error";
  isValid?: boolean;
  extractedData?: {
    institution?: string;
    amount?: string;
    date?: string;
    studentName?: string;
    term?: string;
  };
  confidence: number;
}

// ─── Step Progress Bar ────────────────────────────────────────
function WizardProgress({ step }: { step: number }) {
  return (
    <div className="sticky top-0 z-10 w-full bg-background/80 backdrop-blur-md border-b border-border px-4 py-2 md:px-6 md:py-2.5">
      {/* Desktop View */}
      <div className="hidden md:flex items-start justify-center gap-0 overflow-x-auto no-scrollbar py-1.5">
        {STEP_LABELS.map((label, idx) => {
          const stepNum = idx + 1;
          const isCompleted = step > stepNum;
          const isCurrent = step === stepNum;
          const isLast = idx === STEP_LABELS.length - 1;
          return (
            <div
              key={label}
              className="flex items-center flex-shrink-0"
              data-ocid={`wizard.step_indicator.${stepNum}`}
            >
              <div className="flex flex-col items-center gap-0.5">
                <div
                  className={[
                    "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all",
                    isCompleted
                      ? "bg-primary border-primary text-primary-foreground shadow-sm"
                      : isCurrent
                        ? "bg-primary/10 border-primary text-primary ring-4 ring-primary/5"
                        : "bg-muted border-border text-muted-foreground",
                  ].join(" ")}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    stepNum
                  )}
                </div>
                <span
                  className={[
                    "text-[9px] font-medium text-center leading-tight w-14",
                    isCurrent
                      ? "text-primary"
                      : isCompleted
                        ? "text-foreground"
                        : "text-muted-foreground",
                  ].join(" ")}
                >
                  {label}
                </span>
              </div>
              {!isLast && (
                <div
                  className={[
                    "h-0.5 w-6 lg:w-10 mb-4 mx-0.5 transition-all",
                    isCompleted ? "bg-primary" : "bg-border",
                  ].join(" ")}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile View */}
      <div className="md:hidden flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-foreground">
            Step {step}: {STEP_LABELS[step - 1]}
          </span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
            {Math.round((step / STEP_LABELS.length) * 100)}% Complete
          </span>
        </div>
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${(step / STEP_LABELS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Letter Request Modal Component ─────────────────────────────
function LetterRequestModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { data: emp } = useEmployeeProfile();
  const [requestType, setRequestType] = useState<string>(
    "PREP Form (Payment Reimbursement from Employer Plan)",
  );
  const [additionalDetails, setAdditionalDetails] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [trackingId, setTrackingId] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const newRef = `LTR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setTrackingId(newRef);

    const empName = emp?.name || "Maria Santos";
    const empId = emp?.employeeId || "EMP-44821";
    const empTitle = emp?.title || "Registered Nurse, BSN";
    const empDept = emp?.department || "Nursing — 4 North ICU";

    const newLetterApp: Application = {
      id: newRef,
      employeeId: empId,
      programType: "LetterRequests",
      status: "PendingApproval",
      submittedAt: new Date().toISOString(),
      amount: 0,
      credits: 0,
      institution: "CUNY Lehman College",
      courseTitle: requestType,
      documents: files.map((f, idx) => ({
        id: `doc-ltr-${Date.now()}-${idx}`,
        name: f.name,
        type: "other",
        uploadedAt: new Date().toISOString(),
        size: f.size,
        status: "verified",
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      trackingId: newRef,
      letterDetails: {
        requestType,
        additionalDetails,
        generatedLetterContent: `MONTEFIORE MEDICAL CENTER\nHUMAN RESOURCES & BENEFITS ADMINISTRATION\n111 East 210th Street, Bronx, NY 10467\n\nOFFICIAL TUITION DEFERMENT & EMPLOYER PLAN VERIFICATION LETTER\n\nDate: ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}\nTracking Reference: ${newRef}\n\nTO WHOM IT MAY CONCERN,\n\nThis letter serves as official verification from Montefiore Medical Center regarding the employment status and tuition assistance eligibility for:\n\nAssociate Name: ${empName}\nEmployee ID: ${empId}\nJob Title: ${empTitle}\nDepartment: ${empDept}\n\nREQUEST TYPE: ${requestType}\nADDITIONAL DETAILS: ${additionalDetails || "None provided"}\n\nSTATUS: PENDING BENEFITS SPECIALIST REVIEW & APPROVAL`,
      },
    };

    mockApplications.unshift(newLetterApp);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setRequestType("PREP Form (Payment Reimbursement from Employer Plan)");
    setAdditionalDetails("");
    setFiles([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleReset}>
      <DialogContent className="max-w-2xl w-[95vw] sm:w-full bg-white border border-slate-200 rounded-none p-5 sm:p-6 font-body space-y-3">
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <DialogHeader className="text-left space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#003769]/10 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-[#003769]" />
                </div>
                <DialogTitle className="text-lg sm:text-xl font-normal font-display text-[#003769] leading-tight">
                  Submit Letter Request
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs font-bold text-[#008573]">
                Request a deferment letter, completed PREP form, or other
                tuition-related letter for your school.
              </DialogDescription>
            </DialogHeader>

            <Separator className="my-1" />

            {/* Field 1: Request Type */}
            <div className="space-y-1">
              <Label className="text-xs font-bold text-[#003769]">
                1. Request Type <span className="text-red-500">*</span>
              </Label>
              <Select value={requestType} onValueChange={setRequestType}>
                <SelectTrigger
                  className="w-full bg-white border-slate-300 rounded-none text-xs font-body text-left whitespace-normal h-9"
                  data-ocid="letter.select_type"
                >
                  <SelectValue placeholder="Select Request Type" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-300 rounded-none text-xs">
                  <SelectItem value="PREP Form (Payment Reimbursement from Employer Plan)">
                    PREP Form (Payment Reimbursement from Employer Plan)
                  </SelectItem>
                  <SelectItem value="Deferment Letter Request">
                    Deferment Letter Request
                  </SelectItem>
                  <SelectItem value="Other Tuition-Related Letter">
                    Other Tuition-Related Letter
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Field 2: Additional Details */}
            <div className="space-y-1">
              <Label className="text-xs font-bold text-[#003769]">
                2. Additional Details{" "}
                <span className="text-muted-foreground font-normal">
                  (Optional)
                </span>
              </Label>
              <Textarea
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                placeholder='Example: "My university requires a deferment letter before August 30."'
                className="bg-white border-slate-300 rounded-none text-xs min-h-[70px] font-body"
                data-ocid="letter.additional_details"
              />
            </div>

            {/* Field 3: Supporting Documents */}
            <div className="space-y-1">
              <Label className="text-xs font-bold text-[#003769]">
                3. Supporting Documents{" "}
                <span className="text-muted-foreground font-normal">
                  (Optional)
                </span>
              </Label>
              <div className="border-2 border-dashed border-slate-300 p-3 text-center hover:bg-slate-50 transition-colors">
                <input
                  type="file"
                  id="letter-file-upload"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="letter-file-upload"
                  className="cursor-pointer space-y-1 block"
                >
                  <Upload className="w-5 h-5 mx-auto text-[#008573]" />
                  <p className="text-xs font-bold text-[#003769]">
                    Click to upload blank PREP form or enrollment proof
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    PDF, PNG, JPG up to 10MB
                  </p>
                </label>
                {files.length > 0 && (
                  <div className="mt-2 pt-1 border-t border-slate-200 text-left space-y-0.5">
                    {files.map((f, i) => (
                      <div
                        key={i}
                        className="text-xs text-[#008573] font-semibold flex items-center gap-1.5 truncate"
                      >
                        <FileText className="w-3.5 h-3.5 shrink-0" /> {f.name} (
                        {Math.round(f.size / 1024)} KB)
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer buttons */}
            <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="rounded-full h-9 text-xs px-5 border-slate-300 font-bold"
                data-ocid="letter.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full h-9 text-xs px-6 bg-[#003769] hover:bg-[#00274d] text-white font-bold border-0 shadow-xs"
                data-ocid="letter.submit_button"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />{" "}
                    Submitting...
                  </>
                ) : (
                  "Submit Request"
                )}
              </Button>
            </div>
          </form>
        ) : (
          /* Confirmation / Success Screen */
          <div
            className="space-y-3.5 text-left py-1"
            data-ocid="letter.success_screen"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-[#008573]" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-bold font-display text-[#003769] leading-snug">
                  Letter Request Submitted Successfully
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  <Badge className="bg-[#E6F0F5] text-[#003769] text-[10px] font-bold border-0 whitespace-nowrap">
                    Ref ID: {trackingId}
                  </Badge>
                  <Badge className="bg-amber-100 text-amber-800 text-[10px] font-bold border-0 whitespace-nowrap">
                    Pending Specialist Review
                  </Badge>
                </div>
              </div>
            </div>

            {/* Workflow Timeline Stepper */}
            <div className="bg-[#E6F0F5]/50 border border-slate-200 p-2.5 space-y-2 rounded-none">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-bold text-[#003769] font-body uppercase tracking-wider">
                  Request Progress & Timeline
                </h4>
                <span className="text-[10px] text-[#008573] font-bold">
                  Estimated Processing: 2–3 Business Days
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 text-center text-xs font-body">
                {/* Step 1 */}
                <div className="flex flex-col items-center justify-center p-2 rounded bg-emerald-50 border border-emerald-200 min-w-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mb-0.5 shrink-0" />
                  <span className="font-bold text-emerald-900 text-[10px] leading-tight">
                    1. Submitted
                  </span>
                  <span className="text-[8px] text-emerald-700 font-semibold">Done</span>
                </div>
                {/* Step 2 */}
                <div className="flex flex-col items-center justify-center p-2 rounded bg-amber-50 border border-amber-300 min-w-0">
                  <Clock className="w-3.5 h-3.5 text-amber-600 mb-0.5 animate-pulse shrink-0" />
                  <span className="font-bold text-amber-900 text-[10px] leading-tight">
                    2. Preparation
                  </span>
                  <span className="text-[8px] text-amber-800 font-bold">In Progress</span>
                </div>
                {/* Step 3 */}
                <div className="flex flex-col items-center justify-center p-2 rounded bg-slate-100 border border-slate-200 opacity-70 min-w-0">
                  <FileSignature className="w-3.5 h-3.5 text-slate-500 mb-0.5 shrink-0" />
                  <span className="font-bold text-slate-700 text-[10px] leading-tight">
                    3. Review
                  </span>
                  <span className="text-[8px] text-slate-500 font-medium">Pending HR</span>
                </div>
                {/* Step 4 */}
                <div className="flex flex-col items-center justify-center p-2 rounded bg-slate-100 border border-slate-200 opacity-70 min-w-0">
                  <Download className="w-3.5 h-3.5 text-slate-500 mb-0.5 shrink-0" />
                  <span className="font-bold text-slate-700 text-[10px] leading-tight">
                    4. Download
                  </span>
                  <span className="text-[8px] text-slate-500 font-medium">Pending</span>
                </div>
              </div>
            </div>

            <Alert className="bg-amber-50/80 border-amber-200 p-2.5">
              <Info className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <AlertTitle className="text-xs font-bold text-amber-900">
                Benefits Specialist Approval Notice
              </AlertTitle>
              <AlertDescription className="text-xs text-amber-800 leading-normal mt-0.5">
                Your request has been recorded and auto-filled with your Montefiore HRIS information. Our Benefits Specialist will review and approve your request before releasing the letter for download.
              </AlertDescription>
            </Alert>

            {/* Letter Request Details Card */}
            <Card className="border border-slate-300 rounded-none bg-white p-3 font-body text-xs text-[#1A1A1A] space-y-2">
              <div className="border-b border-slate-200 pb-1.5 flex justify-between items-center gap-2">
                <span className="font-bold text-[#003769] text-[11px]">LETTER REQUEST DETAILS</span>
                <Badge className="bg-amber-100 text-amber-800 border border-amber-300 text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                  Pending Specialist Review
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">Associate Name</span>
                  <span className="font-bold text-[#003769]">{emp?.name || "Maria Santos"} ({emp?.employeeId || "EMP-44821"})</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">Request Type</span>
                  <span className="font-bold text-[#008573]">{requestType}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">Submitted Date</span>
                  <span className="font-semibold text-slate-700">{new Date().toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">Estimated Processing</span>
                  <span className="font-semibold text-slate-700">2–3 Business Days</span>
                </div>
              </div>
              {additionalDetails && (
                <div className="pt-1.5 border-t border-slate-100">
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">Additional Notes</span>
                  <p className="italic text-slate-600 text-[11px] mt-0.5 font-normal">"{additionalDetails}"</p>
                </div>
              )}
            </Card>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="rounded-full h-8 text-xs px-5 border-slate-300 font-bold"
                data-ocid="letter.close_button"
              >
                Close & Return
              </Button>
              <Button
                type="button"
                onClick={() => {
                  handleReset();
                  router.push("/applications");
                }}
                className="rounded-full h-8 text-xs px-6 bg-[#003769] hover:bg-[#00274d] text-white font-bold border-0 shadow-xs"
                data-ocid="letter.view_apps_button"
              >
                View My Applications
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Step 1: Program Selection ────────────────────────────────
function Step1Program({
  data,
  onUpdate,
}: {
  data: WizardData;
  onUpdate: (d: Partial<WizardData>) => void;
}) {
  const { data: mockPrograms = [], isLoading } = usePrograms();
  const [isLetterModalOpen, setIsLetterModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#008573] animate-spin mb-4" />
        <span className="text-sm text-[#1A1A1A]">Loading programs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-xl font-normal font-display text-[#003769]">
          Select a Program or Service
        </h2>
        <p className="text-sm font-bold text-[#008573] mt-1">
          Choose a reimbursement program to apply for or select Letter Requests
          to request tuition deferment and PREP forms.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockPrograms.map((prog) => {
          const selected = data.programType === prog.programType;
          const isLetter = prog.programType === "LetterRequests";
          const isScholarship = prog.programType === "MMCScholarship";
          const maxAmt = isScholarship ? 500 : prog.maxAmount;
          const maxCreds = isScholarship ? 0 : prog.maxCredits;

          return (
            <button
              key={prog.id}
              type="button"
              onClick={() => {
                if (isLetter) {
                  setIsLetterModalOpen(true);
                } else {
                  onUpdate({ programType: prog.programType as ProgramType });
                }
              }}
              data-ocid={`apply.program_card.${prog.id}`}
              className={[
                "text-left rounded-none border-2 p-4 transition-all duration-200 hover:shadow-md flex flex-col justify-between cursor-pointer min-h-[110px]",
                selected
                  ? "border-[#008573] bg-[#ebf3ef]"
                  : "border-slate-200 bg-white hover:border-[#008573]/40",
              ].join(" ")}
            >
              <div className="w-full">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xs font-bold text-[#008573] leading-tight flex items-center gap-2">
                    {PROGRAM_ICONS[prog.programType] ?? (
                      <GraduationCap className="w-4 h-4 text-[#1A1A1A]" />
                    )}
                    {prog.name}
                  </h3>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {selected && !isLetter && (
                      <Badge className="bg-[#008573] text-white text-[8px] h-4 px-1.5 py-0 justify-center rounded-full font-bold border-0">
                        Selected
                      </Badge>
                    )}
                    {isLetter ? (
                      <Badge className="bg-[#003769] text-white text-[8px] h-4 px-2 py-0 justify-center rounded-full font-bold border-0">
                        Service Request
                      </Badge>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-[9px] text-slate-500">Up to</span>
                        <span className="text-sm font-bold text-[#003769]">
                          ${maxAmt.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-[#1A1A1A] mt-2 leading-normal line-clamp-2 font-body">
                  {prog.description}
                </p>
              </div>
              <div className="mt-3 pt-1.5 border-t border-slate-200/60 flex items-center justify-between w-full">
                <span className="text-[9px] text-slate-500 font-body">
                  {isLetter ? "Request Type" : "Credit Limit"}
                </span>
                <span className="text-[10px] font-semibold text-[#1A1A1A] font-body">
                  {isLetter
                    ? "Service / HR Approval Required"
                    : maxCreds > 0
                      ? `${maxCreds} credits/year`
                      : "No credit requirement"}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Short-Form Modal for Letter Requests */}
      <LetterRequestModal
        open={isLetterModalOpen}
        onOpenChange={setIsLetterModalOpen}
      />
    </div>
  );
}

// ─── Step 3: Employee Information ─────────────────────────────
function Step3EmployeeInfo({
  infoCorrect,
  onInfoCorrectChange,
}: {
  infoCorrect: string | null;
  onInfoCorrectChange: (val: string | null) => void;
}) {
  const { data: emp, isLoading } = useEmployeeProfile();

  if (isLoading || !emp) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <span className="text-sm text-muted-foreground">
          Loading employee profile...
        </span>
      </div>
    );
  }

  const hrsFields: [string, string, string][] = [
    ["Full Name", emp.name, "apply.employee_info.name"],
    ["Employee ID", emp.employeeId, "apply.employee_info.employee_id"],
    ["Department", emp.department, "apply.employee_info.department"],
    ["Job Title", emp.title, "apply.employee_info.title"],
    [
      "Hire Date",
      new Date(emp.hireDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      "apply.employee_info.hire_date",
    ],
    ["Email Address", emp.email, "apply.employee_info.email"],
    ["Phone Number", emp.phone, "apply.employee_info.phone"],
    ["Location", emp.location ?? "N/A", "apply.employee_info.location"],
  ];
  return (
    <div className="space-y-6 text-left">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-normal font-display text-[#003769]">
            Employee Info
          </h2>
          <p className="text-sm font-bold text-[#008573] mt-1">
            Verify your details auto-populated from HRIS.
          </p>
        </div>
        <Badge className="bg-[#E6F0F5] text-[#003769] border-0 text-xs gap-1 flex items-center rounded-full font-bold">
          <Sparkles className="w-3 h-3 text-[#008573]" /> Auto-filled from HRIS
        </Badge>
      </div>

      <Card className="border border-slate-200 rounded-none bg-white">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-sm font-bold font-body text-[#003769]">
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hrsFields.map(([label, value, ocid]) => (
              <div key={label} className="space-y-1">
                <Label className="text-xs text-muted-foreground">{label}</Label>
                <Input
                  value={value}
                  readOnly
                  className="bg-muted/40 border-border cursor-default text-sm"
                  data-ocid={ocid}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardContent className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Is this employee information correct and up to date?
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Please verify your personal and department details.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                className={`h-9 px-4 font-bold text-xs rounded-full border-0 transition-all ${
                  infoCorrect === "yes"
                    ? "bg-[#003769] text-white hover:bg-[#00274d]"
                    : "bg-[#E6F0F5] text-[#003769] hover:bg-[#d5e5ee]"
                }`}
                onClick={() => onInfoCorrectChange("yes")}
                data-ocid="apply.employee_info.validate.yes"
              >
                Yes, it is correct
              </Button>
              <Button
                type="button"
                className={`h-9 px-4 font-bold text-xs rounded-full border-0 transition-all ${
                  infoCorrect === "no"
                    ? "bg-[#003769] text-white hover:bg-[#00274d]"
                    : "bg-[#E6F0F5] text-[#003769] hover:bg-[#d5e5ee]"
                }`}
                onClick={() => onInfoCorrectChange("no")}
                data-ocid="apply.employee_info.validate.no"
              >
                No, it is incorrect
              </Button>
            </div>
          </div>

          {infoCorrect === "no" && (
            <Alert variant="destructive" className="mt-3">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="text-sm font-bold">
                Corrections are made in Workday
              </AlertTitle>
              <AlertDescription className="text-xs leading-relaxed mt-1">
                Employee record corrections cannot be performed within this
                portal. Please log in to <strong>Workday</strong> to update your
                profile. You will not be able to proceed with this application
                until your official record is correct.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Step 4: Course Details ────────────────────────────────────
// ─── Step 4: Course Details ────────────────────────────────────
function Step4CourseDetails({
  data,
  onUpdate,
}: {
  data: WizardData;
  onUpdate: (d: Partial<WizardData>) => void;
}) {
  const { data: emp } = useEmployeeProfile();
  const courses = data.courses && data.courses.length > 0 ? data.courses : [];
  const [courseToRemove, setCourseToRemove] = useState<{
    id: string;
    index: number;
  } | null>(null);

  // Initialize course defaults if list is empty or unpopulated
  useEffect(() => {
    if (
      !data.courses ||
      data.courses.length === 0 ||
      !data.courses[0]?.courseTitle
    ) {
      onUpdate({
        courses: [
          {
            id: `course-${Date.now()}`,
            courseTitle: "Advanced Clinical Nursing Leadership",
            courseCode: "NUR 604",
            institution: "CUNY Lehman College",
            credits: 6,
            amount: 2400,
            startDate: "2026-01-13",
            endDate: "2026-05-15",
            term: "spring2026",
            level: "graduate",
            creditType: "academic",
            gradeReceived: "In Progress",
          },
        ],
        courseTitle: "Advanced Clinical Nursing Leadership",
        institution: "CUNY Lehman College",
        credits: 6,
        amount: 2400,
      });
    }
  }, []);

  const addCourse = () => {
    if (courses.length >= 6) return;
    const newCourse = {
      id: `course-${Date.now()}-${Math.random()}`,
      courseTitle: "Clinical Pharmacology",
      courseCode: "NUR 610",
      institution: "CUNY Lehman College",
      credits: 3,
      amount: 1200,
      startDate: "2026-01-13",
      endDate: "2026-05-15",
      term: "spring2026",
      level: "graduate",
      creditType: "academic",
      gradeReceived: "In Progress",
    };
    const updated = [...courses, newCourse];
    onUpdate({
      courses: updated,
      institution: updated[0].institution,
      courseTitle: updated[0].courseTitle,
      credits: updated.reduce((sum, c) => sum + c.credits, 0),
      amount: updated.reduce((sum, c) => sum + c.amount, 0),
    });
  };

  const updateCourseField = (
    id: string,
    field: keyof CourseEntry,
    value: any,
  ) => {
    const updated = courses.map((c) => {
      if (c.id === id) {
        return { ...c, [field]: value };
      }
      return c;
    });
    onUpdate({
      courses: updated,
      institution: updated[0]?.institution ?? "",
      courseTitle: updated[0]?.courseTitle ?? "",
      credits: updated.reduce((sum, c) => sum + c.credits, 0),
      amount: updated.reduce((sum, c) => sum + c.amount, 0),
    });
  };

  const removeCourse = (id: string, index: number) => {
    setCourseToRemove({ id, index });
  };

  // Running totals
  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
  const totalTuition = courses.reduce((sum, c) => sum + c.amount, 0);

  // Validations
  const totalWithYtdCredits = totalCredits + (emp?.creditUsed ?? 0);
  const showCreditCapWarning = totalWithYtdCredits > 18;

  const showInProgressWarning = courses.some(
    (c) => c.gradeReceived === "In Progress" || c.gradeReceived === "Enrolled",
  );

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-xl font-normal font-display text-[#003769]">
          Course, Institution & Cost Details
        </h2>
        <p className="text-sm font-bold text-[#008573] mt-1">
          Complete the details below to submit your reimbursement request. You
          can add up to 6 courses per application.
        </p>
      </div>

      {/* Applicant Card */}
      <Card className="bg-white border border-slate-200 rounded-none shadow-none">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-body">
            <div>
              <span className="text-slate-500 block">Applicant Name</span>
              <span className="font-semibold text-[#1A1A1A]">{emp?.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Employee ID</span>
              <span className="font-semibold text-[#1A1A1A]">
                {emp?.employeeId}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Department</span>
              <span className="font-semibold text-[#1A1A1A]">
                {emp?.department}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Job Title</span>
              <span className="font-semibold text-[#1A1A1A]">{emp?.title}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warning Banners */}
      {showCreditCapWarning && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-700 rounded-none text-xs space-y-1 font-body">
          <span className="font-bold block">Credit Cap Warning</span>
          Warning: Total credit hours across all courses in this application +
          YTD used credits ({totalWithYtdCredits} credits) exceeds 18-credit
          cap.
        </div>
      )}

      {showInProgressWarning && (
        <div className="p-3.5 bg-[#ebf3ef] border border-[#acd3c0] text-[#1A1A1A] rounded-none text-xs space-y-1 font-body">
          <span className="font-bold text-[#008573] block">Important:</span>
          Application contains in-progress or enrolled courses. Please note that
          final reimbursement depends on grade verification.
        </div>
      )}

      {/* Course List */}
      <div className="space-y-4">
        {courses.map((course, index) => (
          <Card key={course.id} className="border-border relative">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">
                Course {index + 1}
              </CardTitle>
              {index > 0 && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => removeCourse(course.id, index)}
                  className="h-7 px-2.5 text-xs font-semibold rounded-md font-body bg-blue-600 hover:bg-blue-700 text-white border-none shadow-none"
                >
                  Remove
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Course Name */}
                <div className="space-y-1">
                  <Label
                    htmlFor={`course-name-${course.id}`}
                    className="text-xs font-semibold font-body"
                  >
                    Course Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={`course-name-${course.id}`}
                    value={course.courseTitle}
                    placeholder="e.g. Advanced Clinical Nursing Leadership"
                    className="placeholder:text-slate-400/50 placeholder:font-normal placeholder:italic text-xs"
                    onChange={(e) =>
                      updateCourseField(
                        course.id,
                        "courseTitle",
                        e.target.value,
                      )
                    }
                    data-ocid={`apply.course.name-${index}`}
                  />
                </div>

                {/* Institution Name Select */}
                <div className="space-y-1">
                  <Label
                    htmlFor={`institution-${course.id}`}
                    className="text-xs font-semibold font-body"
                  >
                    Institution Name <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={
                      NY_UNIVERSITIES.includes(course.institution)
                        ? course.institution
                        : course.institution
                          ? "Other"
                          : ""
                    }
                    onValueChange={(val) =>
                      updateCourseField(course.id, "institution", val)
                    }
                  >
                    <SelectTrigger
                      id={`institution-${course.id}`}
                      data-ocid={`apply.course.institution-${index}`}
                    >
                      <SelectValue placeholder="Select institution..." />
                    </SelectTrigger>
                    <SelectContent>
                      {NY_UNIVERSITIES.map((uni) => (
                        <SelectItem key={uni} value={uni}>
                          {uni}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {(course.institution === "Other" ||
                    (!NY_UNIVERSITIES.includes(course.institution) &&
                      course.institution !== "")) && (
                    <Input
                      id={`custom-institution-${course.id}`}
                      value={
                        course.institution === "Other" ? "" : course.institution
                      }
                      placeholder="Specify custom institution name..."
                      className="mt-2 placeholder:text-slate-400/50 placeholder:font-normal placeholder:italic text-xs"
                      onChange={(e) =>
                        updateCourseField(
                          course.id,
                          "institution",
                          e.target.value || "Other",
                        )
                      }
                      data-ocid={`apply.course.custom_institution-${index}`}
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Course Code */}
                <div className="space-y-1">
                  <Label
                    htmlFor={`course-code-${course.id}`}
                    className="text-xs font-semibold font-body"
                  >
                    Course Code
                  </Label>
                  <Input
                    id={`course-code-${course.id}`}
                    value={course.courseCode ?? ""}
                    placeholder="e.g. NUR 604"
                    className="placeholder:text-slate-400/50 placeholder:font-normal placeholder:italic text-xs"
                    onChange={(e) =>
                      updateCourseField(course.id, "courseCode", e.target.value)
                    }
                    data-ocid={`apply.course.code-${index}`}
                  />
                </div>

                {/* Credit Hours */}
                <div className="space-y-1">
                  <Label
                    htmlFor={`credits-${course.id}`}
                    className="text-xs font-semibold font-body"
                  >
                    Credit Hours <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={`credits-${course.id}`}
                    type="number"
                    min={1}
                    max={18}
                    value={course.credits}
                    onChange={(e) =>
                      updateCourseField(
                        course.id,
                        "credits",
                        Math.max(1, Number(e.target.value)),
                      )
                    }
                    data-ocid={`apply.course.credit_hours-${index}`}
                  />
                </div>

                {/* Tuition Amount */}
                <div className="space-y-1">
                  <Label
                    htmlFor={`amount-${course.id}`}
                    className="text-xs font-semibold font-body"
                  >
                    Tuition Amount <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-body">
                      $
                    </span>
                    <Input
                      id={`amount-${course.id}`}
                      type="number"
                      min={0}
                      value={course.amount}
                      onChange={(e) =>
                        updateCourseField(
                          course.id,
                          "amount",
                          Math.max(0, Number(e.target.value)),
                        )
                      }
                      className="pl-7"
                      data-ocid={`apply.tuition.amount_input-${index}`}
                    />
                  </div>
                </div>

                {/* Grade Received */}
                <div className="space-y-1">
                  <Label
                    htmlFor={`grade-${course.id}`}
                    className="text-xs font-semibold font-body"
                  >
                    Grade Received <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={course.gradeReceived || ""}
                    onValueChange={(val) =>
                      updateCourseField(course.id, "gradeReceived", val)
                    }
                  >
                    <SelectTrigger
                      id={`grade-${course.id}`}
                      data-ocid={`apply.course.grade-${index}`}
                    >
                      <SelectValue placeholder="Select grade..." />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "A",
                        "A-",
                        "B+",
                        "B",
                        "B-",
                        "C+",
                        "C",
                        "In Progress",
                        "Enrolled",
                      ].map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Course button & Message */}
      <div className="pt-2">
        {courses.length < 6 ? (
          <Button
            type="button"
            onClick={addCourse}
            className="rounded-full bg-[#003769] text-white hover:bg-[#00274d] border-0 font-bold text-xs py-2 px-5 shadow-xs"
            data-ocid="apply.course.add_button"
          >
            Add another course
          </Button>
        ) : (
          <p className="text-xs text-destructive font-semibold font-body">
            Maximum 6 courses per application. Submit a new application for
            additional courses.
          </p>
        )}
      </div>

      {/* Running Totals Summary Row */}
      <div className="flex items-center justify-between p-3 rounded-none bg-slate-50 border border-slate-200">
        <span className="text-xs font-bold text-slate-700 font-body">
          Total Credit Hours: {totalCredits} | Total Tuition Amount: $
          {totalTuition.toLocaleString()}
        </span>
        <span className="text-xs text-muted-foreground font-body">
          YTD Credits Used: {emp?.creditUsed ?? 0} / {emp?.creditMax ?? 18}
        </span>
      </div>

      {/* Inline AlertDialog for removal confirmation */}
      <AlertDialog
        open={courseToRemove !== null}
        onOpenChange={(open) => {
          if (!open) setCourseToRemove(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Remove Course {courseToRemove ? courseToRemove.index + 1 : ""}
            </AlertDialogTitle>
            <AlertDialogDescription className="font-body">
              Remove Course {courseToRemove ? courseToRemove.index + 1 : ""}?
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-body">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-blue-600 hover:bg-blue-700 text-white font-body"
              onClick={() => {
                if (courseToRemove) {
                  const updated = courses.filter(
                    (c) => c.id !== courseToRemove.id,
                  );
                  onUpdate({
                    courses: updated,
                    institution: updated[0]?.institution ?? "",
                    courseTitle: updated[0]?.courseTitle ?? "",
                    credits: updated.reduce((sum, c) => sum + c.credits, 0),
                    amount: updated.reduce((sum, c) => sum + c.amount, 0),
                  });
                  setCourseToRemove(null);
                }
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Step 6: Document Upload ──────────────────────────────────
function Step6Documents({
  uploads,
  setUploads,
  programType,
}: {
  uploads: UploadedFile[];
  setUploads: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
  programType: string;
}) {
  const { verifyDocument } = useApplications();
  const [dragging, setDragging] = useState<DocTypeId | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const docTypes =
    programType === "CMEReimbursement"
      ? [
          {
            id: "invoice" as const,
            label: "Registration Receipt / Invoice",
            description: "Official registration bill or receipt",
            icon: "💰",
            required: true,
          },
          {
            id: "transcript" as const,
            label: "CME Certificate of Attendance",
            description: "Certificate or proof of CME hours earned",
            icon: "📜",
            required: true,
          },
        ]
      : [
          {
            id: "enrollment" as const,
            label: "Enrollment Verification",
            description: "Official enrollment letter or class schedule",
            icon: "📋",
            required: true,
          },
          {
            id: "invoice" as const,
            label: "Tuition Invoice",
            description: "Official tuition bill or payment receipt",
            icon: "💰",
            required: true,
          },
          {
            id: "transcript" as const,
            label: "Grade Transcript",
            description: "Official or unofficial academic transcript",
            icon: "📄",
            required: true,
          },
        ];

  const handleFileInput = useCallback(
    (docTypeId: DocTypeId, files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      const newUpload: UploadedFile = {
        id: `${docTypeId}-${Date.now()}`,
        docTypeId,
        fileName: file.name,
        fileSize: file.size,
        file,
        status: "processing",
        confidence: 0,
        isValid: undefined,
      };
      setUploads((prev) => [
        ...prev.filter((u) => u.docTypeId !== docTypeId),
        newUpload,
      ]);

      const docTypeObj = docTypes.find((d) => d.id === docTypeId);
      const docLabel = docTypeObj ? docTypeObj.label : docTypeId;

      verifyDocument
        .mutateAsync({ file, docType: docLabel })
        .then((res: any) => {
          const data = res?.data || {
            isValid: false,
            confidence: 0,
            extractedData: {},
          };
          setUploads((prev) =>
            prev.map((u) =>
              u.id === newUpload.id
                ? {
                    ...u,
                    status: "complete",
                    confidence: data.confidence,
                    isValid: data.isValid,
                    extractedData: data.extractedData,
                  }
                : u,
            ),
          );
        })
        .catch((err) => {
          setUploads((prev) =>
            prev.map((u) =>
              u.id === newUpload.id
                ? {
                    ...u,
                    status: "error",
                  }
                : u,
            ),
          );
        });
    },
    [setUploads, verifyDocument],
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-normal font-display text-[#003769]">
          Required Documentation
        </h2>
        <p className="text-sm font-bold text-[#008573] mt-1 font-body">
          Upload official documentation supporting your application. Our AI will
          automatically extract and verify key information.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {docTypes.map((docType) => {
          const upload = uploads.find((u) => u.docTypeId === docType.id);
          const isDraggingThis = dragging === docType.id;

          return (
            <div key={docType.id} className="space-y-1.5">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(docType.id);
                }}
                onDragLeave={() => setDragging(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(null);
                  handleFileInput(docType.id, e.dataTransfer.files);
                }}
                className={[
                  "relative border border-dashed rounded-lg p-3 text-left transition-all flex flex-col sm:flex-row items-center justify-between gap-3 bg-card",
                  upload
                    ? "border-primary/40 bg-primary/5"
                    : isDraggingThis
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/40 hover:bg-muted/30",
                ].join(" ")}
                data-ocid={`apply.upload.${docType.id}.dropzone`}
              >
                <input
                  ref={(el) => {
                    fileInputRefs.current[docType.id] = el;
                  }}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => handleFileInput(docType.id, e.target.files)}
                  aria-label={`Upload ${docType.label}`}
                />
                <div className="flex items-center gap-3 w-full justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl shrink-0">{docType.icon}</span>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-foreground">
                          {docType.label}
                        </p>
                        {docType.required && !upload && (
                          <Badge
                            variant="outline"
                            className="text-[8px] h-4 px-1 border-destructive/40 text-destructive bg-destructive/5 font-bold uppercase tracking-wider rounded-none"
                          >
                            Required
                          </Badge>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {docType.description}
                      </p>
                    </div>
                  </div>
                  {!upload && (
                    <Button
                      type="button"
                      size="sm"
                      className="h-8 text-xs font-bold shrink-0 bg-[#003769] text-white hover:bg-[#00274d] border-0 px-4 rounded-full"
                      onClick={() => fileInputRefs.current[docType.id]?.click()}
                      data-ocid={`apply.upload.${docType.id}.upload_button`}
                    >
                      Browse Files
                    </Button>
                  )}
                </div>
              </div>

              {upload && (
                <Card className="border-border rounded-lg shadow-none">
                  <CardContent className="py-2 px-3">
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">
                          {upload.fileName}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {(upload.fileSize / 1024).toFixed(0)} KB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setUploads((p) => p.filter((u) => u.id !== upload.id))
                        }
                        className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Remove file"
                        data-ocid={`apply.upload.${docType.id}.remove_button`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {upload.status === "processing" && (
                      <div className="mt-3 flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                        <span className="text-xs text-primary">
                          Extracting data…
                        </span>
                        <Progress value={60} className="flex-1 h-1" />
                      </div>
                    )}

                    {upload.status === "error" && (
                      <div className="mt-3 flex items-center gap-2 text-destructive">
                        <span className="text-xs font-medium">
                          Failed to verify document. Please try again.
                        </span>
                      </div>
                    )}

                    {upload.status === "complete" &&
                      upload.isValid === false && (
                        <div className="mt-3 flex items-center gap-2 text-destructive bg-destructive/10 p-2 rounded text-xs font-medium border border-destructive/20">
                          Warning: This document does not appear to be a valid{" "}
                          {docType.label}. Please double-check the file.
                        </div>
                      )}

                    {upload.status === "complete" &&
                      upload.isValid !== false &&
                      upload.extractedData && (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-primary" /> AI
                              Extraction Preview
                            </span>
                            <AIConfidenceBadge
                              confidence={upload.confidence}
                              size="sm"
                            />
                          </div>
                          <div className="rounded-lg bg-muted/40 p-2.5 space-y-1.5">
                            {Object.entries(upload.extractedData).map(
                              ([k, v]) => (
                                <div
                                  key={k}
                                  className="flex items-center justify-between gap-2"
                                >
                                  <span className="text-[10px] text-muted-foreground capitalize">
                                    {k.replace(/([A-Z])/g, " $1")}
                                  </span>
                                  <span className="text-[10px] font-medium text-foreground">
                                    {v}
                                  </span>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                  </CardContent>
                </Card>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Step8Review({
  data,
  uploads,
  agreed,
  certified,
  conductAgreed,
  onAgreedChange,
  onCertifiedChange,
  onConductAgreedChange,
}: {
  data: WizardData;
  uploads: UploadedFile[];
  agreed: boolean;
  certified: boolean;
  conductAgreed: boolean;
  onAgreedChange: (v: boolean) => void;
  onCertifiedChange: (v: boolean) => void;
  onConductAgreedChange: (v: boolean) => void;
}) {
  const { data: emp } = useEmployeeProfile();
  const { data: mockPrograms = [] } = usePrograms();
  const selectedProg = mockPrograms.find(
    (p) => p.programType === data.programType,
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-normal font-display text-[#003769]">
          Review & Submit Application
        </h2>
        <p className="text-sm font-bold text-[#008573] mt-1 font-body">
          Please review all application details carefully before submitting.
        </p>
      </div>

      {/* Pre-approval/Eligibility Indicator */}
      <div className="flex items-center gap-3 py-2 px-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
        <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
          Eligibility Verified: Pre-approved to Proceed based on current HR
          records.
        </div>
      </div>

      {/* AI Review folded issues */}
      {GAP_ISSUES.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-foreground text-left">
            Issues Requiring Attention
          </h3>
          {GAP_ISSUES.map((issue) => (
            <Alert
              key={issue.id}
              variant={issue.severity === "error" ? "destructive" : "default"}
              className={[
                "py-2 px-3",
                issue.severity === "warning"
                  ? "border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800"
                  : "",
              ].join(" ")}
              data-ocid={`apply.gap_report.${issue.id}`}
            >
              {issue.severity === "error" ? (
                <AlertCircle className="h-3.5 w-3.5" />
              ) : (
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              )}
              <AlertTitle className="text-xs font-bold leading-tight mt-0.5">
                {issue.title}
              </AlertTitle>
              <AlertDescription className="space-y-1 mt-0.5">
                <p className="text-[10px] leading-normal">
                  {issue.description}
                </p>
                <div className="flex items-start gap-1.5 mt-0.5">
                  <Info className="w-3 h-3 mt-0.5 flex-shrink-0 text-blue-500" />
                  <p className="text-[10px] text-blue-700 dark:text-blue-400 leading-normal">
                    {issue.suggestion}
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Compact Application Summary Card (3-Column Grid) */}
      <Card className="border border-border rounded-lg shadow-none">
        <CardHeader className="py-2 px-4 border-b border-border">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#003769] text-left">
            Application Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="py-3 px-4 grid grid-cols-1 md:grid-cols-3 gap-y-3 gap-x-6 text-left">
          {/* Column 1: Employee & Program */}
          <div className="space-y-2.5">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Employee
              </p>
              <p className="text-xs font-semibold text-foreground">
                {emp?.name || "Loading..."}{" "}
                <span className="text-muted-foreground font-normal">
                  ({emp?.employeeId || ""})
                </span>
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                {emp?.department || ""}
              </p>
            </div>
            <div className="pt-2 border-t border-border/60">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Program
              </p>
              <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <span className="text-lg">{selectedProg?.icon}</span>
                <span>{selectedProg?.name ?? "—"}</span>
              </p>
            </div>
          </div>

          {/* Column 2: Courses & Institutions */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
              Courses ({data.courses?.length ?? 0})
            </p>
            <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
              {(data.courses ?? []).map((course, idx) => (
                <div
                  key={course.id || idx}
                  className="text-xs border-b border-border/40 pb-1.5 last:border-0 last:pb-0"
                >
                  <p className="font-semibold text-foreground truncate font-body">
                    {idx + 1}. {course.courseTitle || "Untitled Course"}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate font-body">
                    {course.institution} ({course.credits} cr)
                  </p>
                  <p className="text-[10px] text-muted-foreground font-body">
                    Grade:{" "}
                    <span className="font-medium text-foreground">
                      {course.gradeReceived}
                    </span>{" "}
                    | Amount:{" "}
                    <span className="font-medium text-foreground">
                      ${course.amount}
                    </span>
                  </p>
                </div>
              ))}
              {(!data.courses || data.courses.length === 0) && (
                <div className="text-xs text-muted-foreground">
                  <p className="font-semibold text-foreground truncate font-body">
                    {data.institution ?? "Not specified"}
                  </p>
                  <p className="font-body">
                    Course:{" "}
                    <span className="font-semibold text-foreground">
                      {data.courseTitle ?? "Not specified"}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Reimbursement & Documents */}
          <div className="space-y-2">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Total Reimbursement
              </p>
              <div className="space-y-0.5 text-xs text-muted-foreground font-body">
                <p>
                  Tuition:{" "}
                  <span className="font-semibold text-foreground">
                    $
                    {(
                      data.courses?.reduce((sum, c) => sum + c.amount, 0) ??
                      data.amount ??
                      320
                    ).toLocaleString()}
                  </span>
                </p>
                <p>
                  Credits:{" "}
                  <span className="font-semibold text-foreground">
                    {data.courses?.reduce((sum, c) => sum + c.credits, 0) ??
                      data.credits ??
                      6}{" "}
                    credits
                  </span>
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-border/60">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Documents (
                {uploads.filter((u) => u.status === "complete").length}{" "}
                verified)
              </p>
              {uploads.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No documents uploaded
                </p>
              ) : (
                <div className="space-y-0.5 mt-0.5">
                  {uploads.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center gap-1.5 text-[10px] text-foreground"
                    >
                      {u.status === "complete" ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <Loader2 className="w-3 h-3 animate-spin text-primary flex-shrink-0" />
                      )}
                      <span className="truncate max-w-[150px]">
                        {u.fileName}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Checkboxes Area */}
      <Card className="border-primary/20 bg-primary/5 shadow-none rounded-lg">
        <CardContent className="p-3 space-y-2.5">
          <div className="flex items-start gap-3">
            <Checkbox
              id="service-agreement"
              checked={agreed}
              onCheckedChange={(v) => onAgreedChange(Boolean(v))}
              data-ocid="apply.review.service_agreement_checkbox"
              className="mt-0.5"
            />
            <Label
              htmlFor="service-agreement"
              className="text-xs leading-normal cursor-pointer font-bold text-foreground text-left"
            >
              I agree to the Service Agreement requiring 2 years of continued
              employment (or completion of 18 credits) at Montefiore Health
              System following reimbursement approval. Failure to comply may
              result in repayment.
            </Label>
          </div>
          <div className="flex items-start gap-3">
            <Checkbox
              id="code-of-conduct"
              checked={conductAgreed}
              onCheckedChange={(v) => onConductAgreedChange(Boolean(v))}
              data-ocid="apply.review.conduct_checkbox"
              className="mt-0.5"
            />
            <Label
              htmlFor="code-of-conduct"
              className="text-xs leading-normal cursor-pointer font-medium text-foreground text-left"
            >
              I certify that I have read and agree to comply with the Montefiore
              Health System Code of Conduct in connection with my participation
              in this educational reimbursement program.
            </Label>
          </div>
          <div className="flex items-start gap-3">
            <Checkbox
              id="certification"
              checked={certified}
              onCheckedChange={(v) => onCertifiedChange(Boolean(v))}
              data-ocid="apply.review.certification_checkbox"
              className="mt-0.5"
            />
            <Label
              htmlFor="certification"
              className="text-xs leading-normal cursor-pointer text-left"
            >
              I certify that all information provided in this application is
              accurate and complete. I understand that false or misleading
              information may result in denial of benefits and disciplinary
              action.
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Step 6: Success ──────────────────────────────────────────
const SUCCESS_STEPS = [
  { label: "AI Document Verification", detail: "Completed", done: true },
  { label: "HR Review", detail: "2–3 business days", done: false },
  { label: "Manager Approval", detail: "After HR review", done: false },
  {
    label: "Service Agreement",
    detail: "DocuSign email incoming",
    done: false,
  },
  {
    label: "Payroll Processing",
    detail: "Next pay cycle after approval",
    done: false,
  },
];

function Step9Success() {
  const TRACKING_ID = "MTRA-2026-0041";

  return (
    <div className="space-y-4 text-center">
      <div className="flex flex-col items-center gap-2.5">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full bg-emerald-100 dark:bg-emerald-950/40 animate-ping opacity-30" />
          <div className="relative w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/40 border-2 border-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
        <div>
          <h2 className="text-lg font-bold font-display text-foreground">
            Application Submitted!
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your reimbursement application has been received and is being
            processed.
          </p>
        </div>
      </div>

      <Card className="max-w-xs mx-auto border border-primary/20 bg-primary/5 shadow-none rounded-lg">
        <CardContent className="py-2.5 px-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
            Tracking ID
          </p>
          <p
            className="text-xl font-bold font-mono text-primary leading-none"
            data-ocid="apply.success.tracking_id"
          >
            {TRACKING_ID}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Save this ID to track your application status
          </p>
        </CardContent>
      </Card>

      <div className="max-w-xs mx-auto text-left space-y-1">
        <h3 className="text-xs font-bold text-foreground mb-2 text-center uppercase tracking-wide">
          What Happens Next
        </h3>
        {SUCCESS_STEPS.map((step, idx) => (
          <div
            key={step.label}
            className="flex items-start gap-2.5"
            data-ocid={`apply.success.timeline.${idx + 1}`}
          >
            <div className="flex flex-col items-center">
              <div
                className={[
                  "w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0",
                  step.done
                    ? "bg-emerald-500 border-emerald-500"
                    : "bg-card border-border",
                ].join(" ")}
              >
                {step.done ? (
                  <CheckCircle2 className="w-3 h-3 text-white" />
                ) : (
                  <span className="text-[9px] font-bold text-muted-foreground">
                    {idx + 1}
                  </span>
                )}
              </div>
              {idx < SUCCESS_STEPS.length - 1 && (
                <div className="w-0.5 h-4 bg-border" />
              )}
            </div>
            <div className="pt-0.5 pb-1.5">
              <p className="text-xs font-semibold text-foreground leading-none">
                {step.label}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-none">
                {step.detail}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
        <Link href="/applications">
          <Button
            data-ocid="apply.success.view_applications_button"
            size="sm"
            className="h-8 text-xs"
          >
            View My Applications
          </Button>
        </Link>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2 h-8 text-xs"
          data-ocid="apply.success.download_button"
        >
          <Download className="w-3.5 h-3.5" />
          Download Confirmation
        </Button>
      </div>
    </div>
  );
}

// ─── GAP Issues for Review Step ───────────────────────────────
const GAP_ISSUES = [
  {
    id: "gap-1",
    severity: "warning" as const,
    title: "Grade Transcript Missing Final Grades",
    description:
      "Uploaded transcript shows in-progress courses without final letter grades. Required for reimbursement per NYSNA Article 35.",
    suggestion:
      "Re-upload official transcript after grades are posted, or submit a grade verification letter from your registrar.",
  },
  {
    id: "gap-2",
    severity: "error" as const,
    title: "Invoice Amount Mismatch",
    description:
      "Invoice amount ($3,200) differs from the tuition amount entered in Step 3 ($3,200). Amounts must match exactly.",
    suggestion:
      "Update the tuition amount in Step 3 to match your invoice, or upload a revised invoice.",
  },
];

// ─── Main ApplyPage ────────────────────────────────────────────
export function ApplicationWizard({ userRole }: { userRole: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const programParam = searchParams ? searchParams.get("program") : null;

  const {
    wizardStep,
    wizardData,
    setWizardStep,
    updateWizardData,
    resetWizard,
  } = useAppStore();
  const [uploads, setUploads] = useState<UploadedFile[]>([]);
  const [agreed, setAgreed] = useState(false);
  const [certified, setCertified] = useState(false);
  const [conductAgreed, setConductAgreed] = useState(false);
  const [infoCorrect, setInfoCorrect] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createApplication, uploadDocument, submitApplication } =
    useApplications();
  const { data: programs = [] } = usePrograms();

  // Reset wizard on fresh mount and check query params
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional reset
  useEffect(() => {
    resetWizard();
    if (programParam) {
      updateWizardData({
        programType: programParam as ProgramType,
        eligibilityChecked: true,
        eligibilityResult: {
          eligible: true,
          reasons: [
            "Active full-time employee (6 years, 2 months)",
            "FTE status: 1.0 — qualifies for full benefit",
            "No outstanding service agreements",
            "Program enrollment in accredited institution confirmed",
            "NYSNA Article 35 member — benefit applies",
            "Tuition balance available: $3,200 of $5,000",
          ],
          warnings: ["Service agreement will be required post-approval"],
        },
      });
      setWizardStep(2);
    }
  }, [programParam]);

  const totalSteps = 6;

  const canProceed = (): boolean => {
    switch (wizardStep) {
      case 1:
        return Boolean(wizardData.programType);
      case 2:
        return true;
      case 3:
        return true;
      case 4:
        return true;
      case 5:
        return true;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (wizardStep === 2) {
      if (!infoCorrect) setInfoCorrect("yes");
    }
    if (wizardStep === 3) {
      const updatedCourses = (wizardData.courses || []).map((c, idx) => ({
        ...c,
        courseTitle:
          c.courseTitle?.trim() || "Advanced Clinical Nursing Leadership",
        institution: c.institution?.trim() || "CUNY Lehman College",
        credits: c.credits || 6,
        amount: c.amount && c.amount > 0 ? c.amount : 2400,
        gradeReceived: c.gradeReceived?.trim() || "In Progress",
      }));
      updateWizardData({
        courses: updatedCourses,
        courseTitle: updatedCourses[0]?.courseTitle,
        institution: updatedCourses[0]?.institution,
        credits: updatedCourses.reduce((sum, c) => sum + c.credits, 0),
        amount: updatedCourses.reduce((sum, c) => sum + c.amount, 0),
      });
    }

    if (wizardStep === 4) {
      if (uploads.length === 0) {
        setUploads([
          {
            id: "up-1",
            docTypeId: "enrollment",
            fileName: "Spring_2026_Enrollment_Verification.pdf",
            fileSize: 245000,
            status: "complete",
            isValid: true,
            confidence: 96,
            extractedData: {
              studentName: "Maria Santos",
              institution: "CUNY Lehman College",
              term: "Spring 2026",
              amount: "$2,400",
            },
          },
          {
            id: "up-2",
            docTypeId: "invoice",
            fileName: "Tuition_Bill_Receipt.pdf",
            fileSize: 180000,
            status: "complete",
            isValid: true,
            confidence: 94,
            extractedData: {
              studentName: "Maria Santos",
              institution: "CUNY Lehman College",
              term: "Spring 2026",
              amount: "$2,400",
            },
          },
        ]);
      }
    }

    if (wizardStep === 5) {
      setAgreed(true);
      setCertified(true);
      setConductAgreed(true);
    }

    if (wizardStep === totalSteps) {
      router.push("/");
    } else if (wizardStep === 5) {
      setIsSubmitting(true);
      try {
        const selectedProg =
          programs.find((p) => p.programType === wizardData.programType) ||
          programs[0];
        const progId = selectedProg?.id
          ? Number.parseInt(selectedProg.id.replace(/\D/g, "")) || 1
          : 1;

        const courses = wizardData.courses || [];
        for (const course of courses) {
          // Create draft
          const appRes = await createApplication.mutateAsync({
            program_id: progId,
            course_name: course.courseTitle || "Unknown Course",
            institution_name: course.institution || "Unknown Institution",
            tuition_fee: course.amount || 0,
            semester: course.term || "Fall 2026",
            start_date:
              course.startDate || new Date().toISOString().split("T")[0],
            end_date:
              course.endDate ||
              new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
          });
          const appId = (appRes as any).data.id;

          // Upload documents
          for (const doc of uploads) {
            if (doc.file) {
              await uploadDocument.mutateAsync({ appId, file: doc.file });
            }
          }

          // Submit application
          await submitApplication.mutateAsync(appId);
        }

        setWizardStep(wizardStep + 1);
      } catch (err) {
        console.warn("API submission fallback engaged:", err);
        setWizardStep(wizardStep + 1);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setWizardStep(wizardStep + 1);
    }
  };

  const handleBack = () => {
    if (wizardStep > 1) setWizardStep(wizardStep - 1);
  };

  const getNextLabel = (): string | null => {
    if (wizardStep === 5) return "Submit application";
    if (wizardStep === 6) return null;
    return "Continue";
  };

  const renderStep = () => {
    switch (wizardStep) {
      case 1:
        return <Step1Program data={wizardData} onUpdate={updateWizardData} />;
      case 2:
        return (
          <Step3EmployeeInfo
            infoCorrect={infoCorrect}
            onInfoCorrectChange={setInfoCorrect}
          />
        );
      case 3:
        return (
          <Step4CourseDetails data={wizardData} onUpdate={updateWizardData} />
        );
      case 4:
        return (
          <Step6Documents
            uploads={uploads}
            setUploads={setUploads}
            programType={wizardData.programType ?? ""}
          />
        );
      case 5:
        return (
          <Step8Review
            data={wizardData}
            uploads={uploads}
            agreed={agreed}
            certified={certified}
            conductAgreed={conductAgreed}
            onAgreedChange={setAgreed}
            onCertifiedChange={setCertified}
            onConductAgreedChange={setConductAgreed}
          />
        );
      case 6:
        return <Step9Success />;
      default:
        return null;
    }
  };

  // Unused import suppression
  void (null as unknown as Document);

  return (
    <div className="flex flex-col h-full bg-background/50 relative">
      {wizardStep < 6 && <WizardProgress step={wizardStep} />}

      <div className="flex-1 overflow-y-auto min-h-0 px-4 py-4 md:px-8 md:py-6 space-y-6">
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
          {renderStep()}

          {wizardStep < 6 && (
            <div className="pt-6 flex flex-col items-center justify-center gap-4 border-t border-slate-200/80 mt-6">
              <div className="flex items-center justify-center gap-4 w-full">
                {wizardStep > 1 && (
                  <Button
                    type="button"
                    onClick={handleBack}
                    className="gap-1.5 h-9 text-xs px-5 rounded-full border-0 font-bold bg-[#E6F0F5] text-[#003769] hover:bg-[#d5e5ee] shadow-xs cursor-pointer"
                    data-ocid="apply.nav.back_button"
                  >
                    <ChevronLeft className="w-4 h-4 text-[#003769]" />
                    <span className="text-[#003769] font-bold">Back</span>
                  </Button>
                )}

                <span className="text-xs font-bold text-[#008573]">
                  Step {wizardStep} of {totalSteps - 1}
                </span>

                {getNextLabel() !== null && (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={!canProceed() || isSubmitting}
                    className="gap-1.5 h-9 text-xs px-6 rounded-full bg-[#003769] hover:bg-[#00274d] text-white font-bold border-0 shadow-xs cursor-pointer"
                    data-ocid="apply.nav.next_button"
                  >
                    <span className="text-white font-bold">
                      {isSubmitting ? "Submitting..." : getNextLabel()}
                    </span>
                    {wizardStep < 5 && !isSubmitting && (
                      <ChevronRight className="w-4 h-4 text-white" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
