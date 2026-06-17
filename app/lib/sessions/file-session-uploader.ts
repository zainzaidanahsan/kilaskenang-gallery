import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { PhotoBoothSession } from "./types";

type SessionUploadFiles = {
  photo1: File;
  photo2: File;
  photo3: File;
  strip: File;
  gif: File;
};

type CreateSessionInput = {
  projectName: string;
  files: SessionUploadFiles;
};

type FileSessionUploaderOptions = {
  sessionsRoot: string;
};

const fileNames = {
  photo1: "photo1.jpg",
  photo2: "photo2.jpg",
  photo3: "photo3.jpg",
  strip: "strip.png",
  gif: "gif.gif",
} as const;

export class FileSessionUploader {
  private readonly sessionsRoot: string;

  constructor(options: FileSessionUploaderOptions) {
    this.sessionsRoot = path.resolve(options.sessionsRoot);
  }

  async createSession(input: CreateSessionInput): Promise<PhotoBoothSession> {
    const { sessionId, sessionFolder } = await this.createSessionFolder();
    const publicSessionPath = `/sessions/${sessionId}`;

    await Promise.all([
      this.saveFile(input.files.photo1, sessionFolder, fileNames.photo1),
      this.saveFile(input.files.photo2, sessionFolder, fileNames.photo2),
      this.saveFile(input.files.photo3, sessionFolder, fileNames.photo3),
      this.saveFile(input.files.strip, sessionFolder, fileNames.strip),
      this.saveFile(input.files.gif, sessionFolder, fileNames.gif),
    ]);

    const session: PhotoBoothSession = {
      sessionId,
      projectName: input.projectName,
      createdAt: new Date().toISOString().slice(0, 10),
      photos: [
        `${publicSessionPath}/${fileNames.photo1}`,
        `${publicSessionPath}/${fileNames.photo2}`,
        `${publicSessionPath}/${fileNames.photo3}`,
      ],
      stripUrl: `${publicSessionPath}/${fileNames.strip}`,
      gifUrl: `${publicSessionPath}/${fileNames.gif}`,
    };

    await writeFile(
      path.join(sessionFolder, "session.json"),
      `${JSON.stringify(session, null, 2)}\n`,
      "utf8",
    );

    return session;
  }

  private async createSessionFolder() {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const sessionId = this.generateSessionId();
      const sessionFolder = path.join(this.sessionsRoot, sessionId);

      try {
        await mkdir(sessionFolder, { recursive: false });
        return { sessionId, sessionFolder };
      } catch (error) {
        if (
          error instanceof Error &&
          "code" in error &&
          error.code === "EEXIST"
        ) {
          continue;
        }

        throw error;
      }
    }

    throw new Error("Unable to generate a unique session id");
  }

  private generateSessionId() {
    return randomBytes(4).toString("hex").toUpperCase();
  }

  private async saveFile(file: File, sessionFolder: string, fileName: string) {
    const filePath = path.join(sessionFolder, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());

    await writeFile(filePath, buffer);
  }
}
