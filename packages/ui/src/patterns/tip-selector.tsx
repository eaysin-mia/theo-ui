"use client";

/**
 * @author: @dorianbaffier
 * @description: Tip Selector
 * @version: 2.0.0
 * @date: 2026-10-22
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import { Check, Heart } from "lucide-react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotionConfig,
  useTransform,
} from "motion/react";
import { type PointerEvent, useRef, useState } from "react";
import { Button } from "theo-ui/components/button";
import { cn } from "theo-ui/lib/utils";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
/** Width of one percent on the tape, in px. */
const TICK = 16;
const SETTLE = { type: "spring", stiffness: 420, damping: 42 } as const;

export interface TipSelectorProps {
  /** The order before the tip. */
  subtotal?: number;
  /** Who the tip goes to. */
  recipient?: { name: string; note?: string };
  /** Marked on the tape and offered as shortcuts, in percent. */
  percents?: number[];
  /** Where the tape starts. */
  defaultPercent?: number;
  /** The far end of the tape, in percent. */
  max?: number;
  currency?: string;
  onChange?: (tip: number) => void;
  onPay?: (total: number) => void;
  className?: string;
  /** Explicitly toggle reduced motion (defaults to Framer Motion's MotionConfigContext). */
  reduceMotion?: boolean;
}

const round2 = (n: number) => Math.round(n * 100) / 100;
const clamp = (n: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, n));

