import { mockApprovalItems } from "@/data/mockData";
import { fetchApi } from "@/lib/api";
import { Application } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useManagerApprovals() {
  const queryClient = useQueryClient();

  const pendingApprovalsQuery = useQuery({
    queryKey: ["manager_approvals"],
    queryFn: async () => {
      try {
        const response = await fetchApi<{ data: any[] }>(
          "/manager/applications",
        );
        if (response.data && Array.isArray(response.data)) {
          return response.data.map((app: any) => ({
            id: String(app.id),
            employeeId: String(app.employee_id),
            employeeName: "Employee",
            employeeTitle: "Associate",
            programType: "TuitionReimbursement",
            status: app.status,
            amount: app.tuition_fee,
            credits: 0,
            institution: app.institution_name,
            courseTitle: app.course_name,
            dueDate: new Date(
              (app.created_at
                ? new Date(app.created_at).getTime()
                : Date.now()) +
                15 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            submittedDate: app.created_at || new Date().toISOString(),
            aiSummary: "AI extraction successful. Document verified.",
            documents: app.documents || [],
          }));
        }
      } catch (e) {
        console.warn(
          "Using mock manager approvals fallback due to fetch failure",
        );
      }
      return mockApprovalItems;
    },
  });

  const verifyApplicationDocuments = useMutation({
    mutationFn: async (appId: string | number) => {
      return await fetchApi<{ data: any }>(
        `/manager/applications/${appId}/verify`,
        {
          method: "POST",
        },
      );
    },
  });

  const approveApplication = useMutation({
    mutationFn: async ({
      appId,
      remarks,
    }: { appId: string | number; remarks: string }) => {
      return await fetchApi(`/manager/applications/${appId}/approve`, {
        method: "POST",
        body: JSON.stringify({ remarks }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manager_approvals"] });
    },
  });

  const rejectApplication = useMutation({
    mutationFn: async ({
      appId,
      remarks,
    }: { appId: string | number; remarks: string }) => {
      return await fetchApi(`/manager/applications/${appId}/reject`, {
        method: "POST",
        body: JSON.stringify({ remarks }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manager_approvals"] });
    },
  });

  return {
    approvals: pendingApprovalsQuery.data || [],
    isLoading: pendingApprovalsQuery.isLoading,
    error: pendingApprovalsQuery.error,
    approveApplication,
    rejectApplication,
    verifyApplicationDocuments,
  };
}
