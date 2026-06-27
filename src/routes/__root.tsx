import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import "../lib/fonts";
import faviconAsset from "@/assets/fernwood-favicon.png.asset.json";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AppSidebar, MobileTopBar } from "@/components/AppSidebar";
import { TaskDetailSheet } from "@/components/TaskDetailSheet";
import { TaskDetailPane } from "@/components/TaskDetailPane";
import { AddTaskSheet } from "@/components/AddTaskSheet";
import { AddPropertySheet } from "@/components/AddPropertySheet";
import { CompleteTaskDialog } from "@/components/CompleteTaskDialog";
import { EditEventSheet } from "@/components/EditEventSheet";
import { EditTaskSheet } from "@/components/EditTaskSheet";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-display font-semibold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-display font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-display font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Fernwood — Property Maintenance" },
      { name: "description", content: "Calm, structured maintenance tracking for small property managers." },
      { name: "author", content: "Fernwood" },
      { property: "og:title", content: "Fernwood — Property Maintenance" },
      { property: "og:description", content: "Calm, structured maintenance tracking for small property managers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: faviconAsset.url },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const pathname = router.state.location.pathname;
  const isAuthRoute = pathname === "/auth";

  useEffect(() => {
    let cancelled = false;
    let unsub: (() => void) | undefined;
    (async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      if (cancelled) return;
      const { data: sub } = supabase.auth.onAuthStateChange((event) => {
        if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
          router.invalidate();
          if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
        }
      });
      unsub = () => sub.subscription.unsubscribe();
    })();
    return () => {
      cancelled = true;
      unsub?.();
    };
  }, [router, queryClient]);

  if (isAuthRoute) {
    return (
      <QueryClientProvider client={queryClient}>
        <Outlet />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen w-full bg-paper text-bark">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <MobileTopBar />
          <main className="flex-1 flex overflow-hidden">
            <div className="flex-1 min-w-0 overflow-y-auto">
              <Outlet />
            </div>
            <TaskDetailPane />
          </main>
        </div>
      </div>
      <TaskDetailSheet />
      <AddPropertySheet />
      <AddTaskSheet />
      <CompleteTaskDialog />
      <EditEventSheet />
      <EditTaskSheet />
    </QueryClientProvider>
  );
}
