import { createFileRoute, useNavigate, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import faviconAsset from "@/assets/fernwood-favicon.png.asset.json";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — Fernwood" },
      { name: "description", content: "Sign in to Fernwood to manage your property maintenance." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session);
      setSessionChecked(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate({ to: "/" });
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  if (sessionChecked && hasSession) {
    return <Navigate to="/" />;
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        setError("Check your email to confirm your account, then sign in.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }


  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <img src={faviconAsset.url} alt="" className="size-8 rounded-md" />
          <h1 className="font-display font-semibold text-2xl tracking-tight text-bark">Fernwood</h1>
        </div>

        <div className="bg-card rounded-lg ring-1 ring-black/5 p-6">
          <h2 className="font-display font-semibold text-lg text-bark mb-1">
            {mode === "signin" ? "Sign in" : "Create your account"}
          </h2>
          <p className="text-sm text-bark/60 mb-5">
            {mode === "signin"
              ? "Welcome back."
              : "Start tracking maintenance across your properties."}
          </p>


          <form onSubmit={handleEmail} className="space-y-3">
            <label className="block">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-bark/45 mb-1.5">
                Email
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-paper rounded-md px-3 py-2 text-sm ring-1 ring-black/5 focus:outline-none focus:ring-fern"
              />
            </label>
            <label className="block">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-bark/45 mb-1.5">
                Password
              </span>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-paper rounded-md px-3 py-2 text-sm ring-1 ring-black/5 focus:outline-none focus:ring-fern"
              />
            </label>

            {error && (
              <p className="text-xs text-red-700 bg-red-50 rounded-md px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full bg-fern text-paper text-sm font-medium py-2.5 rounded-md ring-1 ring-fern/80 hover:bg-fern/90 disabled:opacity-50"
            >
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setError(null);
              setMode(mode === "signin" ? "signup" : "signin");
            }}
            className="mt-4 w-full text-xs text-bark/60 hover:text-bark"
          >
            {mode === "signin"
              ? "No account yet? Create one"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

