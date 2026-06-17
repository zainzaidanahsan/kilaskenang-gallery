import path from "node:path";
import { FileSessionRepository } from "./file-session-repository";
import type { SessionRepository } from "./types";

const sessionsRoot = path.join(process.cwd(), "storage", "sessions");

// Swap this provider for an upload-aware or Supabase-backed repository later.
export const sessionRepository: SessionRepository = new FileSessionRepository({
  sessionsRoot,
});
