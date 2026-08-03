"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  DollarSign,
  ExternalLink,
  FileText,
  FileUp,
  GraduationCap,
  History,
  Info,
  Layers,
  MessageSquarePlus,
  Mic,
  MoreVertical,
  Plus,
  RefreshCw,
  School,
  Search,
  Send,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string | React.ReactNode;
  timestamp: string;
  showLabel?: boolean;
  actions?: { label: string; icon: any; action: () => void }[];
};

const STEPS = [
  "Program",
  "Eligibility",
  "Employee Info",
  "Course Details",
  "Tuition & Credits",
  "Documents",
  "AI Review",
  "Review & Submit",
  "Confirmation",
];

const PROGRAMS = [
  {
    id: "regular",
    name: "Employee Tuition Reimbursement",
    cap: "$3,000 / 18 credits",
    eligible: "All Employees & NYSNA",
  },
  {
    id: "cme",
    name: "Continuing Medical Education (CME) Reimbursement for Physician Assistants and Weiler Physical Therapists",
    cap: "Dept Budget",
    eligible: "PAs & Non-Union PTs",
  },
  {
    id: "mmc",
    name: "Scholarship Program for Children of MMC Employees",
    cap: "$500 (Need-based)",
    eligible: "Children of Employees",
  },
  {
    id: "dependent",
    name: "Tuition Reimbursement for Children of Physicians, Scientists and Executives",
    cap: "$4,000–$6,000",
    eligible: "Docs/Scientists/Execs",
  },
];

const INSTITUTIONS = [
  "Albert Einstein College of Medicine",
  "Columbia University",
  "New York University (NYU)",
  "Fordham University",
  "Lehman College (CUNY)",
  "Hunter College (CUNY)",
  "Manhattan College",
];

const SUGGESTED_PROMPTS = [
  {
    id: "new_claim",
    label: "Start reimbursement application",
    icon: DollarSign,
  },
  { id: "status", label: "Check application status", icon: Clock },
  { id: "payroll", label: "Payroll and pay stubs", icon: CreditCard },
  { id: "leave", label: "Apply for leave", icon: Briefcase },
  { id: "policy", label: "Reimbursement policy", icon: FileText },
];

const RECENT_CLAIMS = [
  {
    id: "TR-88291",
    date: "May 10, 2026",
    amount: "$2,450.00",
    status: "In Review",
    color: "text-blue-600 bg-blue-50",
  },
  {
    id: "TR-77120",
    date: "April 15, 2026",
    amount: "$1,200.00",
    status: "Processed",
    color: "text-green-600 bg-green-50",
  },
];

const PAYSTUBS = [
  {
    id: "PAY-221",
    date: "Apr 30, 2026",
    amount: "$4,820.10",
    net: "$3,450.22",
  },
  {
    id: "PAY-219",
    date: "Apr 15, 2026",
    amount: "$4,820.10",
    net: "$3,450.22",
  },
];

