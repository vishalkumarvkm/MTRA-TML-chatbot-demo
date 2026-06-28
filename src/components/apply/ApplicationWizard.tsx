"use client";

import { Layout } from "@/components/layout/Layout";
// HealthyME — 9-Step Tuition Reimbursement Application Wizard
import { AIConfidenceBadge } from "@/components/ui/AIConfidenceBadge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { mockEmployees, mockPrograms } from "@/data/mockData";
import { useAppStore } from "@/store/appStore";
import type { Document, ProgramType, WizardData } from "@/types";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  AlertTriangle,
  Brain,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Info,
  Loader2,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Constants ────────────────────────────────────────────────
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
  status: "processing" | "complete" | "error";
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
      <div className="hidden md:flex items-start justify-center gap-0 overflow-x-auto no-scrollbar">
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
                  {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : stepNum}
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

// ─── Step 1: Program Selection ────────────────────────────────
function Step1Program({
  data,
  onUpdate,
}: {
  data: WizardData;
  onUpdate: (d: Partial<WizardData>) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-foreground">
          Select a Program
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Choose the reimbursement program you'd like to apply for. Each program
          has different eligibility requirements and benefit amounts.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockPrograms.map((prog) => {
          const selected = data.programType === prog.programType;
          return (
            <button
              key={prog.id}
              type="button"
              onClick={() =>
                onUpdate({ programType: prog.programType as ProgramType })
              }
              data-ocid={`apply.program_card.${prog.id}`}
              className={[
                "text-left rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-md",
                selected
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border bg-card hover:border-primary/40",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="text-2xl">{prog.icon}</div>
                <div className="flex flex-col items-end gap-0.5">
                  {selected && (
                    <Badge className="bg-primary text-primary-foreground text-[9px] px-1.5 py-0.5">
                      Selected
                    </Badge>
                  )}
                  <span className="text-[10px] text-muted-foreground">Up to</span>
                  <span className="text-base font-bold text-foreground">
                    ${prog.maxAmount.toLocaleString()}
                  </span>
                </div>
              </div>
              <h3 className="text-sm font-bold text-foreground mt-1.5">
                {prog.name}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-normal">
                {prog.description}
              </p>
              <div className="mt-2 space-y-0.5">
                {prog.eligibilityRules.slice(0, 3).map((rule) => (
                  <div key={rule} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-2.5 h-2.5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-[10px] text-muted-foreground leading-tight">
                      {rule}
                    </span>
                  </div>
                ))}
                {prog.eligibilityRules.length > 3 && (
                  <span className="text-[10px] text-muted-foreground">
                    +{prog.eligibilityRules.length - 3} more requirements
                  </span>
                )}
              </div>
              {prog.maxCredits > 0 && (
                <div className="mt-2 pt-2 border-t border-border flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">
                    Max Credits
                  </span>
                  <span className="text-[11px] font-semibold text-foreground">
                    {prog.maxCredits} credits/year
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
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
  const emp = mockEmployees[0];
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
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold font-display text-foreground">
            Employee Information
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Verify your details auto-populated from HRIS.
          </p>
        </div>
        <Badge className="bg-primary/10 text-primary border-primary/20 border text-xs gap-1 flex items-center">
          <Sparkles className="w-3 h-3" /> Auto-filled from HRIS
        </Badge>
      </div>

      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                variant={infoCorrect === "yes" ? "default" : "outline"}
                className="h-9 px-4 font-semibold text-xs"
                onClick={() => onInfoCorrectChange("yes")}
                data-ocid="apply.employee_info.validate.yes"
              >
                Yes, it is correct
              </Button>
              <Button
                type="button"
                variant={infoCorrect === "no" ? "destructive" : "outline"}
                className="h-9 px-4 font-semibold text-xs"
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
              <AlertTitle className="text-sm font-bold">Corrections are made in Workday</AlertTitle>
              <AlertDescription className="text-xs leading-relaxed mt-1">
                Employee record corrections cannot be performed within this portal. Please log in to <strong>Workday</strong> to update your profile. You will not be able to proceed with this application until your official record is correct.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Step 4: Course Details ────────────────────────────────────
function Step4CourseDetails({
  data,
  onUpdate,
}: {
  data: WizardData;
  onUpdate: (d: Partial<WizardData>) => void;
}) {
  const emp = mockEmployees[0];
  const [instQuery, setInstQuery] = useState(data.institution ?? "");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const filteredInst = NY_UNIVERSITIES.filter((u) =>
    u.toLowerCase().includes(instQuery.toLowerCase()),
  );

  const tuition = data.amount ?? 320;
  const fees = 248;
  const textbooks = 185;
  const totalCost = tuition + fees + textbooks;
  const credits = data.credits ?? 6;

  const selectedProg = mockPrograms.find((p) => p.programType === data.programType);
  const showCreditsSlider = selectedProg ? selectedProg.maxCredits > 0 : true;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-foreground">
          Course, Institution & Cost Details
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Complete the details below to submit your reimbursement request.
        </p>
      </div>

      <Card className="bg-muted/40 border-border">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground block">Applicant Name</span>
              <span className="font-semibold text-foreground">{emp.name}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Employee ID</span>
              <span className="font-semibold text-foreground">{emp.employeeId}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Department</span>
              <span className="font-semibold text-foreground">{emp.department}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Job Title</span>
              <span className="font-semibold text-foreground">{emp.title}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Course & Institution Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1 relative">
              <Label htmlFor="institution" className="text-sm font-medium">
                Institution Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="institution"
                value={instQuery}
                onChange={(e) => {
                  setInstQuery(e.target.value);
                  setShowSuggestions(true);
                  onUpdate({ institution: e.target.value });
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="Search institution..."
                autoComplete="off"
                data-ocid="apply.course.institution"
              />
              {showSuggestions &&
                instQuery.length > 0 &&
                filteredInst.length > 0 && (
                  <div className="absolute z-20 top-full mt-1 w-full rounded-lg border border-border bg-popover shadow-lg overflow-hidden">
                    {filteredInst.map((u) => (
                      <button
                        key={u}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                        onMouseDown={() => {
                          setInstQuery(u);
                          onUpdate({ institution: u });
                          setShowSuggestions(false);
                        }}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                )}
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="course-name" className="text-sm font-medium">
                  Course Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="course-name"
                  defaultValue={data.courseTitle ?? ""}
                  placeholder="e.g. Advanced Clinical Nursing Leadership"
                  onChange={(e) => onUpdate({ courseTitle: e.target.value })}
                  data-ocid="apply.course.name"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="course-code" className="text-sm font-medium">
                    Course Code
                  </Label>
                  <Input
                    id="course-code"
                    placeholder="e.g. NUR 604"
                    data-ocid="apply.course.code"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="credits" className="text-sm font-medium">
                    Credit Hours <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="credits"
                    type="number"
                    min={1}
                    max={18}
                    defaultValue={6}
                    data-ocid="apply.course.credit_hours"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="start-date" className="text-sm font-medium">
                    Start Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="start-date"
                    type="date"
                    defaultValue="2026-01-13"
                    data-ocid="apply.course.start_date"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="end-date" className="text-sm font-medium">
                    End Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="end-date"
                    type="date"
                    defaultValue="2026-05-15"
                    data-ocid="apply.course.end_date"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="term" className="text-sm font-medium">
                    Academic Term
                  </Label>
                  <Select defaultValue="spring2026">
                    <SelectTrigger id="term" data-ocid="apply.course.term">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spring2026">Spring 2026</SelectItem>
                      <SelectItem value="summer2026">Summer 2026</SelectItem>
                      <SelectItem value="fall2026">Fall 2026</SelectItem>
                      <SelectItem value="spring2027">Spring 2027</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="course-level" className="text-sm font-medium">
                    Course Level <span className="text-destructive">*</span>
                  </Label>
                  <Select defaultValue="graduate">
                    <SelectTrigger id="course-level" data-ocid="apply.course.level">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="undergraduate">Undergraduate</SelectItem>
                      <SelectItem value="graduate">Graduate</SelectItem>
                      <SelectItem value="professional">Professional / Doctoral</SelectItem>
                      <SelectItem value="certificate">Certificate Program</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="credit-type" className="text-sm font-medium">
                  Credit Type
                </Label>
                <Select defaultValue="academic">
                  <SelectTrigger id="credit-type" data-ocid="apply.course.credit_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic">Academic Credit</SelectItem>
                    <SelectItem value="cme">CME Credit</SelectItem>
                    <SelectItem value="ceu">CEU Credit</SelectItem>
                    <SelectItem value="audit">Audit (No Credit)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Cost Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="tuition-amount" className="text-sm font-medium">
                  Tuition Amount <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    $
                  </span>
                  <Input
                    id="tuition-amount"
                    type="number"
                    min={0}
                    max={emp.tuitionBalance}
                    value={tuition}
                    onChange={(e) =>
                      onUpdate({ amount: Number(e.target.value) })
                    }
                    className="pl-7"
                    data-ocid="apply.tuition.amount_input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Course Fees</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      $
                    </span>
                    <Input
                      defaultValue={fees}
                      className="pl-7 bg-muted/30"
                      readOnly
                      data-ocid="apply.tuition.fees"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Required Textbooks</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      $
                    </span>
                    <Input
                      defaultValue={textbooks}
                      className="pl-7 bg-muted/30"
                      readOnly
                      data-ocid="apply.tuition.textbooks"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/60 border border-border">
                <span className="text-sm font-semibold">Total Program Cost</span>
                <span className="text-lg font-bold text-foreground">
                  ${totalCost.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {showCreditsSlider && (
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  Credits to Apply
                  <Badge variant="outline" className="text-xs">
                    {credits} credits
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Credits used: {emp.creditUsed}/{emp.creditMax}
                  </span>
                  <span className="font-medium text-foreground">
                    Remaining: {emp.creditBalance} credits
                  </span>
                </div>
                <Slider
                  value={[credits]}
                  onValueChange={([v]) => onUpdate({ credits: v })}
                  min={0}
                  max={emp.creditBalance}
                  step={1}
                  className="w-full"
                  data-ocid="apply.tuition.credits_slider"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0 credits</span>
                  <span>{emp.creditBalance} max</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
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
  const [dragging, setDragging] = useState<DocTypeId | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const docTypes = programType === "CMEReimbursement"
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
        status: "processing",
        confidence: 0,
      };
      setUploads((prev) => [
        ...prev.filter((u) => u.docTypeId !== docTypeId),
        newUpload,
      ]);
      setTimeout(() => {
        setUploads((prev) =>
          prev.map((u) =>
            u.id === newUpload.id
              ? {
                  ...u,
                  status: "complete",
                  confidence: 88 + Math.floor(Math.random() * 11),
                  extractedData: {
                    institution: "CUNY Lehman College",
                    amount: "$3,200.00",
                    date: "2026-01-14",
                    studentName: "Maria Santos",
                    term: "Spring 2026",
                  },
                }
              : u,
          ),
        );
      }, 3000);
    },
    [setUploads],
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-foreground">
          Document Upload
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Upload required documents. Our AI will automatically extract and
          verify key information.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {docTypes.map((docType) => {
          const upload = uploads.find((u) => u.docTypeId === docType.id);
          const isDraggingThis = dragging === docType.id;

          return (
            <div key={docType.id} className="space-y-3">
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
                  "relative border-2 border-dashed rounded-xl p-5 text-center transition-all",
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
                <div className="flex flex-col items-center gap-2">
                  <span className="text-2xl">{docType.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {docType.label}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {docType.description}
                    </p>
                  </div>
                  {!upload && (
                    <>
                      <Upload className="w-4 h-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
                        Drag & drop or
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          fileInputRefs.current[docType.id]?.click()
                        }
                        data-ocid={`apply.upload.${docType.id}.upload_button`}
                      >
                        Browse Files
                      </Button>
                    </>
                  )}
                  {docType.required && !upload && (
                    <Badge
                      variant="outline"
                      className="text-[10px] border-destructive/40 text-destructive"
                    >
                      Required
                    </Badge>
                  )}
                </div>
              </div>

              {upload && (
                <Card className="border-border">
                  <CardContent className="pt-3 pb-3">
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

                    {upload.status === "complete" && upload.extractedData && (
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
  const emp = mockEmployees[0];
  const selectedProg = mockPrograms.find(
    (p) => p.programType === data.programType,
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-foreground">
          Review & Submit
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Review your application before submitting. You cannot edit after
          submission.
        </p>
      </div>

      {/* Pre-approval/Eligibility Indicator */}
      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
        <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
          Eligibility Verified: Pre-approved to Proceed based on current HR records.
        </div>
      </div>

      {/* AI Review folded issues */}
      {GAP_ISSUES.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">
            Issues Requiring Attention
          </h3>
          {GAP_ISSUES.map((issue) => (
            <Alert
              key={issue.id}
              variant={issue.severity === "error" ? "destructive" : "default"}
              className={
                issue.severity === "warning"
                  ? "border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800"
                  : ""
              }
              data-ocid={`apply.gap_report.${issue.id}`}
            >
              {issue.severity === "error" ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              )}
              <AlertTitle className="text-sm">{issue.title}</AlertTitle>
              <AlertDescription className="space-y-2">
                <p className="text-xs">{issue.description}</p>
                <div className="flex items-start gap-1.5 mt-1">
                  <Info className="w-3 h-3 mt-0.5 flex-shrink-0 text-blue-500" />
                  <p className="text-xs text-blue-700 dark:text-blue-400">
                    {issue.suggestion}
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Application Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Employee
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Name: </span>
                <span className="font-medium">{emp.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">ID: </span>
                <span className="font-medium">{emp.employeeId}</span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Department: </span>
                <span className="font-medium">{emp.department}</span>
              </div>
            </div>
          </div>
          <Separator />
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Program
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xl">{selectedProg?.icon}</span>
              <span className="font-semibold text-foreground">
                {selectedProg?.name ?? "—"}
              </span>
            </div>
          </div>
          <Separator />
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Course & Institution
            </p>
            <div className="space-y-1 text-sm">
              <div>
                <span className="text-muted-foreground">Institution: </span>
                <span className="font-medium">
                  {data.institution ?? "Not specified"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Course: </span>
                <span className="font-medium">
                  {data.courseTitle ?? "Not specified"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Term: </span>
                <span className="font-medium">Spring 2026</span>
              </div>
            </div>
          </div>
          <Separator />
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Reimbursement
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Tuition: </span>
                <span className="font-medium">
                  ${(data.amount ?? 320).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Credits: </span>
                <span className="font-medium">{data.credits ?? 6} credits</span>
              </div>
            </div>
          </div>
          <Separator />
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Documents ({uploads.filter((u) => u.status === "complete").length}{" "}
              verified)
            </p>
            {uploads.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No documents uploaded
              </p>
            ) : (
              <div className="space-y-1">
                {uploads.map((u) => (
                  <div key={u.id} className="flex items-center gap-2">
                    {u.status === "complete" ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-primary flex-shrink-0" />
                    )}
                    <span className="text-xs text-foreground truncate">
                      {u.fileName}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-5 space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="service-agreement"
              checked={agreed}
              onCheckedChange={(v) => onAgreedChange(Boolean(v))}
              data-ocid="apply.review.service_agreement_checkbox"
            />
            <Label
              htmlFor="service-agreement"
              className="text-sm leading-relaxed cursor-pointer font-bold text-foreground"
            >
              I agree to the Service Agreement requiring 2 years of continued employment (or completion of 18 credits) at Montefiore Health System following reimbursement approval. Failure to comply may result in repayment.
            </Label>
          </div>
          <div className="flex items-start gap-3">
            <Checkbox
              id="code-of-conduct"
              checked={conductAgreed}
              onCheckedChange={(v) => onConductAgreedChange(Boolean(v))}
              data-ocid="apply.review.conduct_checkbox"
            />
            <Label
              htmlFor="code-of-conduct"
              className="text-sm leading-relaxed cursor-pointer font-medium text-foreground"
            >
              I certify that I have read and agree to comply with the Montefiore Health System Code of Conduct in connection with my participation in this educational reimbursement program.
            </Label>
          </div>
          <div className="flex items-start gap-3">
            <Checkbox
              id="certification"
              checked={certified}
              onCheckedChange={(v) => onCertifiedChange(Boolean(v))}
              data-ocid="apply.review.certification_checkbox"
            />
            <Label
              htmlFor="certification"
              className="text-sm leading-relaxed cursor-pointer"
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
    <div className="space-y-8 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full bg-emerald-100 dark:bg-emerald-950/40 animate-ping opacity-30" />
          <div className="relative w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/40 border-2 border-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold font-display text-foreground">
            Application Submitted!
          </h2>
          <p className="text-muted-foreground mt-1">
            Your reimbursement application has been received and is being
            processed.
          </p>
        </div>
      </div>

      <Card className="max-w-md mx-auto border-primary/20 bg-primary/5">
        <CardContent className="pt-5 pb-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Tracking ID
          </p>
          <p
            className="text-2xl font-bold font-mono text-primary"
            data-ocid="apply.success.tracking_id"
          >
            {TRACKING_ID}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Save this ID to track your application status
          </p>
        </CardContent>
      </Card>

      <div className="max-w-md mx-auto text-left space-y-1">
        <h3 className="text-sm font-semibold text-foreground mb-4 text-center">
          What Happens Next
        </h3>
        {SUCCESS_STEPS.map((step, idx) => (
          <div
            key={step.label}
            className="flex items-start gap-3"
            data-ocid={`apply.success.timeline.${idx + 1}`}
          >
            <div className="flex flex-col items-center">
              <div
                className={[
                  "w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                  step.done
                    ? "bg-emerald-500 border-emerald-500"
                    : "bg-card border-border",
                ].join(" ")}
              >
                {step.done ? (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                ) : (
                  <span className="text-xs font-bold text-muted-foreground">
                    {idx + 1}
                  </span>
                )}
              </div>
              {idx < SUCCESS_STEPS.length - 1 && (
                <div className="w-0.5 h-8 bg-border" />
              )}
            </div>
            <div className="pt-0.5 pb-4">
              <p className="text-sm font-semibold text-foreground">
                {step.label}
              </p>
              <p className="text-xs text-muted-foreground">{step.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link href="/applications">
          <Button data-ocid="apply.success.view_applications_button">
            View My Applications
          </Button>
        </Link>
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          data-ocid="apply.success.download_button"
        >
          <Download className="w-4 h-4" />
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
        return infoCorrect === "yes";
      case 3:
        return Boolean(wizardData.institution && wizardData.courseTitle && (wizardData.amount ?? 0) > 0);
      case 4:
        return true;
      case 5:
        return agreed && certified && conductAgreed;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (wizardStep === totalSteps) {
      router.push("/");
    } else {
      if (canProceed()) setWizardStep(wizardStep + 1);
    }
  };

  const handleBack = () => {
    if (wizardStep > 1) setWizardStep(wizardStep - 1);
  };

  const getNextLabel = (): string | null => {
    if (wizardStep === 5) return "Submit Application";
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
    <div className="flex flex-col h-full bg-background/50">
      {wizardStep < 6 && <WizardProgress step={wizardStep} />}

      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-5xl mx-auto px-4 py-6 md:px-8 md:py-10">
          {renderStep()}
        </div>
      </div>

      {wizardStep < 6 && (
        <div className="bg-background/80 backdrop-blur-md border-t border-border px-4 py-2.5 md:px-8 flex items-center justify-between flex-shrink-0 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-3">
            {wizardStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="gap-1 h-8 text-[11px] px-3"
                data-ocid="apply.nav.back_button"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[11px] font-medium text-muted-foreground">
              Step {wizardStep} <span className="hidden sm:inline">of {totalSteps - 1}</span>
            </span>
            {getNextLabel() !== null && (
              <Button
                type="button"
                onClick={handleNext}
                disabled={!canProceed()}
                className="gap-1 h-8 text-[11px] px-4 shadow-sm"
                data-ocid="apply.nav.next_button"
              >
                <span className="font-semibold">{getNextLabel()}</span>
                {wizardStep < 5 && <ChevronRight className="w-3.5 h-3.5" />}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
