import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="grid h-full grid-rows-12 gap-2">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="h-full animate-pulse rounded bg-muted" />
      ))}
    </div>
  );
}
