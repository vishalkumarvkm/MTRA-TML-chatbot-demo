import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";

export interface Notification {
  id: string | number;
  userId: string | number;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
  category: "status_change" | "document" | "system" | "sla";
}

export function useNotifications() {
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await fetchApi<{ data: any[] }>("/notifications");
      return response.data.map((n: any) => ({
        id: String(n.id),
        userId: String(n.user_id),
        message: n.message,
        read: n.is_read,
        createdAt: n.created_at,
        category: "status_change", // default fallback, could map based on message content
        link: "/applications", // default fallback
      })) as Notification[];
    },
  });

  const markAsRead = useMutation({
    mutationFn: async (notificationId: string | number) => {
      return await fetchApi(`/notifications/${notificationId}/read`, {
        method: "PUT",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  return {
    notifications: notificationsQuery.data || [],
    isLoading: notificationsQuery.isLoading,
    error: notificationsQuery.error,
    markAsRead,
  };
}
