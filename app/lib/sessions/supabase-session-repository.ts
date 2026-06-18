import { createSupabaseAdminClient } from "@/app/lib/supabase/admin";
import type { Database } from "@/app/lib/supabase/database.types";
import type { PhotoBoothSession, SessionRepository } from "./types";

type SessionRow = Database["public"]["Tables"]["sessions"]["Row"];

function mapRowToSession(row: SessionRow): PhotoBoothSession {
  return {
    sessionId: row.session_id,
    projectName: row.project_name,
    createdAt: row.created_at,
    photos: [row.photo1_url, row.photo2_url, row.photo3_url],
    stripUrl: row.strip_url,
    gifUrl: row.gif_url,
  };
}

export class SupabaseSessionRepository implements SessionRepository {
  async findBySessionId(sessionId: string): Promise<PhotoBoothSession | null> {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("sessions")
      .select(
        "session_id, project_name, created_at, photo1_url, photo2_url, photo3_url, strip_url, gif_url",
      )
      .eq("session_id", sessionId)
      .maybeSingle();

    if (error) {
      console.error("[session-repository] Failed to read session", {
        sessionId,
        error,
      });
      throw error;
    }

    if (!data) {
      return null;
    }

    return mapRowToSession(data as SessionRow);
  }
}
