"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Modal } from "@/components/ui/Modal";
import { CountUp } from "@/components/common/CountUp";
import { useToast } from "@/components/providers/ToastProvider";
import { buyStock, sellStock } from "@/lib/api/transactions";
import { getApiErrorMessage } from "@/lib/api/client";
import { formatINR, formatQuantity } from "@/lib/format";
import { dispatchTradeCompleted } from "@/lib/onboarding/events";
import type { AppliedTrade } from "@/hooks/usePortfolio";

export interface TradeTarget {
  stockId: number;
  ticker: string;
  companyName: string;
  averagePrice?: number;
  ownedQuantity: number;
}

interface TradeModalProps {
  mode: "buy" | "sell";
  target: TradeTarget | null;
  open: boolean;
  onClose: () => void;
  onSuccess: (trade: AppliedTrade) => void;
}

function TradeForm({
  mode,
  target,
  onClose,
  onSuccess,
}: {
  mode: "buy" | "sell";
  target: TradeTarget;
  onClose: () => void;
  onSuccess: (trade: AppliedTrade) => void;
}) {
  const { push } = useToast();
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState(
    target.averagePrice !== undefined ? String(target.averagePrice) : "",
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const qty = Number(quantity);
  const prc = Number(price);
  const quantityInvalid =
    quantity !== "" && (!Number.isFinite(qty) || qty <= 0);
  const priceInvalid = price !== "" && (!Number.isFinite(prc) || prc <= 0);
  const exceedsOwned =
    mode === "sell" && Number.isFinite(qty) && qty > target.ownedQuantity;

  const total =
    Number.isFinite(qty) && qty > 0 && Number.isFinite(prc) && prc > 0
      ? qty * prc
      : null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!Number.isFinite(qty) || qty <= 0) {
      setFormError("Enter a quantity greater than 0.");
      return;
    }
    if (!Number.isFinite(prc) || prc <= 0) {
      setFormError("Enter a price greater than 0.");
      return;
    }
    if (mode === "sell" && qty > target.ownedQuantity) {
      setFormError(
        `You only own ${formatQuantity(target.ownedQuantity)} shares of ${target.ticker}.`,
      );
      return;
    }

    setSubmitting(true);
    setFormError(null);
    const payload = { stock_id: target.stockId, quantity: qty, price: prc };

    try {
      if (mode === "buy") {
        await buyStock(payload);
      } else {
        await sellStock(payload);
      }
      push(
        `${mode === "buy" ? "Bought" : "Sold"} ${formatQuantity(qty)} ${target.ticker}`,
        "success",
      );
      dispatchTradeCompleted();
      onSuccess({ type: mode === "buy" ? "BUY" : "SELL", ...payload });
      onClose();
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="trade-quantity">Quantity</Label>
        <Input
          id="trade-quantity"
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          required
          data-autofocus
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          placeholder={
            mode === "sell"
              ? `Up to ${formatQuantity(target.ownedQuantity)}`
              : "Number of shares"
          }
          error={quantityInvalid || exceedsOwned}
        />
        {exceedsOwned ? (
          <p className="text-xs text-loss">
            You only own {formatQuantity(target.ownedQuantity)} shares.
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="trade-price">Price per share (₹)</Label>
        <Input
          id="trade-price"
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          required
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          placeholder="Price per share"
          error={priceInvalid}
        />
      </div>

      <div
        className={`flex items-center justify-between rounded-xl border px-3.5 py-3 transition-colors duration-200 ${
          mode === "buy"
            ? "border-brand/30 bg-brand-soft"
            : "border-loss/30 bg-loss-soft"
        }`}
      >
        <span className="text-xs uppercase tracking-widest text-fg-subtle">
          {mode === "buy" ? "Total cost" : "Total proceeds"}
        </span>
        <span
          className={`tnum font-display text-xl font-semibold ${
            mode === "buy" ? "text-brand" : "text-loss"
          }`}
        >
          {total !== null ? <CountUp value={total} format={formatINR} /> : "—"}
        </span>
      </div>

      {formError ? (
        <p className="rounded-lg border border-loss/30 bg-loss-soft px-3 py-2 text-xs text-loss">
          {formError}
        </p>
      ) : null}

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          className="flex-1"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant={mode === "sell" ? "destructive" : "primary"}
          className="flex-1"
          loading={submitting}
        >
          {mode === "buy" ? "Confirm Buy" : "Confirm Sell"}
        </Button>
      </div>
    </form>
  );
}

export function TradeModal({
  mode,
  target,
  open,
  onClose,
  onSuccess,
}: TradeModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      ariaLabel={
        target
          ? `${mode === "buy" ? "Buy" : "Sell"} ${target.companyName}`
          : "Trade"
      }
      title={
        target ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Badge variant={mode === "buy" ? "profit" : "loss"}>
                {mode === "buy" ? "BUY" : "SELL"}
              </Badge>
              <Badge variant="brand" className="tnum">
                {target.ticker}
              </Badge>
            </div>
            <p className="truncate text-xs text-fg-subtle">
              {target.companyName}
            </p>
          </div>
        ) : null
      }
    >
      {target ? (
        <TradeForm
          key={`${mode}-${target.stockId}-${open}`}
          mode={mode}
          target={target}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      ) : null}
    </Modal>
  );
}
