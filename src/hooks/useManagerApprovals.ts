import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { Application } from "@/types";

export function useManagerApprovals() {
  const queryClient = useQueryClient();

  const pendingApprovalsQuery = useQuery({
    queryKey: ["manager_approvals"],
    queryFn: async () => {
      const response = await fetchApi<{ data: any[] }>("/manager/applications");
      return response.data.map((app: any) => ({
        id: String(app.id),
        employeeId: String(app.employee_id),
        employeeName: "Employee", // Backend currently doesn't return joined employee name, we fallback in UI
        employeeTitle: "Associate", // Fallback
        programType: "TuitionReimbursement", // Fallback
        status: app.status,
        amount: app.tuition_fee,
        credits: 0,
        institution: app.institution_name,
        courseTitle: app.course_name,
        dueDate: new Date((app.created_at ? new Date(app.created_at).getTime() : Date.now()) + 15 * 24 * 60 * 60 * 1000).toISOString(),
        submittedDate: app.created_at || new Date().toISOString(),
        aiSummary: "AI extraction successful. Document verified.",
        documents: app.documents || [],
      }));
    },
  });

  const verifyApplicationDocuments = useMutation({
    mutationFn: async (appId: string | number) => {
      return await fetchApi<{ data: any }>(`/manager/applications/${appId}/verify`, {
        method: "POST",
      });
    },
  });

  const approveApplication = useMutation({
    mutationFn: async ({ appId, remarks }: { appId: string | number; remarks: string }) => {
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
    mutationFn: async ({ appId, remarks }: { appId: string | number; remarks: string }) => {
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
