import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@template/ui/components/avatar";
import { Button } from "@template/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@template/ui/components/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@template/ui/components/navigation-menu";

import { authClient } from "@/lib/auth";
import { sessionQueryOptions } from "@/queries/auth";

export const Route = createFileRoute("/_app")({
  beforeLoad: async ({ context, location }) => {
    const session = await context.queryClient.ensureQueryData(sessionQueryOptions);
    if (!session) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
    return session;
  },
  component: RootComponent,
});

function RootComponent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // beforeLoad already ensures session exists, so we can safely use useSuspenseQuery
  const { data: session } = useSuspenseQuery(sessionQueryOptions);
  return (
    <div className="flex h-full flex-1 flex-col gap-4">
      <div className="flex items-center justify-between py-3">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink className="h-8" render={<Link to="/">Home</Link>} />
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarImage src={session?.user.image!} alt={session?.user.name} />
                  <AvatarFallback>{session?.user.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            }
          />
          <DropdownMenuContent className="w-48" align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem
                variant="destructive"
                onClick={async () => {
                  await authClient.signOut();
                  queryClient.removeQueries({ queryKey: ["auth", "session"] });
                  navigate({ to: "/login" });
                }}
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Outlet />
    </div>
  );
}
