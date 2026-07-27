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
import type { CourseEntry, Document, ProgramType, WizardData } from "@/types";
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
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
                "text-left rounded-lg border-2 p-3 transition-all duration-200 hover:shadow-md h-[120px] flex flex-col justify-between",
                selected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border bg-card hover:border-primary/40",
              ].join(" ")}
            >
              <div className="w-full">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-xl">{prog.icon}</div>
                  <div className="flex flex-col items-end gap-0">
                    {selected && (
                      <Badge className="bg-primary text-primary-foreground text-[8px] h-3.5 px-1 py-0 justify-center">
                        Selected
                      </Badge>
                    )}
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-[9px] text-muted-foreground">
                        Up to
                      </span>
                      <span className="text-sm font-bold text-foreground">
                        ${prog.maxAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <h3 className="text-xs font-bold text-foreground mt-1 leading-tight">
                  {prog.name}
                </h3>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-normal line-clamp-2">
                  {prog.description}
                </p>
              </div>
              {prog.maxCredits > 0 && (
                <div className="mt-1.5 pt-1 border-t border-border flex items-center justify-between w-full">
                  <span className="text-[9px] text-muted-foreground">
                    Max Credits
                  </span>
                  <span className="text-[10px] font-semibold text-foreground">
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
  const emp = mockEmployees[0];
  const courses = data.courses && data.courses.length > 0 ? data.courses : [];
  const [courseToRemove, setCourseToRemove] = useState<{
    id: string;
    index: number;
  } | null>(null);

  // Initialize course if list is empty
  useEffect(() => {
    if (!data.courses || data.courses.length === 0) {
      onUpdate({
        courses: [
          {
            id: `course-${Date.now()}`,
            courseTitle: data.courseTitle ?? "",
            courseCode: "",
            institution: data.institution ?? "CUNY Lehman College",
            credits: data.credits ?? 6,
            amount: data.amount ?? 320,
            startDate: "2026-01-13",
            endDate: "2026-05-15",
            term: "spring2026",
            level: "graduate",
            creditType: "academic",
            gradeReceived: "In Progress",
          },
        ],
      });
    }
  }, []);

  const addCourse = () => {
    if (courses.length >= 6) return;
    const newCourse = {
      id: `course-${Date.now()}-${Math.random()}`,
      courseTitle: "",
      courseCode: "",
      institution: "CUNY Lehman College",
      credits: 3,
      amount: 320,
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
  const totalWithYtdCredits = totalCredits + emp.creditUsed;
  const showCreditCapWarning = totalWithYtdCredits > 18;

  const showInProgressWarning = courses.some(
    (c) => c.gradeReceived === "In Progress" || c.gradeReceived === "Enrolled",
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-foreground">
          Course, Institution & Cost Details
        </h2>
        <p className="text-sm text-muted-foreground mt-1 font-body">
          Complete the details below to submit your reimbursement request. You
          can add up to 6 courses per application.
        </p>
      </div>

      {/* Applicant Card */}
      <Card className="bg-muted/40 border-border">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-body">
            <div>
              <span className="text-muted-foreground block">
                Applicant Name
              </span>
              <span className="font-semibold text-foreground">{emp.name}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Employee ID</span>
              <span className="font-semibold text-foreground">
                {emp.employeeId}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">Department</span>
              <span className="font-semibold text-foreground">
                {emp.department}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">Job Title</span>
              <span className="font-semibold text-foreground">{emp.title}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warning Banners */}
      {showCreditCapWarning && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-lg text-xs space-y-1 font-body">
          <span className="font-bold block">Credit Cap Warning</span>
          Warning: Total credit hours across all courses in this application +
          YTD used credits ({totalWithYtdCredits} credits) exceeds 18-credit
          cap.
        </div>
      )}

      {showInProgressWarning && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-lg text-xs space-y-1 font-body">
          <span className="font-bold block">Tier 1 SOP Checklist Warning</span>
          Warning: Application contains in-progress or enrolled courses. Final
          reimbursement depends on grade verification.
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
            <CardContent className="space-y-4">
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
                    value={course.institution}
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
                    value={course.gradeReceived ?? "In Progress"}
                    onValueChange={(val) =>
                      updateCourseField(course.id, "gradeReceived", val)
                    }
                  >
                    <SelectTrigger
                      id={`grade-${course.id}`}
                      data-ocid={`apply.course.grade-${index}`}
                    >
                      <SelectValue />
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
            variant="outline"
            onClick={addCourse}
            className="border-[#008573] text-[#008573] hover:bg-[#ebf3ef] font-semibold text-xs py-2 px-4 rounded-md font-body"
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
      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
        <span className="text-xs font-bold text-slate-700 font-body">
          Total Credit Hours: {totalCredits} | Total Tuition Amount: $
          {totalTuition.toLocaleString()}
        </span>
        <span className="text-xs text-muted-foreground font-body">
          YTD Credits Used: {emp.creditUsed} / {emp.creditMax}
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
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs font-bold shrink-0 shadow-sm border-primary/20 text-primary hover:bg-primary/5 px-3 rounded-none"
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
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold font-display text-foreground">
          Review & Submit
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Review your application before submitting. You cannot edit after
          submission.
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
                {emp.name}{" "}
                <span className="text-muted-foreground font-normal">
                  ({emp.employeeId})
                </span>
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                {emp.department}
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
        if (wizardData.courses && wizardData.courses.length > 0) {
          return wizardData.courses.every(
            (c) =>
              c.courseTitle.trim() !== "" &&
              c.institution.trim() !== "" &&
              c.credits > 0 &&
              c.amount >= 0,
          );
        }
        return Boolean(
          wizardData.institution &&
            wizardData.courseTitle &&
            (wizardData.amount ?? 0) > 0,
        );
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
              Step {wizardStep}{" "}
              <span className="hidden sm:inline">of {totalSteps - 1}</span>
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
