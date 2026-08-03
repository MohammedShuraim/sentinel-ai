import { AmbientBackground } from "@/components/landing/AmbientBackground";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg px-4 py-10">
      {/* same atmosphere as the landing page: layered glow, neural net, particles */}
      <AmbientBackground />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgb(255_255_255/0.025)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.025)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(75%_60%_at_50%_0%,black,transparent)]"
      />
      <div className="relative w-full max-w-md animate-fade-up">{children}</div>
    </div>
  );
}
