import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

import { tasksColumns } from "@/components/tasks/tasks-columns";
import { TasksTable } from "@/components/tasks/tasks-table";
import { taskListQueryOptions } from "@/queries/tasks";

export const Route = createFileRoute("/_app/")({
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(taskListQueryOptions),
  component: RouteComponent,
});

function TasksTableWrapper() {
  const tasksQuery = useSuspenseQuery(taskListQueryOptions);
  return <TasksTable columns={tasksColumns} data={tasksQuery.data.data} />;
}

function TasksTableSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex h-10 items-center justify-between">
        <div className="bg-muted h-9 w-32 max-w-xs animate-pulse rounded-md" />
        <div className="bg-muted h-9 w-24 animate-pulse rounded-md" />
      </div>
      <div className="border">
        <div className="bg-muted h-10 animate-pulse" />
        <div className="space-y-2 p-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-muted h-12 animate-pulse rounded-sm" />
          ))}
        </div>
      </div>
    </div>
  );
}

function RouteComponent() {
  return (
    <Suspense fallback={<TasksTableSkeleton />}>
      <TasksTableWrapper />
    </Suspense>
  );
}
