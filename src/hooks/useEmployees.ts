import { mockEmployees } from "@/data/mockData";
import { fetchApi } from "@/lib/api";
import { useAppStore } from "@/store/appStore";
import type { Employee } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useEmployeeProfile() {
  const { isAuthenticated } = useAppStore();

  return useQuery({
    queryKey: ["employee", "me"],
    queryFn: async () => {
      try {
        const response = await fetchApi<{ data: any }>("/employees/me");
        const emp = response.data;
        return {
          id: String(emp.id),
          name: `${emp.first_name} ${emp.last_name}`,
          employeeId: emp.employee_id || "",
          department: emp.department || "",
          title: emp.designation || "",
          hireDate: emp.hire_date || new Date().toISOString(),
          tuitionBalance: 5000,
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
      } catch (e) {
        // Fallback to currently logged in mock user or default mock employee
        const currentUser = useAppStore.getState().currentUser;
        const matchedMock = mockEmployees.find(
          (m) =>
            m.email.toLowerCase() === (currentUser?.email || "").toLowerCase(),
        );
        return matchedMock || mockEmployees[0];
      }
    },
    enabled: isAuthenticated,
  });
}
