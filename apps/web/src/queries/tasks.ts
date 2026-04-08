import { queryOptions } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

export const taskQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["task", { id }],
    queryFn: async () => {
      const response = await client.tasks[":id"].$get({ param: { id } });
      if (!response.ok) {
        throw new Error(`Failed to fetch task with id: ${id}`);
      }
      return await response.json();
    },
    // Task data is fresh for 1 minute
    staleTime: 1000 * 60,
  });

export const taskListQueryOptions = queryOptions({
  queryKey: ["tasks"],
  queryFn: async () => {
    const response = await client.tasks.$get();
    if (!response.ok) {
      throw new Error(`Failed to fetch tasks`);
    }
    return await response.json();
  },
  // Task list is fresh for 30 seconds
  staleTime: 1000 * 30,
});
