import { Simulator } from "@/components/Simulator";

export default function Home() {
  return (
    <>
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-8 sm:px-6">
        <p className="font-jakarta text-sm font-semibold uppercase tracking-[0.2em] text-white">
          <span className="text-gold">S</span>&apos;investir{" "}
          <span className="text-white/60">Simulateurs</span>
        </p>
        <a
          href="https://simulateurs.sinvestir.fr"
          className="rounded-full border border-white/15 px-4 py-2 text-xs font-medium text-white/70 transition hover:border-white/30 hover:text-white"
        >
          Découvrir S&apos;investir
        </a>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24 sm:px-6">
        <Simulator />
      </main>
    </>
  );
}
