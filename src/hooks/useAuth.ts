import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { useAppStore } from "@/store/appStore";

export function useAuth() {
  const { loginAs, logout } = useAppStore();

  const loginMutation = useMutation({
    mutationFn: async (credentials: any) => {
      const response = await fetchApi<{ data: { access_token: string, refresh_token: string, role: string, user: { id: number, email: string } } }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });
      return response.data;
    },
    onSuccess: async (data) => {
      // Temporarily use appStore logic, but we should fetch the profile next
      const userObj = {
        id: String(data.user.id),
        email: data.user.email,
        role: String(data.role).toLowerCase() as any,
        employeeId: "",
        name: data.user.email.split("@")[0],
        department: "",
        title: "",
      };
      
      loginAs(userObj, data.access_token);
    },
  });

  return {
    login: loginMutation.mutateAsync,
    isLoading: loginMutation.isPending,
    error: loginMutation.error,
    logout,
  };
}
