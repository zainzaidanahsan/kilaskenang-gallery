import { sessionWriter } from "@/app/lib/sessions/session-writer";
import { DuplicateSessionError } from "@/app/lib/sessions/supabase-session-writer";
import type { CreateSessionMetadataInput } from "@/app/lib/sessions/types";

export const runtime = "nodejs";

const requiredFields = [
  "projectName",
  "sessionId",
  "photo1Url",
  "photo2Url",
  "photo3Url",
  "stripUrl",
  "gifUrl",
] as const;

type RequiredField = (typeof requiredFields)[number];

function getGalleryBaseUrl() {
  return (
    process.env.GALLERY_BASE_URL ??
    process.env.NEXT_PUBLIC_GALLERY_BASE_URL ??
    "https://gallery.kilaskenang.my.id"
  ).replace(/\/$/, "");
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isValidSessionId(sessionId: string) {
  return /^[A-Za-z0-9_-]{3,64}$/.test(sessionId);
}

function isValidPublicUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function validatePayload(
  body: unknown,
): { data: CreateSessionMetadataInput } | { error: string; fields?: string[] } {
  if (!isPlainObject(body)) {
    return { error: "Expected JSON object" };
  }

  const missingFields = requiredFields.filter((field) => {
    const value = body[field];
    return typeof value !== "string" || value.trim().length === 0;
  });

  if (missingFields.length > 0) {
    return {
      error: "Missing required fields",
      fields: missingFields,
    };
  }

  const payload = Object.fromEntries(
    requiredFields.map((field) => [field, String(body[field]).trim()]),
  ) as Record<RequiredField, string>;

  if (!isValidSessionId(payload.sessionId)) {
    return {
      error:
        "sessionId must be 3-64 characters and contain only letters, numbers, underscores, or hyphens",
      fields: ["sessionId"],
    };
  }

  const urlFields = requiredFields.filter((field) => field.endsWith("Url"));
  const invalidUrlFields = urlFields.filter(
    (field) => !isValidPublicUrl(payload[field]),
  );

  if (invalidUrlFields.length > 0) {
    return {
      error: "Asset URLs must be valid http or https URLs",
      fields: invalidUrlFields,
    };
  }

  return {
    data: {
      projectName: payload.projectName,
      sessionId: payload.sessionId,
      photo1Url: payload.photo1Url,
      photo2Url: payload.photo2Url,
      photo3Url: payload.photo3Url,
      stripUrl: payload.stripUrl,
      gifUrl: payload.gifUrl,
    },
  };
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch (error) {
    console.error("[api/create-session] Invalid JSON request body", {
      error,
    });

    return Response.json(
      { error: "Expected application/json request body" },
      { status: 400 },
    );
  }

  const validation = validatePayload(body);

  if ("error" in validation) {
    return Response.json(validation, { status: 400 });
  }

  try {
    const session = await sessionWriter.createSession(validation.data);

    return Response.json(
      {
        sessionId: session.sessionId,
        galleryUrl: `${getGalleryBaseUrl()}/s/${session.sessionId}`,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof DuplicateSessionError) {
      return Response.json(
        {
          error: "Session already exists",
          sessionId: validation.data.sessionId,
        },
        { status: 409 },
      );
    }

    console.error("[api/create-session] Failed to create session metadata", {
      sessionId: validation.data.sessionId,
      error,
    });

    return Response.json(
      {
        error: "Unable to create session",
      },
      { status: 500 },
    );
  }
}
