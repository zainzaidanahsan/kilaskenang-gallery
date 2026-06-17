import type { Metadata } from "next";

type GalleryPhoto = {
  id: number;
  label: string;
  time: string;
  className: string;
};

type SessionGallery = {
  title: string;
  date: string;
  stripCode: string;
  photos: GalleryPhoto[];
};

const mockSession: SessionGallery = {
  title: "Rani & Dimas",
  date: "17 Juni 2026",
  stripCode: "KK-0617",
  photos: [
    {
      id: 1,
      label: "Photo 1",
      time: "15:08",
      className: "from-rose-100 via-sky-100 to-white",
    },
    {
      id: 2,
      label: "Photo 2",
      time: "15:09",
      className: "from-emerald-100 via-amber-100 to-white",
    },
    {
      id: 3,
      label: "Photo 3",
      time: "15:10",
      className: "from-violet-100 via-pink-100 to-white",
    },
  ],
};

const downloadActions = [
  { label: "Download Strip", fileName: "kilas-kenang-strip.txt" },
  { label: "Download GIF", fileName: "kilas-kenang-gif.txt" },
  { label: "Download All Photos", fileName: "kilas-kenang-photos.txt" },
];

type Props = {
  params: Promise<{ sessionId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sessionId } = await params;

  return {
    title: `${mockSession.title} | Kilas Kenang`,
    description: `Public gallery for Kilas Kenang session ${sessionId}.`,
  };
}

function LogoMark() {
  return (
    <div className="grid size-11 place-items-center rounded-xl bg-[#111827] text-sm font-bold text-white shadow-sm">
      KK
    </div>
  );
}

function MockPhoto({
  photo,
  compact = false,
}: {
  photo: GalleryPhoto;
  compact?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-md bg-gradient-to-br ${photo.className} shadow-sm ring-1 ring-black/5`}
    >
      <div className="absolute inset-x-5 bottom-5 top-8 rounded-t-full bg-white/55 blur-[1px]" />
      <div className="absolute left-1/2 top-10 size-14 -translate-x-1/2 rounded-full bg-white/80 shadow-sm" />
      <div className="absolute inset-x-6 bottom-7 h-24 rounded-[50%_50%_12px_12px] bg-white/70 shadow-sm" />
      <div className="absolute inset-x-3 bottom-3 flex items-center justify-between rounded bg-white/80 px-3 py-2 text-[11px] font-semibold text-zinc-700 backdrop-blur">
        <span>{photo.label}</span>
        {!compact && <span>{photo.time}</span>}
      </div>
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

export default async function SessionGalleryPage({ params }: Props) {
  const { sessionId } = await params;

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
              {mockSession.title}
            </h1>
          </div>
        </header>

        <div className="grid flex-1 gap-8 py-7 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <Section title="Photostrip Preview">
            <div className="mx-auto w-full max-w-[310px] rounded-md bg-white p-3 shadow-sm ring-1 ring-black/5">
              <div className="space-y-3">
                {mockSession.photos.map((photo) => (
                  <div key={photo.id} className="aspect-[4/3]">
                    <MockPhoto photo={photo} compact />
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-3 text-xs font-semibold text-zinc-700">
                <span>{mockSession.stripCode}</span>
                <span>{mockSession.date}</span>
              </div>
            </div>
          </Section>

          <div className="space-y-8">
            <Section title="Original Photos">
              <div className="grid gap-3 sm:grid-cols-3">
                {mockSession.photos.map((photo) => (
                  <div key={photo.id} className="aspect-[4/5]">
                    <MockPhoto photo={photo} />
                  </div>
                ))}
              </div>
            </Section>

            <Section title="GIF Preview">
              <div className="overflow-hidden rounded-md bg-zinc-950 p-3 shadow-sm">
                <div className="relative aspect-video overflow-hidden rounded bg-gradient-to-br from-cyan-100 via-white to-rose-100">
                  <div className="absolute inset-0 grid grid-cols-3 gap-2 p-3">
                    {mockSession.photos.map((photo) => (
                      <MockPhoto key={photo.id} photo={photo} compact />
                    ))}
                  </div>
                  <div className="absolute bottom-3 left-3 rounded bg-zinc-950/80 px-3 py-1 text-xs font-semibold text-white">
                    GIF Preview
                  </div>
                </div>
              </div>
            </Section>

            <Section title="Download Buttons">
              <div className="grid gap-3 sm:grid-cols-3">
                {downloadActions.map((action) => (
                  <a
                    key={action.label}
                    className="inline-flex min-h-12 items-center justify-center rounded-md bg-zinc-950 px-4 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 focus:ring-offset-[#f7f4ef]"
                    href={`data:text/plain;charset=utf-8,Kilas%20Kenang%20mock%20download%20for%20session%20${encodeURIComponent(
                      sessionId,
                    )}`}
                    download={action.fileName}
                  >
                    {action.label}
                  </a>
                ))}
              </div>
            </Section>
          </div>
        </div>

        <footer className="border-t border-zinc-900/10 py-5 text-center text-sm font-medium text-zinc-500">
          Powered by Kilas Kenang
        </footer>
      </div>
    </main>
  );
}
