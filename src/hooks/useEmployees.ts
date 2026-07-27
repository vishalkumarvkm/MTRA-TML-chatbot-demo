import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { Employee } from "@/types";
import { useAppStore } from "@/store/appStore";

export function useEmployeeProfile() {
  const { isAuthenticated } = useAppStore();

  return useQuery({
    queryKey: ["employee", "me"],
    queryFn: async () => {
      const response = await fetchApi<{ data: any }>("/employees/me");
      const emp = response.data;
      return {
        id: String(emp.id),
        name: `${emp.first_name} ${emp.last_name}`,
        employeeId: emp.employee_id || "",
        department: emp.department || "",
        title: emp.designation || "",
        hireDate: emp.hire_date || new Date().toISOString(),
        tuitionBalance: 5000, // Hardcoded for now if not returned by backend
        tuitionUsed: 0,
        tuitionMax: 5000,
        creditBalance: 18,
        creditUsed: 0,
        creditMax: 18,
        email: useAppStore.getState().currentUser?.email || "",
        phone: emp.phone_number || "",
        managerId: emp.manager_id ? String(emp.manager_id) : null,
        location: emp.location || "",
        isNYSNA: false,
      } as Employee;
    },
    enabled: isAuthenticated, // Only fetch if logged in
  });
}
