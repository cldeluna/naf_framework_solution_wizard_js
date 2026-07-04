import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

export interface AuthState {
  /** False while the initial session lookup is in flight. */
  ready: boolean;
  session: Session | null;
  user: User | null;
  /** JSON-only mode: no env vars, hide all auth/DB UI. */
  configured: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

/**
 * Auth session hook. supabase-js persists the session in localStorage and
 * handles the OAuth redirect return automatically, so unlike the Streamlit
 * app, signing in does not lose wizard state (the draft also survives in
 * localStorage — SPEC §3.4).
 */
export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(!isSupabaseConfigured);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return {
    ready,
    session,
    user: session?.user ?? null,
    configured: isSupabaseConfigured,
    signInWithGoogle: async () => {
      if (!supabase) return;
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
    },
    signOut: async () => {
      if (!supabase) return;
      await supabase.auth.signOut();
    },
  };
}
