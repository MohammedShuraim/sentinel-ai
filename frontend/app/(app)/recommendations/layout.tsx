import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Recommendations",
  description:
    "Personalized investment opportunities based on your profile and AI analysis.",
};

export default function RecommendationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
