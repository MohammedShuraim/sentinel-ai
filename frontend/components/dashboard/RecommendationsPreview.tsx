"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ConfidenceBar } from "@/components/common/ConfidenceBar";
import { SparkIcon } from "@/components/common/icons";
import { fadeUp, staggerContainer } from "@/lib/motion/presets";
import {
  confidenceForScore,
  labelForScore,
  labelVariant,
} from "@/lib/recommendations/scoring";
import { featuredAsRecommendationItems } from "@/lib/market/starterContent";
import type { RecommendationItem } from "@/lib/api/types";

interface RecommendationsPreviewProps {
  recommendations: RecommendationItem[];
  loading: boolean;
  error: boolean;
}

export function RecommendationsPreview({
  recommendations,
  loading,
  error,
}: RecommendationsPreviewProps) {
  const personalised = recommendations.slice(0, 3);
  const usingFeatured = personalised.length === 0;
  const items = usingFeatured
    ? featuredAsRecommendationItems().slice(0, 3)
    : personalised;
  const reduceMotion = useReducedMotion();

  return (
    <Card className="flex h-full flex-col p-0">
      {loading ? (
        <ul className="flex flex-col divide-y divide-line">
          {Array.from({ length: 3 }).map((_, index) => (
            <li key={index} className="flex items-center gap-3 px-5 py-4">
              <div className="flex flex-1 flex-col gap-1.5">
                <div className="skeleton h-4 w-32" />
                <div className="skeleton h-3 w-48" />
              </div>
              <div className="skeleton h-6 w-14 rounded-full" />
            </li>
          ))}
        </ul>
      ) : error ? (
        <p className="px-5 py-8 text-center text-sm text-fg-muted">
          Recommendations are temporarily unavailable. The analyst service may
          be rate-limited — try again shortly.
        </p>
      ) : (
        <>
          {usingFeatured ? (
            <div className="border-b border-line px-5 py-3">
              <Badge variant="brand" className="mb-1">
                Featured AI picks
              </Badge>
              <p className="text-xs text-fg-muted">
                Personalised ranking appears after your investor profile is
                ready.
              </p>
            </div>
          ) : null}
          <motion.ul
            className="flex flex-col divide-y divide-line"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            {items.map((item, index) => {
              const confidence =
                item.confidence ?? confidenceForScore(item.score);
              const label = labelForScore(item.score);
              return (
                <motion.li
                  key={`${item.ticker}-${item.stock_id}`}
                  variants={reduceMotion ? undefined : fadeUp}
                  className="flex items-center gap-3 px-5 py-4 transition-colors duration-200 hover:bg-white/[0.03]"
                >
                  <span
                    aria-hidden
                    className="tnum grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-elevated text-xs font-semibold text-fg-muted"
                  >
                    {index + 1}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <div className="flex items-baseline gap-2">
                      <p className="tnum truncate text-sm font-medium text-fg">
                        {item.ticker}
                      </p>
                      <p className="truncate text-xs text-fg-subtle">
                        {item.company_name}
                      </p>
                    </div>
                    <ConfidenceBar value={confidence} className="h-1 max-w-40" />
                  </div>
                  <Badge
                    variant={labelVariant(label)}
                    className="tnum shrink-0 gap-1"
                  >
                    <SparkIcon className="h-3 w-3" />
                    {label}
                  </Badge>
                </motion.li>
              );
            })}
          </motion.ul>
        </>
      )}

      {!loading && !error ? (
        <div className="mt-auto border-t border-line px-5 py-3">
          <Link
            href="/recommendations"
            className="text-xs font-medium text-brand underline-offset-4 hover:underline"
          >
            {usingFeatured
              ? "Explore featured & sector desks"
              : `See all ${recommendations.length} recommendations with analysis`}
          </Link>
        </div>
      ) : null}
    </Card>
  );
}
