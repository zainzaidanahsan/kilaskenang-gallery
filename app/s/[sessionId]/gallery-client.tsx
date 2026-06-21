"use client";

import { saveAs } from "file-saver";
import JSZip from "jszip";
import { useEffect, useMemo, useState } from "react";

type SessionResponse = {
  sessionId: string;
  projectName: string;
  createdAt: string;
  photos?: string[];
  stripUrl?: string;
  gifUrl?: string;
};

type GalleryAsset = {
  label: string;
  url: string;
  fileName: string;
};

type DebugUrl = {
  label: string;
  value?: string;
};

function LogoMark() {
  return (
    <div className="grid size-11 place-items-center rounded-xl bg-[#111827] text-sm font-bold text-white shadow-sm">
      KK
    </div>
  );
}

function Section({
  title,
  children,
}: Readonly<{
  title: string;
  children: React.ReactNode;
}>) {
  return (
    <section className="space-y-4">
      <h2 className="text-base font-semibold text-zinc-950">{title}</h2>
      {children}
    </section>
  );
}

function GalleryImage({
  alt,
  className = "h-full w-full",
  imageClassName = "object-cover",
  src,
}: {
  alt: string;
  className?: string;
  imageClassName?: string;
  src?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src) {
    return (
      <div
        className={`grid place-items-center rounded-md bg-white text-sm font-semibold text-zinc-500 ring-1 ring-black/5 ${className}`}
      >
        URL missing
      </div>
    );
  }

  if (failed) {
    return (
      <div
        className={`grid place-items-center rounded-md bg-white text-sm font-semibold text-zinc-500 ring-1 ring-black/5 ${className}`}
      >
        Image unavailable
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt}
      className={`rounded-md bg-white ${className} ${imageClassName}`}
      loading="lazy"
      onError={() => setFailed(true)}
      src={src}
    />
  );
}

