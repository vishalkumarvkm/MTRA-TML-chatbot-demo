import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { mockPrograms } from "@/data/mockData";
import { Program } from "@/types";

export function usePrograms() {
  return useQuery({
    queryKey: ["programs"],
    queryFn: async () => {
      try {
        const response = await fetchApi<{ data: any[] }>("/programs");
        // Map backend programs with UI static configuration
        return response.data.map(p => {
          const uiConfig = mockPrograms.find(m => m.programType === p.name) || mockPrograms[0];
          return {
            id: String(p.id),
            name: uiConfig.name,
            description: p.description,
            maxAmount: p.max_amount || uiConfig.maxAmount,
            maxCredits: uiConfig.maxCredits,
            eligibilityRules: uiConfig.eligibilityRules,
            programType: p.name,
            icon: uiConfig.icon,
            color: uiConfig.color,
            available: true,
          };
        }) as Program[];
      } catch (e) {
        // Fallback to mock data if backend fails
        return mockPrograms;
      }
    },
  });
}
