import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Analyst",
  description: "Context-aware answers for Indian stocks, with sources.",
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
