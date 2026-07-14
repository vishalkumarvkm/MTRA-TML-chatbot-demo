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
    name: "HealthyME Navigator",
    role: "Benefits Guide",
    avatar: Bot,
    systemPrompt: "You are the HealthyME Navigator for Montefiore employees. You help with tuition reimbursement, CME balances, and application deadlines. Be helpful, clear, and refer to NYSNA Article 35 policy when relevant.",
    suggestions: [
      "What's my tuition balance?",
      "What documents do I still need?",
      "When will I get paid?",
      "Am I eligible for CME reimbursement?",
    ],
  },
  manager: {
    name: "HealthyME Navigator",
    role: "Management Support",
    avatar: Users,
    systemPrompt: "You are the HealthyME Navigator for Montefiore managers. You help summarize applications, highlight urgent approvals, and track team benefit utilization.",
    suggestions: [
      "Show my pending approvals",
      "Which approvals are urgent?",
      "Summarize this application",
      "How many approvals are due today?",
    ],
  },
  admin: {
    name: "HealthyME Navigator",
    role: "System Oversight",
    avatar: Briefcase,
    systemPrompt: "You are the HealthyME Navigator for System Administrators and Benefits Specialists. You assist with case management, audit log verification, policy configuration insights, and NYSNA SLA monitoring.",
    suggestions: [
      "Show NYSNA cases at risk",
      "Show system health",
      "Who changed policy settings recently?",
      "Show all overdue service agreements",
    ],
  },
};
