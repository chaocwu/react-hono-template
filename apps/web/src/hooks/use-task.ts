import type { TaskInsert } from "@template/api/schemas/tasks";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: TaskInsert) => {
      const response = await client.tasks.$post({ json: input });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create task");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await client.tasks[":id"].$delete({ param: { id } });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete task");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};
