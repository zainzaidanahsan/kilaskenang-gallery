import Link from "next/link";

export default function Home() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f4ef] px-4 text-zinc-950">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-xl bg-zinc-950 text-base font-bold text-white shadow-sm">
          KK
        </div>
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Kilas Kenang
          </p>
          <h1 className="text-4xl font-semibold">Session galleries</h1>
          <p className="text-base leading-7 text-zinc-600">
            A simple public gallery shell for photobooth sessions.
          </p>
        </div>
        <Link
          className="inline-flex min-h-12 items-center justify-center rounded-md bg-zinc-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 focus:ring-offset-[#f7f4ef]"
          href="/s/demo-session"
        >
          View mock session
        </Link>
      </div>
    </main>
  );
}
