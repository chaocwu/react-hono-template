import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

import { tasksColumns } from "@/components/tasks/tasks-columns";
import { TasksTable } from "@/components/tasks/tasks-table";
import { taskListQueryOptions } from "@/queries/tasks";

export const Route = createFileRoute("/_app/tasks")({
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(taskListQueryOptions),
  component: RouteComponent,
});

function TasksTableWrapper() {
  const tasksQuery = useSuspenseQuery(taskListQueryOptions);
  return <TasksTable columns={tasksColumns} data={tasksQuery.data.data} />;
}

function TasksTableSkeleton() {
  return (
    <div className="grid h-full grid-rows-12 gap-2">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="h-full animate-pulse rounded bg-muted" />
      ))}
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
