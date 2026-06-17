export type PhotoBoothSession = {
  sessionId: string;
  projectName: string;
  createdAt: string;
  stripUrl: string;
  gifUrl: string;
  photos: string[];
};

export type SessionRepository = {
  findBySessionId(sessionId: string): Promise<PhotoBoothSession | null>;
};
