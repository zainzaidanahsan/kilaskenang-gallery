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

export type CreateSessionMetadataInput = {
  projectName: string;
  sessionId: string;
  photo1Url: string;
  photo2Url: string;
  photo3Url: string;
  stripUrl: string;
  gifUrl: string;
};
