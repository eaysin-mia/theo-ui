"use client";

import { Archive, Check, type LucideIcon, Undo2 } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  type PointerEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Kbd } from "@workspace/ui/components/kbd";
import { cn } from "@workspace/ui/lib/utils";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const STROKE = 1.5;
const APPLE_PLATFORM = /Mac|iPhone|iPad|iPod/i;

type Phase = "idle" | "pending" | "done";

export interface UndoButtonProps {
  /** What the button does, e.g. "Archive". */
  label?: string;
  /** The same action in the past tense, e.g. "Archived". */
  doneLabel?: string;
  icon?: LucideIcon;
  /** Icon shown when action is completed, e.g. Check. Defaults to Check. */
  doneIcon?: LucideIcon;
  /** How long the action can be undone, in ms. */
  duration?: number;
  /**
   * After the action commits, go back to the start after this many ms.
   * Pass `null` to stay on the done state.
   */
  resetAfter?: number | null;
  /** Called when the button is pressed and the undo window opens. */
  onAction?: () => void;
  /** Called when the window closes without an undo: do the real work here. */
  onCommit?: () => void;
  onUndo?: () => void;
  className?: string;
  disabled?: boolean;
}

// Traces the perimeter of a rounded rectangle starting at the top centre
// and running clockwise, smoothly matching any corner radius (e.g. rounded-lg or pill).
function roundedRectPath(width: number, height: number, radius = 8) {
  const s = STROKE / 2;
  const maxR = Math.min((width - s * 2) / 2, (height - s * 2) / 2);
  const r = Math.min(Math.max(0, radius - s), maxR);
  const left = s + r;
  const right = width - s - r;
  const bottom = height - s - r;
  const top = s + r;

  return [
    `M ${width / 2} ${s}`,
    `H ${right}`,
    `A ${r} ${r} 0 0 1 ${width - s} ${top}`,
    `V ${bottom}`,
    `A ${r} ${r} 0 0 1 ${right} ${height - s}`,
    `H ${left}`,
    `A ${r} ${r} 0 0 1 ${s} ${bottom}`,
    `V ${top}`,
    `A ${r} ${r} 0 0 1 ${left} ${s}`,
    "Z",
  ].join(" ");
}

const isEditable = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

function DrawnCheck({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={cn(
        "-mx-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400",
        className,
      )}
      fill="none"
      viewBox="0 0 16 16"
    >
      <motion.path
        animate={{ pathLength: 1 }}
        d="M3.5 8.5 6.5 11.5 12.5 4.5"
        initial={{ pathLength: 0 }}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        transition={{ duration: 0.3, delay: 0.05, ease: EASE_OUT }}
      />
    </svg>
  );
}