function DebugPanel({ urls }: { urls: DebugUrl[] }) {
  return (
    <section className="space-y-3 rounded-md border border-zinc-300 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-zinc-950">Debug URLs</h2>
      <dl className="space-y-2 text-xs">
        {urls.map((url) => (
          <div className="grid gap-1 sm:grid-cols-[90px_1fr]" key={url.label}>
            <dt className="font-semibold text-zinc-600">{url.label}</dt>
            <dd className="break-all font-mono text-zinc-950">
              {url.value || "URL missing"}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function DownloadButton({
  asset,
  onDownload,
}: Readonly<{
  asset: GalleryAsset;
  onDownload: (asset: GalleryAsset) => void;
}>) {
  return (
    <button
      className="inline-flex min-h-12 items-center justify-center rounded-md bg-zinc-950 px-4 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 focus:ring-offset-[#f7f4ef]"
      onClick={() => onDownload(asset)}
      type="button"
    >
      Download {asset.label}
    </button>
  );
}

export function GalleryClient({ sessionId }: { sessionId: string }) {
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingAll, setDownloadingAll] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadSession() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/session/${sessionId}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Session request failed with ${response.status}`);
        }

        const data = (await response.json()) as SessionResponse;

        if (!ignore) {
          setSession(data);
        }
      } catch (loadError) {
        if (!ignore) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load session",
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadSession();

    return () => {
      ignore = true;
    };
  }, [sessionId]);

  const assets = useMemo<GalleryAsset[]>(() => {
    if (!session) {
      return [];
    }

    const assetCandidates = [
      { label: "Strip", url: session.stripUrl, fileName: "strip.png" },
      { label: "GIF", url: session.gifUrl, fileName: "gif.gif" },
      { label: "Photo 1", url: session.photos?.[0], fileName: "photo1.jpg" },
      { label: "Photo 2", url: session.photos?.[1], fileName: "photo2.jpg" },
      { label: "Photo 3", url: session.photos?.[2], fileName: "photo3.jpg" },
    ];

    return assetCandidates.filter(
      (asset): asset is GalleryAsset => typeof asset.url === "string",
    );
  }, [session]);

  const debugUrls = useMemo<DebugUrl[]>(() => {
    if (!session) {
      return [];
    }

    return [
      { label: "stripUrl", value: session.stripUrl },
      { label: "gifUrl", value: session.gifUrl },
      { label: "photos[0]", value: session.photos?.[0] },
      { label: "photos[1]", value: session.photos?.[1] },
      { label: "photos[2]", value: session.photos?.[2] },
    ];
  }, [session]);

  async function downloadAsset(asset: GalleryAsset) {
    setError(null);

    try {
      const response = await fetch(asset.url);

      if (!response.ok) {
        throw new Error(`Failed to download ${asset.fileName}`);
      }

      saveAs(await response.blob(), asset.fileName);
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : "Unable to download file",
      );
    }
  }

  async function downloadAll() {
    if (!session) {
      return;
    }

    setDownloadingAll(true);
    setError(null);

    try {
      const zip = new JSZip();

      await Promise.all(
        assets.map(async (asset) => {
          const response = await fetch(asset.url);

          if (!response.ok) {
            throw new Error(`Failed to download ${asset.fileName}`);
          }

          zip.file(asset.fileName, await response.blob());
        }),
      );

      const blob = await zip.generateAsync({ type: "blob" });
      saveAs(blob, `kilas-kenang-${session.sessionId}.zip`);
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : "Unable to download files",
      );
    } finally {
      setDownloadingAll(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f4ef] text-zinc-950">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex items-center gap-3 border-b border-zinc-900/10 pb-5">
          <LogoMark />
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Kilas Kenang
            </p>
            <h1 className="truncate text-2xl font-semibold text-zinc-950 sm:text-3xl">
              {session?.projectName ?? "Loading session"}
            </h1>
          </div>
        </header>

        {loading && (
          <div className="grid flex-1 place-items-center py-16 text-sm font-semibold text-zinc-500">
            Loading session...
          </div>
        )}

        {!loading && error && !session && (
          <div className="grid flex-1 place-items-center py-16 text-center">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-zinc-950">
                Session unavailable
              </h2>
              <p className="text-sm text-zinc-600">{error}</p>
            </div>
          </div>
        )}

        {!loading && session && (
          <div className="grid flex-1 gap-8 py-7 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <Section title="Photostrip Preview">
              <div className="mx-auto w-full max-w-[310px] rounded-md bg-white p-3 shadow-sm ring-1 ring-black/5">
                <div className="aspect-[2/5] overflow-hidden rounded-md">
                  <GalleryImage
                    alt={`${session.projectName} photostrip`}
                    imageClassName="object-contain"
                    src={session.stripUrl}
                  />
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-3 text-xs font-semibold text-zinc-700">
                  <span>{session.sessionId}</span>
                  <span>
                    {new Date(session.createdAt).toLocaleDateString("id-ID")}
                  </span>
                </div>
              </div>
            </Section>

            <div className="space-y-8">
              <DebugPanel urls={debugUrls} />

              <Section title="Original Photos">
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { label: "Photo 1", url: session.photos?.[0] },
                    { label: "Photo 2", url: session.photos?.[1] },
                    { label: "Photo 3", url: session.photos?.[2] },
                  ].map((photo) => (
                    <div key={photo.label} className="aspect-[4/5]">
                      <GalleryImage alt={photo.label} src={photo.url} />
                    </div>
                  ))}
                </div>
              </Section>

              <Section title="GIF Preview">
                <div className="overflow-hidden rounded-md bg-zinc-950 p-3 shadow-sm">
                  <div className="aspect-video overflow-hidden rounded-md">
                    <GalleryImage
                      alt={`${session.projectName} GIF`}
                      imageClassName="object-contain"
                      src={session.gifUrl}
                    />
                  </div>
                </div>
              </Section>

              <Section title="Download Buttons">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {assets.map((asset) => (
                    <DownloadButton
                      asset={asset}
                      key={asset.label}
                      onDownload={downloadAsset}
                    />
                  ))}
                  <button
                    className="inline-flex min-h-12 items-center justify-center rounded-md border border-zinc-950 px-4 text-center text-sm font-semibold text-zinc-950 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 focus:ring-offset-[#f7f4ef] disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={downloadingAll}
                    onClick={downloadAll}
                    type="button"
                  >
                    {downloadingAll ? "Preparing ZIP..." : "Download All"}
                  </button>
                </div>
                {error && (
                  <p className="text-sm font-medium text-red-700">{error}</p>
                )}
              </Section>

              {process.env.NODE_ENV !== "production" && (
                <Section title="Session payload">
                  <pre className="max-h-80 overflow-auto rounded-md bg-zinc-950 p-4 text-xs leading-5 text-zinc-50">
                    {JSON.stringify(session, null, 2)}
                  </pre>
                </Section>
              )}
            </div>
          </div>
        )}

        <footer className="border-t border-zinc-900/10 py-5 text-center text-sm font-medium text-zinc-500">
          Powered by Kilas Kenang
        </footer>
      </div>
    </main>
  );
}
