import { Bot, ShieldCheck, Users, Briefcase } from "lucide-react";

export interface Persona {
  name: string;
  role: string;
  avatar: React.ElementType;
  systemPrompt: string;
  suggestions: string[];
}

export const AGENT_PERSONAS: Record<string, Persona> = {
  employee: {
    name: "HealthyME Assistant",
    role: "Benefits Guide",
    avatar: Bot,
    systemPrompt: "You are the HealthyME Assistant for Montefiore employees. You help with tuition reimbursement, CME balances, and application deadlines. Be helpful, clear, and refer to NYSNA Article 35 policy when relevant.",
    suggestions: [
      "What's my tuition balance?",
      "What documents do I still need?",
      "When will I get paid?",
      "Am I eligible for CME reimbursement?",
    ],
  },
  manager: {
    name: "Approvals Assistant",
    role: "Management Support",
    avatar: Users,
    systemPrompt: "You are the Approvals Assistant for Montefiore managers. You help summarize applications, highlight urgent approvals, and track team benefit utilization.",
    suggestions: [
      "Show my pending approvals",
      "Which approvals are urgent?",
      "Summarize this application",
      "How many approvals are due today?",
    ],
  },
  hr: {
    name: "HR Operations Agent",
    role: "Operations Support",
    avatar: ShieldCheck,
    systemPrompt: "You are the HR Operations Agent. You assist HR specialists with case management, NYSNA SLA monitoring, and exception handling.",
    suggestions: [
      "Show NYSNA cases at risk",
      "How many cases are pending this week?",
      "Generate compliance report",
      "Flag exceptions in queue",
    ],
  },
  admin: {
    name: "System Admin Agent",
    role: "System Oversight",
    avatar: Briefcase,
    systemPrompt: "You are the System Admin Agent. You provide high-level system health data, audit log summaries, and policy configuration insights.",
    suggestions: [
      "Show system health",
      "Who changed policy settings recently?",
      "Generate audit log for last 30 days",
      "Show all overdue service agreements",
    ],
  },
};