const CalendarView = ({ onSelect }: { onSelect: (date: string) => void }) => {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="p-3 sm:p-3.5 bg-white rounded-2xl border border-slate-100 shadow-xl w-full"
    >
      <div className="flex items-center justify-between mb-4 px-1">
        <h4 className="text-[12px] sm:text-[13px] font-bold text-slate-800">
          May 2026
        </h4>
        <div className="flex gap-2">
          <button className="p-1 hover:bg-slate-50 rounded text-slate-400 transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 hover:bg-slate-50 rounded text-slate-400 transition-colors">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
          <div
            key={d}
            className="text-[9px] font-bold text-slate-400 text-center uppercase tracking-tighter"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array(5)
          .fill(null)
          .map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
        {days.map((d) => (
          <button
            key={d}
            onClick={() => onSelect(`May ${d}, 2026`)}
            className={cn(
              "aspect-square rounded-lg text-[9px] sm:text-[10px] font-bold transition-all flex items-center justify-center",
              d === 15
                ? "bg-[#003769] text-white shadow-md shadow-blue-100"
                : "hover:bg-indigo-50 text-slate-600",
            )}
          >
            {d}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default function AIAssistant({
  isOpen,
  setIsOpen,
}: { isOpen: boolean; setIsOpen: (val: boolean) => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setIsTyping(true);
      const timer = setTimeout(() => {
        setMessages([
          {
            id: Math.random().toString(36).substr(2, 9),
            role: "assistant",
            content:
              "Welcome to your **Montefiore Employee HR Hub**! I'm here to help you manage your **Reimbursements**, view **Payroll & Paystubs**, or apply for **Leave**. How can I assist you today?",
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            showLabel: true,
          },
        ]);
        setIsTyping(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [messages.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addAssistantMessage = (
    content: string | React.ReactNode,
    delay = 1000,
    actions?: { label: string; icon: any; action: () => void }[],
  ) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substr(2, 9),
          role: "assistant",
          content,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          showLabel: true,
          actions,
        },
      ]);
      setIsTyping(false);
    }, delay);
  };

  const addUserMessage = (text: string) => {
    const userMsg: Message = {
      id: Math.random().toString(36).substr(2, 9),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      showLabel: true,
    };
    setMessages((prev) => [...prev, userMsg]);
  };

  const handleNewChat = () => {
    setInputValue("");
    setMessages([]);
    setCurrentStep(null);
    setSelectedProgram(null);
    setShowMenu(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      addUserMessage(`Uploading ${file.name}...`);
      setTimeout(() => {
        addAssistantMessage(
          <div className="space-y-3 w-full">
            <div className="flex items-center gap-2 text-green-600 font-bold text-[9px] bg-green-50 p-2 rounded-lg border border-green-100 w-full">
              <CheckCircle2 className="w-3 h-3" />
              FILE UPLOADED: {file.name.toUpperCase()}
            </div>
            <p className="text-[12px] text-slate-600 font-medium leading-relaxed">
              Document received. Would you like to upload more or proceed to
              review?
            </p>
            <div className="flex gap-2 w-full">
              <button
                onClick={() => triggerUpload()}
                className="flex-1 px-3 py-2.5 rounded-xl bg-white text-slate-600 text-[13px] font-semibold border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
              >
                Upload another
              </button>
              <button
                onClick={() => {
                  addUserMessage("Continue to review");
                  handleStepUpdate(6);
                }}
                className="flex-1 px-3 py-2.5 rounded-xl bg-indigo-50 text-[#003769] text-[13px] font-semibold border border-indigo-100 hover:bg-indigo-100 transition-colors shadow-sm"
              >
                Continue to review
              </button>
            </div>
          </div>,
        );
      }, 1500);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleStepUpdate = (nextStep: number, programId?: string) => {
    setTimeout(() => {
      setCurrentStep(nextStep);
      if (programId) setSelectedProgram(programId);

      const program = PROGRAMS.find(
        (p) => p.id === (programId || selectedProgram),
      );
      let botResponse: React.ReactNode = "";

      const ActionButtons = ({
        options,
      }: { options: { label: string; action?: () => void }[] }) => (
        <div className="flex flex-wrap gap-2 mt-3 w-full">
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={() => {
                if (opt.action) opt.action();
                else {
                  addUserMessage(opt.label);
                  handleStepUpdate(nextStep + 1);
                }
              }}
              className="flex-1 min-w-[120px] px-3 py-2.5 rounded-xl bg-indigo-50 text-[#003769] text-[13px] font-semibold hover:bg-indigo-100 transition-colors border border-indigo-100 shadow-sm active:scale-95 tracking-[0.01em]"
            >
              {opt.label}
            </button>
          ))}
        </div>
      );

      const MarkdownContent = ({ children }: { children: string }) => (
        <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-p:my-0 prose-strong:text-inherit prose-strong:font-bold w-full text-[12.5px] sm:text-[13px]">
          <ReactMarkdown>{children}</ReactMarkdown>
        </div>
      );

      switch (nextStep) {
        case 1:
          botResponse = (
            <div className="w-full">
              <MarkdownContent>
                {`Step 2: **Eligibility Check**. For **${program?.name}**, you must be a full-time employee with at least ${program?.id === "mmc" ? "3 years" : "6 months"} of tenure. Do you meet these requirements?`}
              </MarkdownContent>
              <ActionButtons
                options={[
                  { label: "Yes, I meet them" },
                  { label: "No, I don't" },
                  {
                    label: "Check policy",
                    action: () => {
                      addUserMessage("Check policy");
                      addAssistantMessage(
                        "You can view the full policy [here](https://example.com/policy).",
                      );
                    },
                  },
                ]}
              />
            </div>
          );
          break;
        case 2:
          botResponse = (
            <div className="w-full">
              <MarkdownContent>
                Step 3: **Employee Info**. I've pulled your profile. Please
                confirm your Department and Employee ID.
              </MarkdownContent>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mt-2 space-y-1 shadow-inner text-slate-700 w-full text-[12px]">
                <p className="text-[9px] font-bold text-slate-400 uppercase">
                  Profile Data
                </p>
                <p className="text-xs font-semibold">Dept: Engineering (IT)</p>
                <p className="text-xs font-semibold">ID: EMP-99281</p>
              </div>
              <ActionButtons
                options={[
                  { label: "Confirm and continue" },
                  { label: "Update info" },
                ]}
              />
            </div>
          );
          break;
        case 3:
          botResponse = (
            <div className="w-full">
              <MarkdownContent>
                Step 4: **Course Details**. What is the name of the
                course/program and the accredited institution?
              </MarkdownContent>
              <ActionButtons
                options={[
                  {
                    label: "Search institution",
                    action: () => {
                      addUserMessage("Search institution");
                      addAssistantMessage(
                        <div className="space-y-3 w-full">
                          <p className="text-[12px] font-semibold text-slate-600">
                            Please select your institution from the list below:
                          </p>
                          <div className="grid grid-cols-1 gap-1.5 w-full">
                            {INSTITUTIONS.map((inst) => (
                              <button
                                key={inst}
                                onClick={() => {
                                  addUserMessage(inst);
                                  handleStepUpdate(4);
                                }}
                                className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/50 text-left transition-all w-full"
                              >
                                <School className="w-3 h-3 text-indigo-500" />
                                <span className="text-[10px] font-medium text-slate-700">
                                  {inst}
                                </span>
                              </button>
                            ))}
                          </div>
                          <button
                            onClick={() => {
                              addUserMessage("Manual Entry");
                              handleStepUpdate(4);
                            }}
                            className="text-[9px] font-bold text-indigo-600 hover:underline px-1"
                          >
                            Or enter manually
                          </button>
                        </div>,
                      );
                    },
                  },
                  { label: "Manual Entry" },
                ]}
              />
            </div>
          );
          break;
        case 4:
          botResponse = (
            <div className="w-full">
              <MarkdownContent>
                {`Step 5: **Tuition & Credits**. Please enter the total amount. Note: **IRS §127** allows up to **$5,250** tax-free per year. ${program?.id === "regular" ? "Your cap is **$3,000 / 18 credits**." : ""}`}
              </MarkdownContent>
              <ActionButtons
                options={[
                  { label: "Enter amount" },
                  { label: "Calculate tax impact" },
                ]}
              />
            </div>
          );
          break;
        case 5:
          botResponse = (
            <div className="w-full">
              <MarkdownContent>
                Step 6: **Documents**. Please upload your enrollment receipt and
                course syllabus.
              </MarkdownContent>
              <div className="grid grid-cols-2 gap-2 mt-2 w-full">
                <button
                  onClick={triggerUpload}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group active:scale-95 w-full"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
                    Receipt
                  </span>
                </button>
                <button
                  onClick={triggerUpload}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group active:scale-95 w-full"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
                    Syllabus
                  </span>
                </button>
              </div>
              <ActionButtons
                options={[
                  { label: "Continue to review" },
                  { label: "I'll do it later" },
                ]}
              />
            </div>
          );
          break;
        case 6:
          botResponse = (
            <div className="w-full">
              <MarkdownContent>
                Step 7: **AI Review**. I'm now reviewing your submission against
                Montefiore policy rules...
              </MarkdownContent>
              <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 mt-3 w-full">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-[9px] mb-3">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  ANALYZING COMPLIANCE...
                </div>
                <div className="space-y-2 opacity-60 w-full text-[12px]">
                  <div className="flex items-center gap-2 font-medium text-slate-600">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    Eligibility verified
                  </div>
                  <div className="flex items-center gap-2 font-medium text-slate-600">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    Credits within limit (18)
                  </div>
                </div>
              </div>
              <ActionButtons options={[{ label: "Proceed to final step" }]} />
            </div>
          );
          break;
        case 7:
          botResponse = (
            <div className="w-full">
              <MarkdownContent>
                Step 8: **Review & Submit**. Please review your summary. A
                service agreement will be sent for e-signature via DocuSign.
              </MarkdownContent>
              <div className="mt-3 space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-100 text-slate-700 shadow-inner w-full text-[12px]">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold uppercase tracking-tighter">
                    Program
                  </span>
                  <span className="font-bold">
                    {program?.name || "Employee Tuition Reimbursement"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold uppercase tracking-tighter">
                    Amount
                  </span>
                  <span className="font-bold">$2,450.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold uppercase tracking-tighter">
                    Tax Status
                  </span>
                  <span className="font-bold text-green-600 text-[9px] bg-green-100 px-1.5 py-0.5 rounded-full">
                    EXEMPT
                  </span>
                </div>
              </div>
              <ActionButtons
                options={[
                  { label: "Submit application" },
                  { label: "Edit details" },
                ]}
              />
            </div>
          );
          break;
        case 8:
          botResponse = (
            <div className="w-full">
              <MarkdownContent>
                Step 9: **Confirmation**. Your application has been submitted!
                Claim ID: #TR-88291.
              </MarkdownContent>
              <div className="bg-green-50 p-4 rounded-xl border border-green-100 mt-3 flex items-center gap-3 w-full">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg shadow-green-100">
                  <Check className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-[12px] font-bold text-green-800 uppercase tracking-tight">
                    Success!
                  </p>
                  <p className="text-[10px] text-green-700 font-medium">
                    Notification sent to Payroll Team.
                  </p>
                </div>
              </div>
              <ActionButtons
                options={[
                  {
                    label: "View my claims",
                    action: () => {
                      addUserMessage("View my claims");
                      setCurrentStep(null);
                      handleSend("Check status");
                    },
                  },
                  {
                    label: "New application",
                    action: () => {
                      addUserMessage("Start new application");
                      setCurrentStep(0);
                      handleStartApplication();
                    },
                  },
                ]}
              />
            </div>
          );
          break;
      }

      addAssistantMessage(botResponse, 1000);
    }, 300);
  };

  const handleStartApplication = () => {
    setCurrentStep(0);
    addAssistantMessage(
      <div className="space-y-3 w-full">
        <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-p:my-0 prose-strong:text-inherit prose-strong:font-bold w-full text-[12.5px] sm:text-[13px]">
          <ReactMarkdown>
            Great! Let's start with Step 1: **Program Selection**. Which
            Montefiore program are you applying for?
          </ReactMarkdown>
        </div>
        <div className="grid grid-cols-1 gap-2 w-full">
          {PROGRAMS.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                addUserMessage(p.name);
                handleStepUpdate(1, p.id);
              }}
              className="flex flex-col items-start p-3 rounded-xl border border-slate-100 bg-white hover:border-[#003769] hover:bg-slate-50 transition-all text-left group shadow-sm active:scale-[0.98] w-full"
            >
              <span className="text-[10px] sm:text-[11px] font-bold text-[#003769] group-hover:translate-x-1 transition-transform flex items-center gap-2 uppercase tracking-wide">
                {p.name} <ArrowRight className="w-3 h-3" />
              </span>
              <span className="text-[9px] sm:text-[10px] text-slate-500 font-medium">
                {p.cap} • {p.eligible}
              </span>
            </button>
          ))}
        </div>
      </div>,
    );
  };

  const handleSend = (text: string = inputValue) => {
    if (!text.trim()) return;

    addUserMessage(text);
    setInputValue("");

    const lowerText = text.toLowerCase();

    const taskActions = [
      {
        label: "Reimbursement",
        icon: DollarSign,
        action: () => {
          addUserMessage("Start Reimbursement Application");
          handleStartApplication();
        },
      },
      {
        label: "Payroll",
        icon: CreditCard,
        action: () => handleSend("Payroll & Paystubs"),
      },
    ];

    if (lowerText.includes("start") || lowerText.includes("new application")) {
      setTimeout(() => {
        handleStartApplication();
      }, 500);
    } else if (
      lowerText.includes("status") ||
      lowerText.includes("check status")
    ) {
      setTimeout(() => {
        addAssistantMessage(
          <div className="space-y-4 w-full">
            <p className="text-[11px] font-bold text-slate-800 uppercase tracking-tight text-left">
              Recent Applications
            </p>
            <div className="space-y-2 w-full">
              {RECENT_CLAIMS.map((claim) => (
                <div
                  key={claim.id}
                  className="p-3 rounded-xl border border-slate-100 bg-white shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all w-full"
                >
                  <div className="space-y-0.5 text-left">
                    <p className="text-[10px] sm:text-[11px] font-bold text-[#003769]">
                      {claim.id}
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">
                      {claim.date} • {claim.amount}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "text-[8px] sm:text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter whitespace-nowrap",
                      claim.color,
                    )}
                  >
                    {claim.status}
                  </span>
                </div>
              ))}
            </div>
            <button className="w-full py-2 bg-slate-50 rounded-lg text-[9px] font-bold text-slate-500 hover:bg-slate-100 transition-colors tracking-wide border border-slate-200">
              View all claims
            </button>
          </div>,
          500,
          taskActions,
        );
      }, 500);
    } else if (
      lowerText.includes("payroll") ||
      lowerText.includes("paystubs")
    ) {
      setTimeout(() => {
        addAssistantMessage(
          <div className="space-y-4 w-full">
            <p className="text-[11px] font-bold text-slate-800 uppercase tracking-tight text-left">
              Payroll Services
            </p>
            <div className="grid grid-cols-1 gap-2 w-full">
              {PAYSTUBS.map((stub) => (
                <div
                  key={stub.id}
                  className="p-3 rounded-xl border border-slate-100 bg-white shadow-sm hover:border-indigo-200 transition-all group flex items-center justify-between w-full"
                >
                  <div className="space-y-0.5 text-left">
                    <p className="text-[10px] sm:text-[11px] font-bold text-slate-800">
                      {stub.date}
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                      Gross: {stub.amount} • Net: {stub.net}
                    </p>
                  </div>
                  <button className="p-2 hover:bg-indigo-50 rounded-lg text-indigo-600 transition-colors">
                    <FileText className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 w-full">
              <button className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-all w-full">
                <History className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">
                  W-2 Forms
                </span>
              </button>
              <button className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-all w-full">
                <Info className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">
                  Direct Deposit
                </span>
              </button>
            </div>
          </div>,
          500,
          taskActions,
        );
      }, 500);
    } else if (
      lowerText.includes("leave") ||
      lowerText.includes("apply leave")
    ) {
      setTimeout(() => {
        addAssistantMessage(
          <div className="space-y-4 w-full">
            <div className="bg-indigo-900 text-white p-4 rounded-xl shadow-lg relative overflow-hidden w-full text-left">
              <div className="relative z-10">
                <p className="text-[9px] font-bold text-indigo-200 uppercase tracking-widest mb-1">
                  Available Balance
                </p>
                <h3 className="text-xl sm:text-2xl font-bold">14.5 Days</h3>
                <p className="text-[9px] text-indigo-300 font-medium mt-1 uppercase tracking-tight">
                  Paid Time Off (PTO)
                </p>
              </div>
              <Briefcase className="absolute -right-4 -bottom-4 w-20 h-20 sm:w-24 sm:h-24 text-indigo-800 opacity-50" />
            </div>
            <div className="grid grid-cols-1 gap-2 w-full">
              {[
                "Vacation/Personal",
                "Sick Leave",
                "FMLA Request",
                "Bereavement",
              ].map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    addUserMessage(type);
                    addAssistantMessage(
                      <div className="space-y-4 w-full text-left">
                        <p className="text-[12px] font-semibold text-slate-600 italic leading-relaxed">
                          Excellent choice. You've selected **{type}**. When
                          would you like this leave to begin?
                        </p>
                        <div
                          onClick={() => {
                            addAssistantMessage(
                              <CalendarView
                                onSelect={(date) => {
                                  addUserMessage(`Select ${date}`);
                                  addAssistantMessage(
                                    <div className="space-y-4 w-full text-left">
                                      <div className="p-3 sm:p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center gap-3 w-full">
                                        <div className="w-10 h-10 bg-[#003769] rounded-lg shadow-sm flex items-center justify-center text-white shrink-0">
                                          <Calendar className="w-5 h-5" />
                                        </div>
                                        <div className="text-left overflow-hidden">
                                          <span className="block text-[9px] font-bold text-[#003769] uppercase tracking-tighter">
                                            Schedule Set
                                          </span>
                                          <span className="text-[13px] font-bold text-slate-900 italic truncate">
                                            {date}
                                          </span>
                                        </div>
                                      </div>
                                      <p className="text-[12px] text-slate-600 font-medium leading-relaxed">
                                        Perfect. I've set your start date to **
                                        {date}**. Would you like to proceed to
                                        confirmation?
                                      </p>
                                      <button
                                        onClick={() => {
                                          addUserMessage(
                                            "Confirm Leave Schedule",
                                          );
                                          addAssistantMessage(
                                            <div className="space-y-3 w-full text-left">
                                              <div className="p-3 sm:p-4 bg-green-50 rounded-xl border border-green-100 flex items-center gap-3 w-full">
                                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white shrink-0">
                                                  <Check className="w-4 h-4" />
                                                </div>
                                                <div className="overflow-hidden">
                                                  <p className="text-[10px] font-bold text-green-800 uppercase tracking-tight">
                                                    Request Drafted
                                                  </p>
                                                  <p className="text-[9px] text-green-600 font-medium truncate">
                                                    Claim ID: #LV-44910
                                                  </p>
                                                </div>
                                              </div>
                                              <p className="text-[12px] text-slate-600 leading-relaxed">
                                                Your request for **{type}** has
                                                been successfully drafted and
                                                saved to your profile. Would you
                                                like to submit it for approval
                                                now?
                                              </p>
                                              <div className="flex flex-col sm:flex-row gap-2 w-full">
                                                <button
                                                  onClick={() =>
                                                    handleSend(
                                                      "Submit for Approval",
                                                    )
                                                  }
                                                  className="flex-1 py-3 bg-[#003769] text-white rounded-xl text-[10px] font-bold tracking-wide shadow-lg active:scale-95 transition-all"
                                                >
                                                  Submit now
                                                </button>
                                                <button
                                                  onClick={() =>
                                                    addUserMessage(
                                                      "Save for later",
                                                    )
                                                  }
                                                  className="flex-1 py-3 bg-white text-slate-600 border border-slate-200 rounded-xl text-[10px] font-bold tracking-wide active:scale-95 transition-all"
                                                >
                                                  Save for later
                                                </button>
                                              </div>
                                            </div>,
                                          );
                                        }}
                                        className="w-full py-3 bg-[#003769] text-white rounded-xl text-[10px] font-bold tracking-wide shadow-xl shadow-blue-900/10 hover:scale-[1.01] active:scale-[0.98] transition-all"
                                      >
                                        Proceed to confirmation
                                      </button>
                                    </div>,
                                  );
                                }}
                              />,
                            );
                          }}
                          className="p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between group cursor-pointer hover:bg-slate-100 transition-all w-full shadow-inner active:scale-[0.98]"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center shrink-0">
                              <Calendar className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div className="text-left overflow-hidden">
                              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                Start Date
                              </span>
                              <span className="text-[12px] font-bold text-slate-700 truncate">
                                Select From Calendar
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors shrink-0" />
                        </div>
                        <button className="w-full py-3 bg-[#003769] text-white rounded-xl text-[10px] font-bold tracking-wide shadow-xl shadow-blue-900/10 opacity-50 cursor-not-allowed">
                          Proceed to confirmation
                        </button>
                      </div>,
                    );
                  }}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white hover:border-indigo-300 transition-all group w-full"
                >
                  <span className="text-[11px] font-bold text-slate-700">
                    {type}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                </button>
              ))}
            </div>
          </div>,
        );
      }, 500);
    } else if (
      lowerText.includes("submit for approval") ||
      lowerText.includes("submit now")
    ) {
      setTimeout(() => {
        addAssistantMessage(
          <div className="space-y-4 w-full text-center">
            <div className="bg-green-50 p-6 rounded-2xl border border-green-100 flex flex-col items-center w-full">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white mb-4 shadow-lg shadow-green-100">
                <Check className="w-8 h-8" />
              </div>
              <h4 className="text-[16px] font-bold text-green-900 uppercase tracking-tight">
                Request Submitted!
              </h4>
              <p className="text-[12px] text-green-700 font-medium mt-1 leading-relaxed px-2">
                Your leave request **#LV-44910** has been successfully sent for
                approval.
              </p>
              <div className="mt-6 flex items-center gap-2 text-[9px] font-bold text-green-600 bg-white px-3 py-1.5 rounded-full border border-green-100 shadow-sm">
                <Clock className="w-3.5 h-3.5" /> EST. APPROVAL: 24-48 HOURS
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
              <button
                onClick={() => handleSend("Check status")}
                className="w-full py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-[13px] font-semibold tracking-[0.01em] hover:bg-slate-50 transition-all"
              >
                Track status
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-3 bg-[#003769] text-white rounded-xl text-[13px] font-semibold tracking-[0.01em] shadow-lg shadow-blue-100 hover:bg-blue-800 transition-all"
              >
                Done
              </button>
            </div>
          </div>,
          500,
          [
            {
              label: "Reimbursement",
              icon: DollarSign,
              action: () => {
                addUserMessage("Start reimbursement application");
                handleStartApplication();
              },
            },
            {
              label: "Payroll",
              icon: CreditCard,
              action: () => handleSend("Payroll and pay stubs"),
            },
          ],
        );
      }, 500);
    } else if (
      lowerText.includes("policy") ||
      lowerText.includes("guidelines")
    ) {
      setTimeout(() => {
        addAssistantMessage(
          <div className="space-y-4 w-full">
            <div className="p-4 rounded-xl bg-[#003769] text-white shadow-lg w-full text-left">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-blue-200" />
                <h4 className="text-[11px] font-bold uppercase tracking-widest">
                  Policy Overview
                </h4>
              </div>
              <ul className="space-y-2 w-full">
                <li className="flex items-start gap-2 text-[11px] font-medium leading-relaxed">
                  <Check className="w-3 h-3 text-blue-300 shrink-0 mt-0.5" />
                  <span>Up to **$3,000** per year for tuition.</span>
                </li>
                <li className="flex items-start gap-2 text-[11px] font-medium leading-relaxed">
                  <Check className="w-3 h-3 text-blue-300 shrink-0 mt-0.5" />
                  <span>Max **18 credits** annually.</span>
                </li>
                <li className="flex items-start gap-2 text-[11px] font-medium leading-relaxed">
                  <Check className="w-3 h-3 text-blue-300 shrink-0 mt-0.5" />
                  <span>**IRS §127** threshold: $5,250.</span>
                </li>
              </ul>
            </div>
            <button className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 transition-all w-full text-left">
              <span className="text-[11px] font-bold text-slate-700 truncate">
                Full Policy Document (PDF)
              </span>
              <ArrowUpRight className="w-3 h-3 text-slate-400 shrink-0" />
            </button>
          </div>,
          500,
          taskActions,
        );
      }, 500);
    } else if (currentStep !== null) {
      if (currentStep < STEPS.length - 1) {
        handleStepUpdate(currentStep + 1);
      }
    } else {
      addAssistantMessage(
        "I'm here to help with your reimbursement. You can start a new application, check your status, or ask about policy guidelines.",
      );
    }
  };

  return (
    <AnimatePresence>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileUpload}
      />
      {!isOpen ? (
        <motion.button
          key="trigger"
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 w-24 h-24 sm:w-28 sm:h-28 bg-[#003769] rounded-full shadow-2xl hover:shadow-[0_8px_30px_rgba(0,55,105,0.25)] flex flex-col items-center justify-center text-white hover:scale-105 active:scale-95 transition-all z-[100] border-2 border-white/20 group"
        >
          <div className="flex flex-col items-center justify-center text-center font-bold leading-[1.2] text-[8.5px] sm:text-[10px] tracking-wider select-none px-2 uppercase">
            <span>Ask Your</span>
            <span>Tuition</span>
            <span>Navigation</span>
            <span>Agent</span>
          </div>
        </motion.button>
      ) : (
        <motion.div
          key="panel"
          initial={{ x: "100%", opacity: 0.5 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0.5 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="fixed inset-0 sm:left-auto sm:right-0 w-full sm:w-[85vw] md:w-[450px] lg:w-[480px] bg-white shadow-2xl flex flex-col z-[100] overflow-hidden"
        >
          {/* Header */}
          <header className="px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="overflow-hidden">
                <h3 className="font-bold text-slate-900 text-[13.5px] sm:text-[15px] leading-none truncate text-left">
                  HealthyME | Life@ Montefiore
                </h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    Online
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-0.5 relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className={cn(
                  "p-2 rounded-lg transition-all shrink-0",
                  showMenu
                    ? "bg-indigo-50 text-indigo-600"
                    : "hover:bg-slate-50 text-slate-400",
                )}
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50"
                  >
                    <button
                      onClick={handleNewChat}
                      className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all text-left tracking-[0.01em]"
                    >
                      <MessageSquarePlus className="w-3.5 h-3.5 shrink-0" />
                      New chat
                    </button>
                    <button
                      onClick={() => setShowMenu(false)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-semibold text-red-500 hover:bg-red-50 transition-all text-left tracking-[0.01em]"
                    >
                      <Trash2 className="w-3.5 h-3.5 shrink-0" />
                      Clear history
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-red-500 shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Stepper */}
          {currentStep !== null && (
            <div className="px-4 sm:px-6 py-4 bg-slate-50/50 border-b border-slate-100 select-none shrink-0">
              <div className="relative flex items-center justify-between w-full px-2">
                {/* Connecting Line Background & Progress */}
                <div className="absolute left-5 right-5 top-1/2 -translate-y-1/2 h-[2px] bg-slate-200 z-0">
                  <div
                    className="h-full bg-[#003769] transition-all duration-500"
                    style={{
                      width: `${(currentStep / (STEPS.length - 1)) * 100}%`,
                    }}
                  />
                </div>

                {STEPS.map((step, idx) => (
                  <div
                    key={step}
                    className="flex flex-col items-center group relative z-10"
                  >
                    <div
                      className={cn(
                        "w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-bold transition-all duration-300 border-2 bg-white",
                        idx === currentStep
                          ? "bg-[#003769] text-white border-[#003769] shadow-lg shadow-blue-200/50 scale-110"
                          : idx < currentStep
                            ? "bg-[#003769] text-white border-[#003769]"
                            : "border-slate-200 text-slate-400",
                      )}
                    >
                      {idx < currentStep ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        idx + 1
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-3">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#003769]">
                  Step {currentStep + 1}: {STEPS[currentStep] || ""}
                </span>
              </div>
            </div>
          )}

          {/* Chat Content */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 sm:px-5 py-5 sm:py-6 space-y-6 sm:space-y-8 bg-white scroll-smooth no-scrollbar pb-32"
          >
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex flex-col w-full",
                    msg.role === "user" ? "items-end" : "items-start",
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center gap-2 mb-1.5 px-1",
                      msg.role === "user" ? "flex-row-reverse" : "flex-row",
                    )}
                  >
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">
                      {msg.role === "user" ? "You" : "Montefiore"}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "px-4 sm:px-5 py-3 text-[12.5px] sm:text-[13px] leading-relaxed shadow-sm transition-all text-left",
                      msg.role === "user"
                        ? "bg-[#003769] text-white rounded-[1.2rem] rounded-tr-none max-w-[85%]"
                        : "bg-[#f8f9fa] text-slate-700 rounded-[1.2rem] rounded-tl-none border border-slate-100 max-w-[92%] w-full",
                    )}
                  >
                    {typeof msg.content === "string" ? (
                      <div
                        className={cn(
                          "prose prose-sm max-w-none prose-p:leading-relaxed prose-p:my-0 prose-strong:text-inherit prose-strong:font-bold w-full",
                          msg.role === "user"
                            ? "prose-invert text-white"
                            : "text-slate-700",
                        )}
                      >
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <div className="w-full">{msg.content}</div>
                    )}
                  </div>
                  {msg.actions && (
                    <div className="flex flex-wrap gap-2 mt-3 w-full px-1">
                      {msg.actions.map((act, i) => (
                        <button
                          key={i}
                          onClick={act.action}
                          className="flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-indigo-50 text-[#003769] text-[10px] font-bold hover:bg-indigo-100 transition-all border border-indigo-100 shadow-sm active:scale-95 tracking-wide"
                        >
                          <act.icon className="w-3.5 h-3.5 shrink-0" />{" "}
                          {act.label}
                        </button>
                      ))}
                    </div>
                  )}
                  <span
                    className={cn(
                      "text-[8px] sm:text-[9px] font-medium text-slate-400 mt-1.5 px-1",
                      msg.role === "user" ? "text-right" : "text-left",
                    )}
                  >
                    {msg.timestamp}
                  </span>
                </motion.div>
              ))}

              {isTyping && (
                <div className="flex gap-1 px-2 items-center">
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2">
                    Montefiore is typing
                  </span>
                  <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce"></span>
                  <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce delay-75"></span>
                  <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce delay-150"></span>
                </div>
              )}
            </AnimatePresence>

            {messages.length === 1 && !isTyping && currentStep === null && (
              <div className="space-y-3 pt-4 w-full text-left">
                <p className="text-[10px] font-bold text-[#003769] uppercase tracking-[0.08em] mb-2 px-1">
                  Quick Actions
                </p>
                <div className="grid grid-cols-1 gap-2 w-full">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt.id}
                      onClick={() => handleSend(prompt.label)}
                      className="w-full flex items-center gap-3 p-3.5 sm:p-4 bg-indigo-50 border border-indigo-100 rounded-xl hover:bg-indigo-100 transition-all text-left shadow-sm group active:scale-[0.98]"
                    >
                      <prompt.icon className="w-4 h-4 text-[#003769] group-hover:scale-110 transition-transform shrink-0" />
                      <span className="text-[13px] font-semibold text-[#003769] tracking-[0.01em] truncate">
                        {prompt.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer / Input Area */}
          <div className="px-4 sm:px-5 py-4 sm:py-5 border-t border-slate-50 bg-white">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex-1 relative flex items-center group">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend(inputValue)}
                  placeholder={
                    currentStep !== null && STEPS[currentStep]
                      ? `Step ${currentStep + 1}: ${STEPS[currentStep]}...`
                      : "Ask a question..."
                  }
                  className="w-full bg-slate-50 border-2 border-slate-100 text-slate-800 focus:bg-white rounded-[1rem] sm:rounded-[1.2rem] px-4 sm:px-5 py-3 sm:py-3.5 text-[12.5px] sm:text-[13px] font-bold focus:outline-none focus:border-indigo-200 transition-all pr-10 sm:pr-12 placeholder:text-slate-400 shadow-sm group-hover:border-indigo-100"
                />
                <button
                  onClick={() => handleSend(inputValue)}
                  className="absolute right-3 p-1.5 text-indigo-500 hover:text-indigo-700 transition-colors shrink-0"
                >
                  <Send className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                </button>
              </div>
              <button className="w-[48px] h-[48px] sm:w-[52px] sm:h-[52px] bg-[#003769] text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-900/10 hover:scale-105 active:scale-95 transition-all shrink-0">
                <Mic className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              </button>
            </div>
            <p className="text-[9px] text-center text-[#888888] font-normal leading-[1.3] py-[6px] px-[12px] pb-[10px] select-none">
              This is an AI generated response
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
