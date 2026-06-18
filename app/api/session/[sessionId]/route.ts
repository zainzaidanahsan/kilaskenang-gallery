import { sessionRepository } from "@/app/lib/sessions/session-repository";

type RouteParams = {
  params: Promise<{
    sessionId: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
  const { sessionId } = await params;

  try {
    const session = await sessionRepository.findBySessionId(sessionId);

    if (!session) {
      return Response.json(
        {
          error: "Session not found",
          sessionId,
        },
        { status: 404 },
      );
    }

    return Response.json(session);
  } catch (error) {
    console.error("[api/session] Failed to load session", {
      sessionId,
      error,
    });

    return Response.json(
      {
        error: "Unable to load session",
      },
      { status: 500 },
    );
  }
}
