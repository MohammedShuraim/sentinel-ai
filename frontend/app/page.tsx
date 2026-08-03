import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { AmbientBackground } from "@/components/landing/AmbientBackground";
import { ChartParallax } from "@/components/landing/ChartParallax";
import {
  CinematicLink,
  ExitScope,
  LandingTransitionProvider,
} from "@/components/landing/LandingTransition";

export default function LandingPage() {
  return (
    <LandingTransitionProvider>
      <main className="relative flex min-h-screen flex-col overflow-hidden bg-bg text-fg">
        {/* Background: layered AI glow, neural network, particles, grid */}
        <ExitScope layer="ambient" className="absolute inset-0">
          <AmbientBackground />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgb(255_255_255/0.03)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.03)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(75%_60%_at_50%_0%,black,transparent)]"
          />
        </ExitScope>

        {/* Navigation */}
        <ExitScope layer="nav" className="relative z-10">
          <nav className="flex w-full items-center justify-between px-6 py-5 sm:px-10">
            <Logo size="md" />
            <CinematicLink href="/login">
              <Button variant="outline" size="md">
                Get Started
              </Button>
            </CinematicLink>
          </nav>
        </ExitScope>

        {/* Hero + CTA */}
        <section className="relative z-10 flex flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
          {/* Animated market visualization behind the copy */}
          <ExitScope layer="chart" className="absolute inset-0 z-0">
            <ChartParallax />
          </ExitScope>
          {/* readability scrim so the heading stays crisp over the graph */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(52%_42%_at_50%_50%,rgb(9_11_15/0.78),transparent_78%)]"
          />

          <ExitScope layer="hero" className="relative z-10">
            <div className="max-w-4xl">
              <h1 className="font-display text-4xl font-semibold tracking-tight text-fg sm:text-5xl md:text-6xl">
                Sentellent AI
              </h1>
              <p className="mt-4 font-display text-xl font-medium text-brand sm:text-2xl md:text-3xl">
                Intelligent Stock Analysis for the Indian Market
              </p>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-fg-muted sm:text-lg">
                Sentellent combines AI reasoning with real-time NSE data to
                deliver personalized stock insights, portfolio intelligence, and
                source-backed analysis. Built for Indian investors who demand
                clarity.
              </p>
            </div>
          </ExitScope>

          <ExitScope layer="hero" className="relative z-10">
            <CinematicLink href="/login">
              <Button variant="primary" size="lg" className="shadow-glow">
                Launch Sentellent
              </Button>
            </CinematicLink>
          </ExitScope>
        </section>

        {/* Footer spacing */}
        <ExitScope layer="footer" className="relative z-10">
          <footer className="py-8 text-center text-xs text-fg-subtle">
            © {new Date().getFullYear()} Sentellent. All rights reserved.
          </footer>
        </ExitScope>
      </main>
    </LandingTransitionProvider>
  );
}
