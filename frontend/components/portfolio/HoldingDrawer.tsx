"use client";

import { Badge } from "@/components/ui/Badge";
import { Drawer } from "@/components/ui/Drawer";
import { SparkleIcon } from "@/components/common/icons";
import { formatDate, formatINR, formatQuantity } from "@/lib/format";
import type { PortfolioRead, StockRead } from "@/lib/api/types";

interface HoldingDrawerProps {
  holding: PortfolioRead | null;
  stock?: StockRead;
  open: boolean;
  onClose: () => void;
  onAnalyze: () => void;
}

function Row({
  label,
  children,
  emphasis = false,
}: {
  label: string;
  children: React.ReactNode;
  emphasis?: boolean;
}) {
  return (
    <div className="-mx-2 flex items-start justify-between gap-4 rounded-lg px-2 py-2.5 transition-colors duration-200 hover:bg-white/[0.03]">
      <dt className="shrink-0 text-sm text-fg-subtle">{label}</dt>
      <dd
        className={`tnum text-right ${
          emphasis
            ? "text-base font-semibold text-brand"
            : "text-sm font-medium text-fg"
        }`}
      >
        {children}
      </dd>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-fg-subtle">
      <span aria-hidden className="h-3 w-0.5 rounded-full bg-brand/70" />
      {children}
    </h3>
  );
}

export function HoldingDrawer({
  holding,
  stock,
  open,
  onClose,
  onAnalyze,
}: HoldingDrawerProps) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      ariaLabel={
        stock
          ? `Holding details: ${stock.company_name}`
          : "Holding details"
      }
      title={
        stock ? (
          <div className="flex flex-col gap-2">
            <h2 className="line-clamp-2 font-display text-lg font-semibold tracking-tight text-fg">
              {stock.company_name}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="brand" className="tnum">
                {stock.ticker}
              </Badge>
              <Badge variant="neutral" className="tnum">
                {stock.exchange}
              </Badge>
            </div>
          </div>
        ) : null
      }
      footer={
        stock ? (
          <button
            type="button"
            onClick={onAnalyze}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-ai-strong to-ai text-sm font-medium text-ai-ink shadow-[0_0_0_1px_rgb(214_40_40/0.3),0_0_20px_rgb(214_40_40/0.25)] transition-all hover:brightness-110 hover:shadow-[0_0_0_1px_rgb(214_40_40/0.4),0_0_30px_rgb(214_40_40/0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ai/50 active:scale-[0.98]"
          >
            <SparkleIcon className="h-4 w-4" />
            Analyze with AI
          </button>
        ) : null
      }
    >
      {holding ? (
        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-2">
            <SectionTitle>Your Position</SectionTitle>
            <dl className="divide-y divide-line/60">
              <Row label="Quantity">{formatQuantity(holding.quantity)}</Row>
              <Row label="Average Price">{formatINR(holding.average_price)}</Row>
              <Row label="Invested Amount" emphasis>
                {formatINR(holding.quantity * holding.average_price)}
              </Row>
              <Row label="First Added">{formatDate(holding.created_at)}</Row>
              <Row label="Last Updated">{formatDate(holding.updated_at)}</Row>
            </dl>
          </section>

          {stock ? (
            <section className="flex flex-col gap-2">
              <SectionTitle>Company Information</SectionTitle>
              <dl className="divide-y divide-line/60">
                <Row label="Ticker">{stock.ticker}</Row>
                <Row label="Exchange">{stock.exchange}</Row>
                <Row label="Sector">{stock.sector}</Row>
                <Row label="Industry">{stock.industry}</Row>
                <Row label="Status">
                  <Badge variant={stock.is_active ? "profit" : "neutral"} dot={stock.is_active}>
                    {stock.is_active ? "Active" : "Inactive"}
                  </Badge>
                </Row>
              </dl>
            </section>
          ) : null}
        </div>
      ) : null}
    </Drawer>
  );
}
