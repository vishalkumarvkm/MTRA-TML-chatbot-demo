import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { Application } from "@/types";

export function useApplications() {
  const queryClient = useQueryClient();

  const applicationsQuery = useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      const response = await fetchApi<{ data: any[] }>("/applications");
      return response.data.map((app: any) => ({
        id: String(app.id),
        employeeId: String(app.employee_id),
        programType: "TuitionReimbursement", // we might need to look this up
        status: app.status.charAt(0).toUpperCase() + app.status.slice(1).toLowerCase(),
        submittedAt: app.created_at,
        amount: app.tuition_fee,
        credits: 0,
        institution: app.institution_name,
        courseTitle: app.course_name,
        documents: [],
        createdAt: app.created_at,
        updatedAt: app.updated_at,
        term: app.semester,
      })) as Application[];
    },
  });

  const createApplication = useMutation({
    mutationFn: async (data: any) => {
      return await fetchApi("/applications", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });

  const uploadDocument = useMutation({
    mutationFn: async ({ appId, file }: { appId: number | string; file: File }) => {
      const formData = new FormData();
      formData.append("file", file);
      
      return await fetchApi(`/applications/${appId}/documents`, {
        method: "POST",
        body: formData,
      });
    },
  });

  const submitApplication = useMutation({
    mutationFn: async (appId: number | string) => {
      return await fetchApi(`/applications/${appId}/submit`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });

  const verifyDocument = useMutation({
    mutationFn: async ({ file, docType }: { file: File; docType: string }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("doc_type", docType);
      
      return await fetchApi(`/documents/verify`, {
        method: "POST",
        body: formData,
      });
    },
  });

  return {
    applications: applicationsQuery.data || [],
    isLoading: applicationsQuery.isLoading,
    error: applicationsQuery.error,
    createApplication,
    uploadDocument,
    submitApplication,
    verifyDocument,
  };
}
