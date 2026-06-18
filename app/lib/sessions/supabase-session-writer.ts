import { createSupabaseAdminClient } from "@/app/lib/supabase/admin";
import type { Database } from "@/app/lib/supabase/database.types";
import type { CreateSessionMetadataInput, PhotoBoothSession } from "./types";

type SessionInsert = Database["public"]["Tables"]["sessions"]["Insert"];

export class DuplicateSessionError extends Error {
  constructor(sessionId: string) {
    super(`Session already exists: ${sessionId}`);
    this.name = "DuplicateSessionError";
  }
}

export class SupabaseSessionWriter {
  async createSession(
    input: CreateSessionMetadataInput,
  ): Promise<PhotoBoothSession> {
    const supabase = createSupabaseAdminClient();
    const sessionRow: SessionInsert = {
      session_id: input.sessionId,
      project_name: input.projectName,
      created_at: new Date().toISOString(),
      photo1_url: input.photo1Url,
      photo2_url: input.photo2Url,
      photo3_url: input.photo3Url,
      strip_url: input.stripUrl,
      gif_url: input.gifUrl,
    };

    const { error } = await supabase.from("sessions").insert(sessionRow);

    if (error) {
      console.error("[session-writer] Failed to insert session metadata", {
        sessionId: input.sessionId,
        error,
      });

      if ("code" in error && error.code === "23505") {
        throw new DuplicateSessionError(input.sessionId);
      }

      throw error;
    }

    return {
      sessionId: sessionRow.session_id,
      projectName: sessionRow.project_name,
      createdAt: sessionRow.created_at,
      photos: [sessionRow.photo1_url, sessionRow.photo2_url, sessionRow.photo3_url],
      stripUrl: sessionRow.strip_url,
      gifUrl: sessionRow.gif_url,
    };
  }
}
