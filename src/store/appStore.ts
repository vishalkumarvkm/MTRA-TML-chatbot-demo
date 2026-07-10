import { mockAuthUsers } from "@/data/mockData";
import type {
  ApplicationStatus,
  AuthUser,
  SlaStatus,
  UserRole,
  WizardData,
  ChatMessage,
  SupportCase,
} from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  loginAs: (user: AuthUser) => void;
  logout: () => void;
  setRole: (role: UserRole) => void;
}

interface AppState {
  wizardStep: number;
  wizardData: WizardData;
  setWizardStep: (step: number) => void;
  updateWizardData: (data: Partial<WizardData>) => void;
  resetWizard: () => void;
  selectedCaseId: string | null;
  setSelectedCaseId: (id: string | null) => void;
  caseFilters: {
    status: ApplicationStatus | "All";
    slaStatus: SlaStatus | "All";
    assignedAdmin: string;
    search: string;
  };
  setCaseFilters: (filters: Partial<AppState["caseFilters"]>) => void;
  unreadNotificationCount: number;
  setUnreadNotificationCount: (count: number) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  hasHydrated: boolean;
  setHasHydrated: (val: boolean) => void;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  chatMessages: ChatMessage[];
  addChatMessage: (msg: ChatMessage) => void;
  clearChat: () => void;
  unreadChatCount: number;
  setUnreadChatCount: (count: number) => void;
  hasSentProactive: boolean;
  setHasSentProactive: (sent: boolean) => void;
  supportCases: SupportCase[];
  addSupportCase: (sc: SupportCase) => void;
  updateSupportCase: (id: string, updates: Partial<SupportCase>) => void;
}

type StoreState = AuthState & AppState;

const MOCK_SUPPORT_CASES: SupportCase[] = [
  {
    id: "SUP-2026-0001",
    employeeId: "emp-001",
    employeeName: "Maria Santos",
    linkedAppId: "case-001",
    linkedAppProgram: "TuitionReimbursement",
    linkedAppDate: "2026-04-15",
    linkedAppStatus: "PendingApproval",
    subject: "Missing Grades Transcript Upload Issue",
    category: "Document Issue",
    description: "The system did not let me upload my Spring 2026 official transcript because of a PDF file size limit (currently 6MB). Can you please assist or increase the limit?",
    status: "Open",
    createdDate: "2026-04-16T10:00:00Z",
    lastUpdated: "2026-04-16T10:00:00Z",
    assignedTo: "System Admin",
    priority: "Medium",
    unread: true,
    messages: [
      {
        id: "msg-1",
        senderName: "Maria Santos",
        senderRole: "employee",
        message: "The system did not let me upload my Spring 2026 official transcript because of a PDF file size limit (currently 6MB). Can you please assist or increase the limit?",
        timestamp: "2026-04-16T10:00:00Z",
        attachment: {
          name: "Columbia_Transcript_Spring2026.pdf",
          size: "2.4 MB"
        }
      }
    ]
  },
  {
    id: "SUP-2026-0002",
    employeeId: "emp-003",
    employeeName: "Latasha Williams",
    linkedAppId: "case-002",
    linkedAppProgram: "TuitionReimbursement",
    linkedAppDate: "2026-04-20",
    linkedAppStatus: "UnderReview",
    subject: "Eligibility status of HIT 520 Course",
    category: "Eligibility Question",
    description: "I wanted to check if the Fordham HIT 520 course fits the job-related tuition reimbursement criteria for radiology techs. I haven't received a confirmation yet.",
    status: "Resolved",
    createdDate: "2026-04-21T09:00:00Z",
    lastUpdated: "2026-04-22T14:00:00Z",
    assignedTo: "System Admin",
    priority: "Low",
    unread: false,
    messages: [
      {
        id: "msg-2-1",
        senderName: "Latasha Williams",
        senderRole: "employee",
        message: "I wanted to check if the Fordham HIT 520 course fits the job-related tuition reimbursement criteria for radiology techs. I haven't received a confirmation yet.",
        timestamp: "2026-04-21T09:00:00Z",
      },
      {
        id: "msg-2-2",
        senderName: "System Admin",
        senderRole: "admin",
        message: "Hi Latasha, yes, health informatics courses are eligible for radiology techs. I've updated your status to Under Review. You're good to go!",
        timestamp: "2026-04-22T14:00:00Z",
      }
    ]
  },
  {
    id: "SUP-2026-0003",
    employeeId: "emp-001",
    employeeName: "Maria Santos",
    linkedAppId: "case-003",
    linkedAppProgram: "CMEReimbursement",
    linkedAppDate: "2026-03-10",
    linkedAppStatus: "Approved",
    subject: "CME Reimbursement Balance Discrepancy",
    category: "Payment Query",
    description: "My approved CME reimbursement amount shows $750, but my total tuition bank shows a deduction of $1000. Can you please correct the balance statement?",
    status: "Resolved",
    createdDate: "2026-03-12T08:30:00Z",
    lastUpdated: "2026-03-14T11:00:00Z",
    assignedTo: "System Admin",
    priority: "High",
    unread: true,
    messages: [
      {
        id: "msg-3-1",
        senderName: "Maria Santos",
        senderRole: "employee",
        message: "My approved CME reimbursement amount shows $750, but my total tuition bank shows a deduction of $1000. Can you please correct the balance statement?",
        timestamp: "2026-03-12T08:30:00Z",
      },
      {
        id: "msg-3-2",
        senderName: "System Admin",
        senderRole: "admin",
        message: "Hi Maria, we investigated and resolved the duplicate charge entry in your ledger. The adjusted remaining balance now correctly reflects $750. Please check your Overview dashboard to verify.",
        timestamp: "2026-03-14T11:00:00Z",
      }
    ]
  },
  {
    id: "SUP-2026-0004",
    employeeId: "emp-001",
    employeeName: "Maria Santos",
    linkedAppId: "case-001",
    linkedAppProgram: "TuitionReimbursement",
    linkedAppDate: "2026-04-15",
    linkedAppStatus: "UnderReview",
    subject: "Service Agreement Signature Verification Status",
    category: "Service Agreement",
    description: "I signed the Service Agreement through DocuSign yesterday but the portal checklist status still shows 'Pending Signature'. Is there an expected delay or should I resubmit?",
    status: "In Progress",
    createdDate: "2026-04-22T09:15:00Z",
    lastUpdated: "2026-04-23T10:00:00Z",
    assignedTo: "System Admin",
    priority: "Medium",
    unread: false,
    messages: [
      {
        id: "msg-4-1",
        senderName: "Maria Santos",
        senderRole: "employee",
        message: "I signed the Service Agreement through DocuSign yesterday but the portal checklist status still shows 'Pending Signature'. Is there an expected delay or should I resubmit?",
        timestamp: "2026-04-22T09:15:00Z",
      },
      {
        id: "msg-4-2",
        senderName: "System Admin",
        senderRole: "admin",
        message: "Hi Maria, our system syncs signed DocuSign documents once every 24 hours. I have manually triggered a fetch for your signed agreement, and it is now being processed. It should reflect as completed shortly.",
        timestamp: "2026-04-23T10:00:00Z",
      }
    ]
  }
];

