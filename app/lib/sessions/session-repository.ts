import { SupabaseSessionRepository } from "./supabase-session-repository";
import type { SessionRepository } from "./types";

export const sessionRepository: SessionRepository =
  new SupabaseSessionRepository();
