import path from "node:path";
import { FileSessionUploader } from "@/app/lib/sessions/file-session-uploader";

export const runtime = "nodejs";

const requiredFileFields = ["photo1", "photo2", "photo3", "strip", "gif"] as const;

type RequiredFileField = (typeof requiredFileFields)[number];

const sessionUploader = new FileSessionUploader({
  sessionsRoot: path.join(process.cwd(), "storage", "sessions"),
});

function getRequiredFile(formData: FormData, field: RequiredFileField) {
  const value = formData.get(field);

  if (!(value instanceof File)) {
    return null;
  }

  return value;
}

function getGalleryBaseUrl() {
  return (
    process.env.GALLERY_BASE_URL ??
    process.env.NEXT_PUBLIC_GALLERY_BASE_URL ??
    "https://gallery.kilaskenang.my.id"
  ).replace(/\/$/, "");
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const projectName = formData.get("projectName");

  if (typeof projectName !== "string" || projectName.trim().length === 0) {
    return Response.json(
      { error: "projectName is required" },
      { status: 400 },
    );
  }

  const files = {
    photo1: getRequiredFile(formData, "photo1"),
    photo2: getRequiredFile(formData, "photo2"),
    photo3: getRequiredFile(formData, "photo3"),
    strip: getRequiredFile(formData, "strip"),
    gif: getRequiredFile(formData, "gif"),
  };

  const missingFiles = requiredFileFields.filter((field) => !files[field]);

  if (missingFiles.length > 0) {
    return Response.json(
      {
        error: "Missing required files",
        fields: missingFiles,
      },
      { status: 400 },
    );
  }

  const session = await sessionUploader.createSession({
    projectName: projectName.trim(),
    files: {
      photo1: files.photo1!,
      photo2: files.photo2!,
      photo3: files.photo3!,
      strip: files.strip!,
      gif: files.gif!,
    },
  });

  return Response.json(
    {
      sessionId: session.sessionId,
      galleryUrl: `${getGalleryBaseUrl()}/s/${session.sessionId}`,
    },
    { status: 201 },
  );
}
