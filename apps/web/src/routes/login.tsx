import { createFileRoute, redirect } from "@tanstack/react-router";
import { Button } from "@template/ui/components/button";
import { LogInIcon } from "lucide-react";

import { authClient } from "@/lib/auth";
import { sessionQueryOptions } from "@/queries/auth";
export const Route = createFileRoute("/login")({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.fetchQuery(sessionQueryOptions);
    if (session) {
      throw redirect({
        to: "/",
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex h-full w-full flex-1 items-center justify-center">
      <Button
        size="lg"
        className="w-1/6"
        onClick={async () => {
          await authClient.signIn.oauth2({
            providerId: "gitee",
            callbackURL: import.meta.env.VITE_WEB_URL,
          });
        }}
      >
        <LogInIcon />
        Login with Gitee
      </Button>
    </div>
  );
}