const fmt = (n: number, currency: string) =>
  `${currency}${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Past either end the tape gives, but less and less. */
const rubber = (value: number, max: number) => {
  if (value < 0) {
    return -Math.sqrt(-value) * 0.9;
  }
  return value > max ? max + Math.sqrt(value - max) * 0.9 : value;
};

/**
 * A money amount whose digits roll: up when it grows, down when it shrinks.
 * Columns are keyed from the right, so cents stay over cents.
 */
function Rolling({
  value,
  currency,
  reduceMotion,
  className,
}: {
  value: number;
  currency: string;
  reduceMotion: boolean;
  className?: string;
}) {
  const [last, setLast] = useState(value);
  const [direction, setDirection] = useState(1);
  if (last !== value) {
    setDirection(value > last ? 1 : -1);
    setLast(value);
  }
  const text = fmt(value, currency);
  const chars = [...text];
  return (
    <span className={cn("inline-flex tabular-nums", className)}>
      <span className="sr-only">{text}</span>
      {chars.map((char, i) => {
        const column = chars.length - i;
        return (
          <span
            aria-hidden="true"
            className="relative inline-block overflow-hidden"
            key={column}
          >
            <AnimatePresence
              custom={direction}
              initial={false}
              mode="popLayout"
            >
              <motion.span
                animate={{ y: "0%", opacity: 1 }}
                className="inline-block"
                exit={{ y: `${-70 * direction}%`, opacity: 0 }}
                initial={{ y: `${70 * direction}%`, opacity: 0 }}
                key={char}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { duration: 0.22, ease: EASE_OUT, delay: column * 0.01 }
                }
              >
                {char}
              </motion.span>
            </AnimatePresence>
          </span>
        );
      })}
    </span>
  );
}

function Ticks({ max, percents }: { max: number; percents: number[] }) {
  const ticks: number[] = [];
  for (let i = 0; i <= max; i++) {
    ticks.push(i);
  }
  return (
    <>
      {ticks.map((i) => {
        const major = i % 5 === 0;
        const marked = percents.includes(i);
        return (
          <span
            className={cn(
              "absolute bottom-7 w-px -translate-x-1/2 rounded-full bg-current",
              major || marked ? "h-6" : "h-3",
            )}
            key={i}
            style={{ left: i * TICK }}
          />
        );
      })}
    </>
  );
}

/**
 * A tip picker for checkout, set on a tape you drag. Flick it and it coasts
 * to a whole percent; the ticks you've passed fill in, the tip and total roll,
 * and Round up picks the tip that makes the total a whole amount.
 *
 * @remarks Requires optional peer dependency `motion` (`pnpm add motion`).
 */
export function TipSelector({
  subtotal = 42.6,
  recipient = { name: "Sam", note: "Your courier · 6 min early" },
  percents = [15, 18, 20],
  defaultPercent = 18,
  max = 30,
  currency = "$",
  onChange,
  onPay,
  className,
  reduceMotion: customReduceMotion,
}: TipSelectorProps) {
  const [percent, setPercent] = useState(defaultPercent);
  // Round up sets the tip itself, so the total lands on a whole amount.
  const [exactTip, setExactTip] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [paid, setPaid] = useState(false);
  const systemReduceMotion = useReducedMotionConfig() ?? false;
  const reduceMotion = customReduceMotion ?? systemReduceMotion;

  const position = useMotionValue(defaultPercent);
  const x = useTransform(position, (v) => -v * TICK);
  const filled = useTransform(
    position,
    (v) => `inset(0px ${(max - clamp(v, 0, max)) * TICK}px 0px -2px)`,
  );
  const drag = useRef({ x: 0, from: 0, v: 0, t: 0, lastX: 0 });

  const tip = exactTip ?? round2((subtotal * percent) / 100);
  const total = round2(subtotal + tip);
  const roundTip = round2(Math.floor(subtotal + tip) + 1 - subtotal);

  const commit = (next: number, exact: number | null = null) => {
    setPercent(next);
    setExactTip(exact);
    setPaid(false);
    onChange?.(exact ?? round2((subtotal * next) / 100));
  };

  const glide = (target: number, exact: number | null = null) => {
    commit(Math.round(target), exact);
    if (reduceMotion) {
      position.set(target);
      return;
    }
    animate(position, target, SETTLE);
  };

  const onDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }
    position.stop();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      x: event.clientX,
      from: position.get(),
      v: 0,
      t: event.timeStamp,
      lastX: event.clientX,
    };
    setDragging(true);
  };

  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragging) {
      return;
    }
    const d = drag.current;
    const dt = Math.max(1, event.timeStamp - d.t);
    d.v = d.v * 0.6 + ((event.clientX - d.lastX) / dt) * 0.4;
    d.t = event.timeStamp;
    d.lastX = event.clientX;
    const raw = d.from - (event.clientX - d.x) / TICK;
    position.set(rubber(raw, max));
    const next = clamp(Math.round(raw), 0, max);
    if (next !== percent || exactTip !== null) {
      commit(next);
    }
  };

  const onUp = () => {
    if (!dragging) {
      return;
    }
    setDragging(false);
    // Carry the flick a little way, then settle on a whole percent.
    const coast = (-drag.current.v * 160) / TICK;
    glide(clamp(Math.round(position.get() + coast), 0, max));
  };

  return (
    <div
      className={cn(
        "w-full max-w-sm rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-xs",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
          {recipient.name.slice(0, 1)}
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-medium text-foreground">
            Tip {recipient.name}
          </p>
          {recipient.note && (
            <p className="truncate text-xs text-muted-foreground">
              {recipient.note}
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-col items-center">
        <Rolling
          className="text-4xl font-semibold tracking-tight text-foreground"
          currency={currency}
          reduceMotion={reduceMotion}
          value={tip}
        />
        <p className="mt-1 h-4 text-xs text-muted-foreground tabular-nums">
          {tip === 0
            ? "No tip"
            : `${exactTip === null ? percent : ((tip / subtotal) * 100).toFixed(1)}% of ${fmt(subtotal, currency)}`}
        </p>
      </div>

      {/* The tape. A range input underneath keeps it on the keyboard. */}
      <div
        className={cn(
          "relative mt-4 h-20 touch-none overflow-hidden rounded-xl border border-border/50 bg-muted/20 text-muted-foreground/30 outline-none select-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1 focus-within:ring-offset-background",
          dragging ? "cursor-grabbing" : "cursor-grab",
        )}
        onPointerCancel={onUp}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 22%, black 78%, transparent)",
        }}
      >
        <input
          aria-label={`Tip for ${recipient.name}, in percent`}
          aria-valuetext={`${percent}%, ${fmt(tip, currency)}`}
          className="sr-only"
          max={max}
          min={0}
          onChange={(event) => glide(Number(event.target.value))}
          step={1}
          type="range"
          value={percent}
        />
        <motion.div
          aria-hidden="true"
          className="absolute inset-y-0 left-1/2"
          style={{ x, width: max * TICK }}
        >
          <Ticks max={max} percents={percents} />
          <motion.div
            className="absolute inset-0 text-primary"
            style={{ clipPath: filled }}
          >
            <Ticks max={max} percents={percents} />
          </motion.div>
          {[...new Set([0, ...percents, max])].map((p) => (
            <span
              className={cn(
                "absolute bottom-2 -translate-x-1/2 text-[10px] tabular-nums",
                p === percent
                  ? "font-medium text-foreground"
                  : "text-muted-foreground",
              )}
              key={p}
              style={{ left: p * TICK }}
            >
              {p}%
            </span>
          ))}
        </motion.div>
        {/* The needle. */}
        <span className="pointer-events-none absolute top-3 bottom-7 left-1/2 w-0.5 -translate-x-1/2 rounded-full bg-primary" />
      </div>

      <div className="mt-3 grid grid-cols-4 gap-1.5">
        {percents.map((p) => {
          const isSelected = exactTip === null && percent === p;
          return (
            <Button
              aria-pressed={isSelected}
              className={cn(
                "h-8 rounded-full text-xs tabular-nums",
                isSelected ? "" : "text-muted-foreground hover:text-foreground",
              )}
              key={p}
              onClick={() => glide(p)}
              size="sm"
              type="button"
              variant={isSelected ? "default" : "outline"}
            >
              {p}%
            </Button>
          );
        })}
        <Button
          aria-pressed={exactTip !== null}
          className={cn(
            "h-8 rounded-full text-xs",
            exactTip !== null
              ? ""
              : "text-muted-foreground hover:text-foreground",
          )}
          onClick={() => glide((roundTip / subtotal) * 100, roundTip)}
          size="sm"
          title={`Round the total up to ${fmt(subtotal + roundTip, currency)}`}
          type="button"
          variant={exactTip !== null ? "default" : "outline"}
        >
          Round up
        </Button>
      </div>

      <dl className="mt-5 space-y-1.5 border-t border-border pt-4 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <dt>Subtotal</dt>
          <dd className="tabular-nums">{fmt(subtotal, currency)}</dd>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <dt className="flex items-center gap-1.5">
            Tip
            <Heart
              aria-hidden="true"
              className="size-3 text-destructive"
              fill="currentColor"
            />
            <span className="text-xs">all to {recipient.name}</span>
          </dt>
          <dd className="tabular-nums">{fmt(tip, currency)}</dd>
        </div>
        <div className="flex items-baseline justify-between pt-1 text-foreground">
          <dt className="font-medium">Total</dt>
          <dd>
            <Rolling
              className="text-xl font-semibold tracking-tight"
              currency={currency}
              reduceMotion={reduceMotion}
              value={total}
            />
          </dd>
        </div>
      </dl>

      <Button
        className={cn(
          "mt-4 h-11 w-full rounded-xl text-sm font-medium transition-colors duration-200",
          paid &&
            "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-600 dark:border-emerald-600 dark:bg-emerald-600 dark:text-white",
        )}
        onClick={() => {
          if (paid) {
            return;
          }
          onPay?.(total);
          setPaid(true);
        }}
        size="lg"
        type="button"
        variant={paid ? "default" : "default"}
      >
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2"
            exit={{ opacity: 0, y: -8 }}
            initial={{ opacity: 0, y: 8 }}
            key={paid ? "paid" : "pay"}
            transition={{ duration: reduceMotion ? 0 : 0.18, ease: EASE_OUT }}
          >
            {paid ? (
              <>
                <Check
                  aria-hidden="true"
                  className="size-4"
                  strokeWidth={2.5}
                />
                Paid, thank you
              </>
            ) : (
              "Place order"
            )}
          </motion.span>
        </AnimatePresence>
      </Button>
    </div>
  );
}

export default TipSelector;
