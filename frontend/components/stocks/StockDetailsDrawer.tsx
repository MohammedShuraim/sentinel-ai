"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { SparkleIcon } from "@/components/common/icons";
import { getStockNews } from "@/lib/api/news";
import { openStockAnalysis } from "@/lib/chat/chatNavigation";
import { formatDate } from "@/lib/format";
import type { NewsRead, StockRead } from "@/lib/api/types";

type NewsStatus = "loading" | "error" | "success";

interface StockDetailsDrawerProps {
  stock: StockRead | null;
  open: boolean;
  onClose: () => void;
  onBuy?: (stock: StockRead) => void;
}

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="-mx-2 flex items-start justify-between gap-4 rounded-lg px-2 py-2.5 transition-colors duration-200 hover:bg-white/[0.03]">
      <dt className="shrink-0 text-sm text-fg-subtle">{label}</dt>
      <dd className="tnum text-right text-sm font-medium text-fg">{children}</dd>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-fg-subtle">
      <span aria-hidden className="h-3 w-0.5 rounded-full bg-brand/60" />
      {children}
    </h3>
  );
}

function NewsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex flex-col gap-2">
          <div className="skeleton h-4 w-11/12" />
          <div className="skeleton h-3 w-full" />
          <div className="skeleton h-3 w-24" />
        </div>
      ))}
    </div>
  );
}

export function StockDetailsDrawer({
  stock,
  open,
  onClose,
  onBuy,
}: StockDetailsDrawerProps) {
  const router = useRouter();
  const [news, setNews] = useState<NewsRead[]>([]);
  const [newsStatus, setNewsStatus] = useState<NewsStatus>("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!open || !stock) {
      return;
    }
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setNews([]);
        setNewsStatus("loading");
      }
    });

    getStockNews(stock.ticker)
      .then((items) => {
        if (cancelled) {
          return;
        }
        const recent = [...items]
          .sort(
            (a, b) =>
              new Date(b.published_at).getTime() -
              new Date(a.published_at).getTime(),
          )
          .slice(0, 5);
        setNews(recent);
        setNewsStatus("success");
      })
      .catch(() => {
        if (!cancelled) {
          setNewsStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, stock, attempt]);

  const retryNews = useCallback(() => {
    setNewsStatus("loading");
    setAttempt((current) => current + 1);
  }, []);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      ariaLabel={
        stock ? `Stock details: ${stock.company_name}` : "Stock details"
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
        <div className="flex w-full flex-col gap-2 sm:flex-row">
          {onBuy ? (
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => {
                if (!stock) {
                  return;
                }
                onBuy(stock);
              }}
            >
              Buy
            </Button>
          ) : null}
          <button
            type="button"
            onClick={() => {
              if (!stock) {
                return;
              }
              onClose();
              router.push(openStockAnalysis(stock));
            }}
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-ai-strong to-ai text-sm font-medium text-ai-ink shadow-[0_0_0_1px_rgb(214_40_40/0.3),0_0_20px_rgb(214_40_40/0.25)] transition-all hover:brightness-110 hover:shadow-[0_0_0_1px_rgb(214_40_40/0.4),0_0_28px_rgb(214_40_40/0.35)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ai/50"
          >
            <SparkleIcon className="h-4 w-4" />
            AI Analysis
          </button>
        </div>
      }
    >
      {stock ? (
        <div className="flex flex-col gap-6">
          {/* AI accent hairline */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgb(214_40_40/0.45),rgb(214_40_40/0.45),transparent)] bg-[size:200%_100%] animate-shimmer"
          />
          <section className="flex flex-col gap-2">
            <SectionTitle>Company Information</SectionTitle>
            <dl className="divide-y divide-line/60">
              <InfoRow label="Ticker">{stock.ticker}</InfoRow>
              <InfoRow label="Company Name">{stock.company_name}</InfoRow>
              <InfoRow label="Exchange">{stock.exchange}</InfoRow>
              <InfoRow label="Sector">{stock.sector}</InfoRow>
              <InfoRow label="Industry">{stock.industry}</InfoRow>
              <InfoRow label="Status">
                <Badge
                  variant={stock.is_active ? "profit" : "neutral"}
                  dot={stock.is_active}
                >
                  {stock.is_active ? "Active" : "Inactive"}
                </Badge>
              </InfoRow>
            </dl>
          </section>

          <section className="flex flex-col gap-3">
            <SectionTitle>Recent News</SectionTitle>
            {newsStatus === "loading" ? (
              <NewsSkeleton />
            ) : newsStatus === "error" ? (
              <div className="flex flex-col items-start gap-2 rounded-xl border border-line bg-elevated p-4">
                <p className="text-sm text-fg">
                  Unable to load stock details.
                </p>
                <Button variant="secondary" size="sm" onClick={retryNews}>
                  Retry
                </Button>
              </div>
            ) : news.length === 0 ? (
              <p className="text-sm text-fg-muted">
                No recent news available.
              </p>
            ) : (
              <ul className="flex flex-col gap-1">
                {news.map((article) => (
                  <li key={article.id}>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group -mx-2 flex flex-col gap-1.5 rounded-xl px-2 py-2.5 transition-colors duration-200 hover:bg-white/[0.03]"
                    >
                      <p className="line-clamp-2 text-sm font-medium leading-snug text-fg transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:text-brand">
                        {article.title}
                      </p>
                      <p className="line-clamp-2 text-xs leading-relaxed text-fg-muted">
                        {article.content}
                      </p>
                      <span className="flex items-center gap-2 text-xs text-fg-subtle">
                        <Badge variant="neutral">{article.source}</Badge>
                        <span className="tnum">
                          {formatDate(article.published_at)}
                        </span>
                        <svg
                          aria-hidden
                          viewBox="0 0 24 24"
                          className="h-3 w-3 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M7 17 17 7" />
                          <path d="M9 7h8v8" />
                        </svg>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : null}
    </Drawer>
  );
}
