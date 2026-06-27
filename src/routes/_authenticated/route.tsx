import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/auth" });
    }
    return { user: data.user };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const hydrate = useStore((s) => s.hydrate);
  const reset = useStore((s) => s.reset);

  useEffect(() => {
    hydrate();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        reset();
        hydrate();
      } else if (event === "SIGNED_OUT") {
        reset();
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [hydrate, reset]);

  // Live updates: any change to properties / tasks / events from another
  // device (or another tab) triggers a re-hydrate. RLS still applies to the
  // refetch, so a user only sees rows they're allowed to see.
  useEffect(() => {
    let pending: ReturnType<typeof setTimeout> | null = null;
    const schedule = () => {
      if (pending) return;
      pending = setTimeout(() => {
        pending = null;
        hydrate();
      }, 250);
    };

    const channel = supabase
      .channel("store-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "properties" }, schedule)
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, schedule)
      .on("postgres_changes", { event: "*", schema: "public", table: "events" }, schedule)
      .subscribe();

    return () => {
      if (pending) clearTimeout(pending);
      supabase.removeChannel(channel);
    };
  }, [hydrate]);

  return <Outlet />;
}

