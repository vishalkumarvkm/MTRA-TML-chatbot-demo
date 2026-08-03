import { fetchApi } from "@/lib/api";
import { mockNotifications } from "@/data/mockData";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface Notification {
  id: string | number;
  userId: string | number;
  title?: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
  category: "status_change" | "document" | "system" | "sla" | "approval" | "deadline";
}

export function useNotifications() {
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      try {
        const response = await fetchApi<{ data: any[] }>("/notifications");
        if (response.data && response.data.length > 0) {
          return response.data.map((n: any) => ({
            id: String(n.id),
            userId: String(n.user_id),
            title: n.title || (n.message?.toLowerCase().includes("approved") ? "Application Approved" : n.message?.toLowerCase().includes("review") ? "Application Under Review" : "Notification Update"),
            message: n.message,
            read: n.is_read,
            createdAt: n.created_at,
            category: n.type || "status_change",
            link: n.actionUrl || "/applications",
          })) as Notification[];
        }
      } catch (e) {
        console.warn("Using mock notifications fallback");
      }
      return mockNotifications.map((n: any) => ({
        id: String(n.id),
        userId: String(n.userId),
        title: n.title,
        message: n.message,
        read: n.read,
        createdAt: n.createdAt,
        category: n.type || "status_change",
        link: n.actionUrl || "/applications",
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
