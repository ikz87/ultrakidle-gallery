import { createContext, useContext } from "react";
import type { Session, User } from "@supabase/supabase-js";

export interface AuthContextValue {
  session: Session | null;
  user: User | null;
  discordId: string | null;
  /** submitter_profiles ids owned by the logged-in Discord account */
  ownSubmitterIds: number[];
  loading: boolean;
  authError: string | null;
  signInWithDiscord: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

// Discord accounts that can manage other people's submissions. Mirrors the
// ADMIN_DISCORD_IDS set in the delete-submission edge function, which is the
// only thing that actually enforces it.
export const ADMIN_DISCORD_IDS = ["218938202386333697"];

export function isGalleryAdmin(discordId: string | null): boolean {
  return Boolean(discordId) && ADMIN_DISCORD_IDS.includes(discordId!);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}
