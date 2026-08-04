import { HARDCODED_CREDENTIALS } from "@/data/mockData";
import { fetchApi } from "@/lib/api";
import { useAppStore } from "@/store/appStore";
import { useMutation } from "@tanstack/react-query";

export function useAuth() {
  const { loginAs, logout } = useAppStore();

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email?: string; password?: string }) => {
      const emailClean = (credentials.email || "").trim().toLowerCase();
      const passwordClean = credentials.password || "";

      // Check hardcoded credentials first
      const hardcodedMatch = HARDCODED_CREDENTIALS.find(
        (cred) => cred.email.toLowerCase() === emailClean,
      );

      if (hardcodedMatch) {
        if (hardcodedMatch.password === passwordClean) {
          const fakeToken = `mock-token-${hardcodedMatch.role}-${Date.now()}`;
          return {
            user: hardcodedMatch.user,
            token: fakeToken,
          };
        } else {
          throw new Error(
            "Invalid password. Please check credentials and try again.",
          );
        }
      }

      // Try API backend login fallback if provided email isn't in hardcoded list
      try {
        const response = await fetchApi<{
          data: {
            access_token: string;
            refresh_token: string;
            role: string;
            user: { id: number; email: string; name?: string };
          };
        }>("/auth/login", {
          method: "POST",
          body: JSON.stringify(credentials),
        });

        const roleLower = String(response.data.role).toLowerCase() as any;
        const matchedCredential = HARDCODED_CREDENTIALS.find(
          (c) => c.role === roleLower,
        );
        const userObj = matchedCredential?.user || {
          id: String(response.data.user.id),
          employeeId: `EMP-${response.data.user.id}`,
          name:
            response.data.user.name || response.data.user.email.split("@")[0],
          email: response.data.user.email,
          role: roleLower,
          department: "Montefiore Medical Center",
          title: "Staff Member",
        };

        return {
          user: userObj,
          token: response.data.access_token,
        };
      } catch (err: any) {
        throw new Error(err.message || "Invalid email or password.");
      }
    },
    onSuccess: (data) => {
      loginAs(data.user, data.token);
    },
  });

  return {
    login: loginMutation.mutateAsync,
    isLoading: loginMutation.isPending,
    error: loginMutation.error,
    logout,
  };
}
