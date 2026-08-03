import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Your holdings, allocation and trading activity.",
};

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
