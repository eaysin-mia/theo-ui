"use client";

/**
 * @author: @dorianbaffier
 * @description: Cart Button
 * @version: 1.0.0
 * @date: 2026-10-22
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import { Minus, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion, useReducedMotionConfig } from "motion/react";
import {
  type MouseEvent,
  type PointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@theo/ui/lib/utils";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
/** Pill widths: "Add +" at rest, "− n +" once something is in the cart. */
const WIDTH_CLOSED = 80;
const WIDTH_OPEN = 108;
/** Press and hold + or −: wait, then repeat faster and faster. */
const HOLD_DELAY = 380;
const REPEAT_FIRST = 150;
const REPEAT_FASTEST = 55;
/** How long "Limit n per order" stays up. */
const LIMIT_FOR = 1600;

export interface CartButtonProps {
  /** Controlled quantity. Leave out to let the button keep its own. */
  quantity?: number;
  defaultQuantity?: number;
  /** Most of this item one order can hold. */
  max?: number;
  /** Item name, used in the button labels for screen readers. */
  name?: string;
  label?: string;
  onQuantityChange?: (quantity: number) => void;
  className?: string;
  /** Explicitly toggle reduced motion (defaults to Framer Motion's MotionConfigContext). */
  reduceMotion?: boolean;
}

/**
 * "Add +" that opens into a "− n +" stepper in place. The + never moves, so a
 * second tap lands where the first did. At one, − turns into a bin; holding
 * + or − repeats, and a hold on − stops at one rather than emptying the line.
 */
