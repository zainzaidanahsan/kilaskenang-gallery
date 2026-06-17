import { readFile } from "node:fs/promises";
import path from "node:path";
import type { PhotoBoothSession, SessionRepository } from "./types";

type FileSessionRepositoryOptions = {
  sessionsRoot: string;
};

function isPhotoBoothSession(value: unknown): value is PhotoBoothSession {
  if (!value || typeof value !== "object") {
    return false;
  }

  const session = value as Partial<PhotoBoothSession>;

  return (
    typeof session.sessionId === "string" &&
    typeof session.projectName === "string" &&
    typeof session.createdAt === "string" &&
    typeof session.stripUrl === "string" &&
    typeof session.gifUrl === "string" &&
    Array.isArray(session.photos) &&
    session.photos.every((photo) => typeof photo === "string")
  );
}

export class FileSessionRepository implements SessionRepository {
  private readonly sessionsRoot: string;

  constructor(options: FileSessionRepositoryOptions) {
    this.sessionsRoot = path.resolve(options.sessionsRoot);
  }

  async findBySessionId(sessionId: string): Promise<PhotoBoothSession | null> {
    const sessionFilePath = this.resolveSessionFilePath(sessionId);

    if (!sessionFilePath) {
      return null;
    }

    try {
      const rawSession = await readFile(sessionFilePath, "utf8");
      const session = JSON.parse(rawSession);

      if (!isPhotoBoothSession(session) || session.sessionId !== sessionId) {
        return null;
      }

      return session;
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        error.code === "ENOENT"
      ) {
        return null;
      }

      throw error;
    }
  }

  private resolveSessionFilePath(sessionId: string) {
    const sessionFilePath = path.resolve(
      this.sessionsRoot,
      sessionId,
      "session.json",
    );

    if (!sessionFilePath.startsWith(this.sessionsRoot + path.sep)) {
      return null;
    }

    return sessionFilePath;
  }
}
