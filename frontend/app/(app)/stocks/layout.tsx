import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stocks",
  description: "Browse the tracked NSE universe and find your next idea.",
};

export default function StocksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
