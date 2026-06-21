import type { Metadata } from "next";
import { GalleryClient } from "./gallery-client";

type Props = {
  params: Promise<{ sessionId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sessionId } = await params;

  return {
    title: `Session ${sessionId} | Kilas Kenang`,
    description: `Public gallery for Kilas Kenang session ${sessionId}.`,
  };
}

export default async function SessionGalleryPage({ params }: Props) {
  const { sessionId } = await params;

  return <GalleryClient sessionId={sessionId} />;
}