export const useAppStore = create<StoreState>()(
  persist(
    (set) => ({
      currentUser: null,
      isAuthenticated: false,

      loginAs: (user) => set({ currentUser: user, isAuthenticated: true }),
      logout: () => set({ currentUser: null, isAuthenticated: false }),
      setRole: (role) =>
        set((state) => {
          if (!state.currentUser) return state;
          const userForRole = mockAuthUsers.find((u) => u.role === role);
          return { currentUser: userForRole ?? { ...state.currentUser, role } };
        }),

      wizardStep: 1,
      wizardData: {},
      setWizardStep: (step) => set({ wizardStep: step }),
      updateWizardData: (data) =>
        set((state) => ({ wizardData: { ...state.wizardData, ...data } })),
      resetWizard: () => set({ wizardStep: 1, wizardData: {} }),

      selectedCaseId: null,
      setSelectedCaseId: (id) => set({ selectedCaseId: id }),

      caseFilters: { status: "All", slaStatus: "All", assignedAdmin: "", search: "" },
      setCaseFilters: (filters) =>
        set((state) => ({ caseFilters: { ...state.caseFilters, ...filters } })),

      unreadNotificationCount: 5,
      setUnreadNotificationCount: (count) =>
        set({ unreadNotificationCount: count }),

      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      hasHydrated: false,
      setHasHydrated: (val) => set({ hasHydrated: val }),
      isChatOpen: false,
      setIsChatOpen: (open) => set({ isChatOpen: open }),
      chatMessages: [],
      addChatMessage: (msg) => set((state) => ({ chatMessages: [...state.chatMessages, msg] })),
      clearChat: () => set({ chatMessages: [], hasSentProactive: false, unreadChatCount: 0 }),
      unreadChatCount: 0,
      setUnreadChatCount: (count) => set({ unreadChatCount: count }),
      hasSentProactive: false,
      setHasSentProactive: (sent) => set({ hasSentProactive: sent }),
      supportCases: MOCK_SUPPORT_CASES,
      addSupportCase: (sc) => set((state) => ({ supportCases: [sc, ...state.supportCases] })),
      updateSupportCase: (id, updates) =>
        set((state) => ({
          supportCases: state.supportCases.map((sc) =>
            sc.id === id ? { ...sc, ...updates, lastUpdated: new Date().toISOString() } : sc
          ),
        })),
    }),
    {
      name: "mtra-storage-v2",
      onRehydrateStorage: (state) => {
        return () => state.setHasHydrated(true);
      },
    },
  ),
);