export function UndoButton({
  label = "Archive",
  doneLabel = "Archived",
  icon: Icon = Archive,
  doneIcon: DoneIcon,
  duration = 5000,
  resetAfter = 2400,
  onAction,
  onCommit,
  onUndo,
  className,
  disabled,
}: UndoButtonProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [seconds, setSeconds] = useState(Math.ceil(duration / 1000));
  const [width, setWidth] = useState<number>();
  const [isMac, setIsMac] = useState(true);
  const reduceMotion = Boolean(useReducedMotion());

  const buttonRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLSpanElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const hoveredRef = useRef(false);
  const elapsedRef = useRef(0);
  const remainingRef = useRef(1);

  const callbacks = useRef({ onAction, onCommit, onUndo });
  callbacks.current = { onAction, onCommit, onUndo };

  useEffect(() => {
    setIsMac(APPLE_PLATFORM.test(navigator.platform || navigator.userAgent));
  }, []);

  // Measures active content width. Because the resting state uses a CSS grid
  // containing both "idle" and "done" layers, the resting width is naturally
  // equal to max(idle, done), guaranteeing zero layout shift when resetting.
  useIsomorphicLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) {
      return;
    }
    // +2 for the 1px border on each side.
    const observer = new ResizeObserver(() =>
      setWidth(content.offsetWidth + 2),
    );
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  // Dashes in real lengths rather than pathLength, which Chrome scales
  // inconsistently once the path changes size.
  const paint = useCallback(() => {
    const path = pathRef.current;
    if (!path) {
      return;
    }
    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length * remainingRef.current} ${length}`;
  }, []);

  // Keep the outline glued to the button while its width animates,
  // dynamically measuring the button's border radius (rounded-lg or rounded-full).
  useIsomorphicLayoutEffect(() => {
    const button = buttonRef.current;
    if (!button) {
      return;
    }
    const updatePath = () => {
      const radius =
        parseFloat(window.getComputedStyle(button).borderTopLeftRadius) || 8;
      pathRef.current?.setAttribute(
        "d",
        roundedRectPath(button.offsetWidth, button.offsetHeight, radius),
      );
      paint();
    };

    const observer = new ResizeObserver(updatePath);
    observer.observe(button);
    updatePath();
    return () => observer.disconnect();
  }, [paint]);

  const undo = useCallback(() => {
    setPhase("idle");
    callbacks.current.onUndo?.();
  }, []);

  useEffect(() => {
    if (phase !== "pending") {
      return;
    }
    elapsedRef.current = 0;
    remainingRef.current = 1;
    paint();
    setSeconds(Math.ceil(duration / 1000));

    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      // Hovering the button, or leaving the tab, holds the clock: nobody
      // should lose their chance to undo while reading it.
      if (!(hoveredRef.current || document.hidden)) {
        elapsedRef.current += now - last;
      }
      last = now;
      const left = Math.max(0, duration - elapsedRef.current);
      remainingRef.current = left / duration;
      paint();
      setSeconds(Math.ceil(left / 1000));
      if (left === 0) {
        setPhase("done");
        callbacks.current.onCommit?.();
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    const onKeyDown = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey;
      if (
        mod &&
        !event.shiftKey &&
        event.key.toLowerCase() === "z" &&
        !isEditable(event.target)
      ) {
        event.preventDefault();
        undo();
      } else if (event.key === "Escape") {
        setPhase("done");
        callbacks.current.onCommit?.();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [phase, duration, paint, undo]);

  useEffect(() => {
    if (phase !== "done" || resetAfter === null) {
      return;
    }
    const timer = setTimeout(() => setPhase("idle"), resetAfter);
    return () => clearTimeout(timer);
  }, [phase, resetAfter]);

  const handleClick = () => {
    if (phase === "idle") {
      setPhase("pending");
      callbacks.current.onAction?.();
    } else if (phase === "pending") {
      undo();
    }
  };

  const setHovered = (event: PointerEvent, value: boolean) => {
    if (event.pointerType === "mouse") {
      hoveredRef.current = value;
    }
  };

  const swap = reduceMotion
    ? { duration: 0 }
    : { duration: 0.22, ease: EASE_OUT };

  const ariaLabel = {
    idle: label,
    pending: `${doneLabel}. Undo, ${seconds} second${seconds === 1 ? "" : "s"} left`,
    done: doneLabel,
  }[phase];

  return (
    <span className="relative inline-flex" data-slot="undo-button-wrapper">
      <motion.button
        animate={{ width: width ?? "auto" }}
        aria-disabled={disabled || phase === "done"}
        aria-label={ariaLabel}
        className={cn(
          "relative inline-flex h-9 items-center justify-center overflow-hidden rounded-lg border border-input bg-popover text-base font-medium whitespace-nowrap text-foreground shadow-xs/5 transition-[background-color,border-color,color] duration-150 ease-out outline-none select-none not-dark:bg-clip-padding before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] not-disabled:not-active:before:shadow-[0_1px_--theme(--color-black/4%)] hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-64 sm:h-8 sm:text-sm dark:bg-input/32 dark:not-disabled:before:shadow-[0_-1px_--theme(--color-white/2%)] dark:not-disabled:not-active:before:shadow-[0_-1px_--theme(--color-white/6%)] dark:hover:bg-input/64 pointer-coarse:after:absolute pointer-coarse:after:size-full pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11",
          phase === "done" &&
            "cursor-default border-border bg-accent/40 text-foreground before:shadow-none hover:bg-accent/40 dark:hover:bg-accent/40",
          className,
        )}
        data-phase={phase}
        data-slot="undo-button"
        disabled={disabled}
        initial={false}
        onClick={handleClick}
        onPointerEnter={(event) => setHovered(event, true)}
        onPointerLeave={(event) => setHovered(event, false)}
        ref={buttonRef}
        transition={swap}
        type="button"
      >
        <span
          className="inline-flex px-3 sm:px-2.5"
          ref={contentRef}
          data-slot="undo-button-content"
        >
          <AnimatePresence initial={false} mode="popLayout">
            {phase === "pending" ? (
              <motion.span
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                className="inline-flex items-center gap-2 whitespace-nowrap sm:gap-1.5"
                exit={{ opacity: 0, y: -8, filter: "blur(2px)" }}
                initial={{ opacity: 0, y: 8, filter: "blur(2px)" }}
                key="pending"
                transition={swap}
              >
                <span className="text-muted-foreground">{doneLabel}</span>
                <span aria-hidden="true" className="h-3.5 w-px bg-border" />
                <Undo2 aria-hidden="true" className="-mx-0.5 size-4 shrink-0" />
                <span>Undo</span>
                <Countdown reduceMotion={reduceMotion} value={seconds} />
                <Kbd className="hidden sm:inline-flex">
                  {isMac ? "⌘Z" : "Ctrl Z"}
                </Kbd>
              </motion.span>
            ) : (
              <motion.span
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                className="grid grid-cols-1 items-center justify-items-center"
                exit={{ opacity: 0, y: -8, filter: "blur(2px)" }}
                initial={{ opacity: 0, y: 8, filter: "blur(2px)" }}
                key="resting"
                transition={swap}
              >
                {/* Idle state layer */}
                <span
                  aria-hidden={phase !== "idle"}
                  className={cn(
                    "col-start-1 row-start-1 inline-flex items-center gap-2 whitespace-nowrap transition-opacity duration-200 sm:gap-1.5",
                    phase === "idle"
                      ? "opacity-100"
                      : "pointer-events-none opacity-0",
                  )}
                >
                  <Icon
                    aria-hidden="true"
                    className="-mx-0.5 size-4 shrink-0"
                  />
                  <span>{label}</span>
                </span>

                {/* Done/success state layer */}
                <span
                  aria-hidden={phase !== "done"}
                  className={cn(
                    "col-start-1 row-start-1 inline-flex items-center gap-2 whitespace-nowrap transition-opacity duration-200 sm:gap-1.5",
                    phase === "done"
                      ? "opacity-100"
                      : "pointer-events-none opacity-0",
                  )}
                >
                  {DoneIcon ? (
                    <motion.span
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex shrink-0 items-center text-emerald-600 dark:text-emerald-400"
                      initial={{ scale: 0.5, opacity: 0 }}
                      transition={{
                        damping: 20,
                        stiffness: 500,
                        type: "spring",
                      }}
                    >
                      <DoneIcon
                        aria-hidden="true"
                        className="-mx-0.5 size-4 shrink-0"
                      />
                    </motion.span>
                  ) : (
                    <DrawnCheck />
                  )}
                  <span className="font-medium text-foreground">
                    {doneLabel}
                  </span>
                </span>
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      </motion.button>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 size-full overflow-visible"
      >
        <title>Time left to undo</title>
        <motion.path
          animate={{ opacity: phase === "pending" ? 1 : 0 }}
          className="stroke-foreground"
          fill="none"
          initial={false}
          ref={pathRef}
          strokeLinecap="round"
          strokeWidth={STROKE}
          transition={{ duration: phase === "pending" ? 0.15 : 0.2 }}
        />
      </svg>
      <span aria-live="polite" className="sr-only">
        {phase === "pending" &&
          `${doneLabel}. Press the button or ${isMac ? "Command" : "Control"} Z to undo.`}
        {phase === "done" && doneLabel}
      </span>
    </span>
  );
}

function Countdown({
  value,
  reduceMotion,
}: {
  value: number;
  reduceMotion: boolean;
}) {
  return (
    <span
      data-slot="undo-button-countdown"
      className="relative inline-flex h-5 min-w-[1ch] justify-center overflow-hidden text-muted-foreground tabular-nums select-none"
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          animate={{ y: 0, opacity: 1 }}
          className="leading-5"
          exit={{ y: -10, opacity: 0 }}
          initial={{ y: 10, opacity: 0 }}
          key={value}
          transition={
            reduceMotion ? { duration: 0 } : { duration: 0.2, ease: EASE_OUT }
          }
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
