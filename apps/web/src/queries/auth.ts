import { queryOptions } from "@tanstack/react-query";

import { authClient } from "@/lib/auth";

export const sessionQueryOptions = queryOptions({
  queryKey: ["auth", "session"],
  queryFn: async () => {
    const result = await authClient.getSession();
    return result.data ?? null;
  },
  // Session is fresh for 5 minutes to reduce API calls
  staleTime: 1000 * 60 * 5,
  // Keep unused session data in cache for 30 minutes
  gcTime: 1000 * 60 * 30,
});