export function CartButton({
  quantity,
  defaultQuantity = 0,
  max = 9,
  name = "item",
  label = "Add",
  onQuantityChange,
  className,
  reduceMotion: customReduceMotion,
}: CartButtonProps) {
  const [ownQuantity, setOwnQuantity] = useState(defaultQuantity);
  const value = quantity ?? ownQuantity;
  const [direction, setDirection] = useState(1);
  const [showLimit, setShowLimit] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const systemReduceMotion = useReducedMotionConfig() ?? false;
  const reduceMotion = customReduceMotion ?? systemReduceMotion;

  const valueRef = useRef(value);
  valueRef.current = value;
  const holdRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  // A touch press waiting to turn out a tap, a hold, or the start of a scroll.
  const touchRef = useRef<number | null>(null);
  const limitRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const addRef = useRef<HTMLButtonElement>(null);
  const plusRef = useRef<HTMLButtonElement>(null);
  const focusNext = useRef<"add" | "plus" | null>(null);

  const open = value > 0;

  const commit = useCallback(
    (next: number) => {
      const clamped = Math.min(max, Math.max(0, next));
      if (clamped === valueRef.current) {
        return;
      }
      setDirection(clamped > valueRef.current ? 1 : -1);
      valueRef.current = clamped;
      if (quantity === undefined) {
        setOwnQuantity(clamped);
      }
      onQuantityChange?.(clamped);
    },
    [max, quantity, onQuantityChange],
  );

  const hitLimit = useCallback(() => {
    setIsShaking(true);
    setShowLimit(true);
    clearTimeout(limitRef.current);
    limitRef.current = setTimeout(() => {
      setShowLimit(false);
      setIsShaking(false);
    }, LIMIT_FOR);
  }, []);

  /** One step; returns false when the step can't happen. */
  const step = useCallback(
    (delta: number) => {
      if (delta > 0 && valueRef.current >= max) {
        hitLimit();
        return false;
      }
      if (delta < 0 && valueRef.current === 1) {
        // The last one out: hand focus back to "Add" if it was on −.
        focusNext.current = "add";
      }
      commit(valueRef.current + delta);
      return true;
    },
    [commit, hitLimit, max],
  );

  const stopHold = useCallback(() => {
    clearTimeout(holdRef.current);
    touchRef.current = null;
  }, []);

  // A touch that was neither cancelled by a scroll nor held long enough to
  // repeat counts as one tap when the finger lifts.
  const endPress = () => {
    const delta = touchRef.current;
    stopHold();
    if (delta !== null) {
      step(delta);
    }
  };

  const startHold = (delta: number) => (event: PointerEvent) => {
    if (event.button !== 0) {
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    stopHold();
    let interval = REPEAT_FIRST;
    const tick = () => {
      // A hold on − stops at one: emptying the line takes its own tap.
      if (delta < 0 && valueRef.current <= 1) {
        return;
      }
      if (!step(delta)) {
        return;
      }
      interval = Math.max(REPEAT_FASTEST, interval * 0.82);
      holdRef.current = setTimeout(tick, interval);
    };
    // In a list, a finger landing on + may be starting a scroll, so touch
    // waits for the lift (or the hold) instead of stepping on contact.
    if (event.pointerType === "touch") {
      touchRef.current = delta;
      holdRef.current = setTimeout(() => {
        touchRef.current = null;
        if (step(delta)) {
          holdRef.current = setTimeout(tick, REPEAT_FIRST);
        }
      }, HOLD_DELAY);
      return;
    }
    if (!step(delta)) {
      return;
    }
    holdRef.current = setTimeout(tick, HOLD_DELAY);
  };

  // Mouse presses step on pointerdown, touch on release; Enter and Space
  // arrive as a click.
  const keyStep = (delta: number) => (event: MouseEvent) => {
    if (event.detail === 0) {
      step(delta);
    }
  };

  const add = () => {
    focusNext.current = "plus";
    setDirection(1);
    commit(1);
  };

  useEffect(() => {
    if (focusNext.current === "plus" && value > 0) {
      plusRef.current?.focus();
    }
    if (focusNext.current === "add" && value === 0) {
      // After the press settles, or the browser drops focus on the removed −.
      requestAnimationFrame(() => addRef.current?.focus());
    }
    focusNext.current = null;
    if (value === 0) {
      clearTimeout(holdRef.current);
    }
  }, [value]);

  useEffect(
    () => () => {
      clearTimeout(holdRef.current);
      clearTimeout(limitRef.current);
    },
    [],
  );

  const atMax = value >= max;
  const fade = reduceMotion
    ? { duration: 0 }
    : { duration: 0.2, ease: EASE_OUT };

  return (
    <div
      className={cn("relative inline-flex", className)}
      data-slot="cart-button"
    >
      <AnimatePresence>
        {showLimit && (
          <motion.span
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="pointer-events-none absolute right-0 bottom-full z-30 mb-2 rounded-md border border-border bg-popover px-2.5 py-1 text-xs font-medium whitespace-nowrap text-popover-foreground shadow-md not-dark:bg-clip-padding before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-md)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] dark:before:shadow-[0_-1px_--theme(--color-white/6%)]"
            data-slot="cart-button-tooltip"
            exit={{ opacity: 0, y: 2, scale: 0.95 }}
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            role="status"
            transition={fade}
          >
            Limit {max} per order
          </motion.span>
        )}
      </AnimatePresence>

      <motion.div
        animate={{ width: open ? WIDTH_OPEN : WIDTH_CLOSED }}
        className={cn(
          "relative h-9 overflow-hidden rounded-lg border text-base font-medium transition-colors duration-200 outline-none motion-reduce:transition-none sm:h-8 sm:text-sm",
          open
            ? "border-primary bg-primary text-primary-foreground shadow-xs shadow-primary/24"
            : "border-input bg-card text-card-foreground shadow-xs ring-border hover:bg-accent/50",
        )}
        data-slot="cart-button-stepper"
        initial={false}
        transition={{ ...fade, duration: reduceMotion ? 0 : 0.32 }}
      >
        <AnimatePresence initial={false}>
          {!open && (
            <motion.span
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-3 z-10 flex items-center text-sm font-medium"
              exit={{ opacity: 0, x: -6, filter: "blur(2px)" }}
              initial={{ opacity: 0, x: -6, filter: "blur(2px)" }}
              key="label"
              transition={fade}
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>

        {open ? (
          <fieldset className="contents">
            <legend className="sr-only">{`Quantity of ${name}`}</legend>
            <motion.button
              animate={{ opacity: 1 }}
              aria-label={value === 1 ? `Remove ${name}` : `One less ${name}`}
              className="absolute inset-y-0 left-0 flex w-8.5 items-center justify-center rounded-[calc(var(--radius-lg)-2px)] transition-colors duration-150 outline-none hover:bg-primary-foreground/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background active:bg-primary-foreground/20 sm:w-8 pointer-coarse:after:absolute pointer-coarse:after:size-full pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11"
              data-slot="cart-button-decrement"
              initial={{ opacity: 0 }}
              onClick={keyStep(-1)}
              onLostPointerCapture={stopHold}
              onPointerCancel={stopHold}
              onPointerDown={startHold(-1)}
              onPointerUp={endPress}
              transition={fade}
              type="button"
            >
              <MinusGlyph bin={value === 1} reduceMotion={reduceMotion} />
            </motion.button>

            <motion.output
              animate={{ opacity: 1 }}
              aria-live="polite"
              className="absolute inset-y-0 right-8.5 left-8.5 flex items-center justify-center overflow-hidden text-sm font-semibold tabular-nums sm:right-8 sm:left-8"
              data-slot="cart-button-output"
              initial={{ opacity: 0 }}
              transition={fade}
            >
              <span className="sr-only">{`${value} ${name} in cart`}</span>
              <motion.span
                animate={
                  isShaking && !reduceMotion
                    ? { x: [-4, 4, -4, 4, -2, 2, 0] }
                    : { x: 0 }
                }
                aria-hidden="true"
                className="flex items-center justify-center"
                transition={{ duration: 0.28, ease: "easeInOut" }}
              >
                <RollingText
                  direction={direction}
                  reduceMotion={reduceMotion}
                  text={String(value)}
                />
              </motion.span>
            </motion.output>

            <button
              aria-disabled={atMax}
              aria-label={`One more ${name}`}
              className={cn(
                "absolute inset-y-0 right-0 flex w-8.5 items-center justify-center rounded-[calc(var(--radius-lg)-2px)] transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background sm:w-8 pointer-coarse:after:absolute pointer-coarse:after:size-full pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11",
                atMax
                  ? "cursor-not-allowed opacity-35"
                  : "hover:bg-primary-foreground/10 active:bg-primary-foreground/20",
              )}
              data-slot="cart-button-increment"
              onClick={keyStep(1)}
              onLostPointerCapture={stopHold}
              onPointerCancel={stopHold}
              onPointerDown={startHold(1)}
              onPointerUp={endPress}
              ref={plusRef}
              type="button"
            >
              <Plus aria-hidden="true" className="size-4" />
            </button>
          </fieldset>
        ) : (
          <button
            aria-label={`${label} ${name} to cart`}
            className="absolute inset-0 flex items-center justify-end rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background pointer-coarse:after:absolute pointer-coarse:after:size-full pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11"
            data-slot="cart-button-trigger"
            onClick={add}
            ref={addRef}
            type="button"
          >
            <span className="flex w-8.5 items-center justify-center sm:w-8">
              <Plus aria-hidden="true" className="size-4" />
            </span>
          </button>
        )}
      </motion.div>
    </div>
  );
}

/** − at two or more; a bin at one, since the next tap empties the line. */
function MinusGlyph({
  bin,
  reduceMotion,
}: {
  bin: boolean;
  reduceMotion: boolean;
}) {
  return (
    <AnimatePresence initial={false} mode="popLayout">
      <motion.span
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        className="flex"
        exit={{ opacity: 0, scale: 0.6, filter: "blur(2px)" }}
        initial={{ opacity: 0, scale: 0.6, filter: "blur(2px)" }}
        key={bin ? "bin" : "minus"}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.16 }}
      >
        {bin ? (
          <Trash2 aria-hidden className="size-3.5" />
        ) : (
          <Minus aria-hidden className="size-4" />
        )}
      </motion.span>
    </AnimatePresence>
  );
}

/** Each character rolls on its own, keyed by its place from the right. */
function RollingText({
  text,
  direction,
  reduceMotion,
}: {
  text: string;
  direction: number;
  reduceMotion: boolean;
}) {
  const places = text.split("").map((char, index) => ({
    char,
    place: text.length - index,
  }));
  return (
    <span className="inline-flex items-center justify-center overflow-hidden tabular-nums">
      {places.map(({ char, place }) => (
        <span
          className="relative inline-flex h-5 w-[1ch] items-center justify-center overflow-hidden text-center"
          key={place}
        >
          <AnimatePresence custom={direction} initial={false} mode="popLayout">
            <motion.span
              animate={{ y: 0, opacity: 1 }}
              className="inline-block text-center"
              custom={direction}
              exit={reduceMotion ? { opacity: 0 } : "out"}
              initial={reduceMotion ? { opacity: 0 } : "in"}
              key={char}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: 0.24, ease: EASE_OUT }
              }
              variants={{
                in: (dir: number) => ({ y: dir * 14, opacity: 0 }),
                out: (dir: number) => ({ y: dir * -14, opacity: 0 }),
              }}
            >
              {char}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  );
}
