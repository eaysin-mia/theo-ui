"use client";

import { cva, type VariantProps } from "class-variance-authority";
import {
  ArchiveIcon,
  BanIcon,
  LogOutIcon,
  type LucideIcon,
  SendIcon,
  Trash2Icon,
} from "lucide-react";
import {
  AnimatePresence,
  type AnimationPlaybackControls,
  animate,
  MotionConfig,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import {
  type ButtonHTMLAttributes,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@workspace/ui/lib/utils";

export const holdButtonVariants = cva(
  [
    "group/hold relative inline-flex shrink-0 touch-none items-center justify-center font-medium whitespace-nowrap transition-shadow outline-none select-none",
    "overflow-hidden rounded-lg border",
    "shadow-xs/5 [-webkit-touch-callout:none] not-dark:bg-clip-padding",
    "before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)]",
    "not-disabled:not-active:before:shadow-[0_1px_--theme(--color-black/4%)]",
    "not-data-complete:cursor-pointer data-complete:cursor-default",
    "not-data-complete:dark:bg-input/32",
    "not-data-complete:dark:not-disabled:before:shadow-[0_-1px_--theme(--color-white/2%)] not-data-complete:dark:not-disabled:not-active:before:shadow-[0_-1px_--theme(--color-white/6%)]",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-64",
    "pointer-coarse:after:absolute pointer-coarse:after:size-full pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        destructive: [
          "border-input bg-popover text-destructive not-data-complete:hover:border-destructive/32 not-data-complete:hover:bg-destructive/8",
          "data-complete:border-destructive data-complete:bg-destructive data-complete:text-white data-complete:shadow-xs data-complete:shadow-destructive/24 data-complete:not-disabled:inset-shadow-[0_1px_--theme(--color-white/16%)] dark:data-complete:text-white dark:data-complete:before:shadow-none",
        ],
        red: [
          "border-input bg-popover text-destructive not-data-complete:hover:border-destructive/32 not-data-complete:hover:bg-destructive/8",
          "data-complete:border-destructive data-complete:bg-destructive data-complete:text-white data-complete:shadow-xs data-complete:shadow-destructive/24 data-complete:not-disabled:inset-shadow-[0_1px_--theme(--color-white/16%)] dark:data-complete:text-white dark:data-complete:before:shadow-none",
        ],
        default: [
          "border-input bg-popover text-foreground not-data-complete:hover:bg-accent/50",
          "data-complete:border-primary data-complete:bg-primary data-complete:text-primary-foreground data-complete:shadow-xs data-complete:shadow-primary/24 data-complete:not-disabled:inset-shadow-[0_1px_--theme(--color-white/16%)] dark:data-complete:text-primary-foreground dark:data-complete:before:shadow-none",
        ],
        grey: [
          "border-input bg-popover text-foreground not-data-complete:hover:bg-accent/50",
          "data-complete:border-primary data-complete:bg-primary data-complete:text-primary-foreground data-complete:shadow-xs data-complete:shadow-primary/24 data-complete:not-disabled:inset-shadow-[0_1px_--theme(--color-white/16%)] dark:data-complete:text-primary-foreground dark:data-complete:before:shadow-none",
        ],
        gray: [
          "border-input bg-popover text-foreground not-data-complete:hover:bg-accent/50",
          "data-complete:border-primary data-complete:bg-primary data-complete:text-primary-foreground data-complete:shadow-xs data-complete:shadow-primary/24 data-complete:not-disabled:inset-shadow-[0_1px_--theme(--color-white/16%)] dark:data-complete:text-primary-foreground dark:data-complete:before:shadow-none",
        ],
        success: [
          "border-input bg-popover text-emerald-600 not-data-complete:hover:border-emerald-500/32 not-data-complete:hover:bg-emerald-500/8 dark:text-emerald-400 dark:not-data-complete:hover:border-emerald-400/32 dark:not-data-complete:hover:bg-emerald-400/8",
          "data-complete:border-emerald-600 data-complete:bg-emerald-600 data-complete:text-white data-complete:shadow-xs data-complete:shadow-emerald-600/24 data-complete:not-disabled:inset-shadow-[0_1px_--theme(--color-white/16%)] dark:data-complete:text-white dark:data-complete:before:shadow-none",
        ],
        green: [
          "border-input bg-popover text-emerald-600 not-data-complete:hover:border-emerald-500/32 not-data-complete:hover:bg-emerald-500/8 dark:text-emerald-400 dark:not-data-complete:hover:border-emerald-400/32 dark:not-data-complete:hover:bg-emerald-400/8",
          "data-complete:border-emerald-600 data-complete:bg-emerald-600 data-complete:text-white data-complete:shadow-xs data-complete:shadow-emerald-600/24 data-complete:not-disabled:inset-shadow-[0_1px_--theme(--color-white/16%)] dark:data-complete:text-white dark:data-complete:before:shadow-none",
        ],
        info: [
          "border-input bg-popover text-blue-600 not-data-complete:hover:border-blue-500/32 not-data-complete:hover:bg-blue-500/8 dark:text-blue-400 dark:not-data-complete:hover:border-blue-400/32 dark:not-data-complete:hover:bg-blue-400/8",
          "data-complete:border-blue-600 data-complete:bg-blue-600 data-complete:text-white data-complete:shadow-xs data-complete:shadow-blue-600/24 data-complete:not-disabled:inset-shadow-[0_1px_--theme(--color-white/16%)] dark:data-complete:text-white dark:data-complete:before:shadow-none",
        ],
        blue: [
          "border-input bg-popover text-blue-600 not-data-complete:hover:border-blue-500/32 not-data-complete:hover:bg-blue-500/8 dark:text-blue-400 dark:not-data-complete:hover:border-blue-400/32 dark:not-data-complete:hover:bg-blue-400/8",
          "data-complete:border-blue-600 data-complete:bg-blue-600 data-complete:text-white data-complete:shadow-xs data-complete:shadow-blue-600/24 data-complete:not-disabled:inset-shadow-[0_1px_--theme(--color-white/16%)] dark:data-complete:text-white dark:data-complete:before:shadow-none",
        ],
        warning: [
          "border-input bg-popover text-amber-600 not-data-complete:hover:border-amber-500/32 not-data-complete:hover:bg-amber-500/8 dark:text-amber-400 dark:not-data-complete:hover:border-amber-400/32 dark:not-data-complete:hover:bg-amber-400/8",
          "data-complete:border-amber-600 data-complete:bg-amber-600 data-complete:text-white data-complete:shadow-xs data-complete:shadow-amber-600/24 data-complete:not-disabled:inset-shadow-[0_1px_--theme(--color-white/16%)] dark:data-complete:text-white dark:data-complete:before:shadow-none",
        ],
        orange: [
          "border-input bg-popover text-amber-600 not-data-complete:hover:border-amber-500/32 not-data-complete:hover:bg-amber-500/8 dark:text-amber-400 dark:not-data-complete:hover:border-amber-400/32 dark:not-data-complete:hover:bg-amber-400/8",
          "data-complete:border-amber-600 data-complete:bg-amber-600 data-complete:text-white data-complete:shadow-xs data-complete:shadow-amber-600/24 data-complete:not-disabled:inset-shadow-[0_1px_--theme(--color-white/16%)] dark:data-complete:text-white dark:data-complete:before:shadow-none",
        ],
      },
      size: {
        default: "h-9 px-3 text-base sm:h-8 sm:px-2.5 sm:text-sm",
        sm: "h-8 gap-1.5 px-2.5 text-sm sm:h-7 sm:px-2 sm:text-xs",
        lg: "h-10 px-3.5 text-base sm:h-9 sm:px-3",
      },
    },
    defaultVariants: {
      variant: "destructive",
      size: "default",
    },
  },
);

export type HoldButtonVariant = NonNullable<
  VariantProps<typeof holdButtonVariants>["variant"]
>;
export type HoldButtonSize = NonNullable<
  VariantProps<typeof holdButtonVariants>["size"]
>;

const VARIANT_DEFAULTS: Record<
  HoldButtonVariant,
  { icon: LucideIcon; label: string; completeLabel: string }
> = {
  destructive: {
    icon: Trash2Icon,
    label: "Hold to delete",
    completeLabel: "Deleted",
  },
  red: {
    icon: Trash2Icon,
    label: "Hold to delete",
    completeLabel: "Deleted",
  },
  default: {
    icon: BanIcon,
    label: "Hold to block",
    completeLabel: "Blocked",
  },
  grey: {
    icon: BanIcon,
    label: "Hold to block",
    completeLabel: "Blocked",
  },
  gray: {
    icon: BanIcon,
    label: "Hold to block",
    completeLabel: "Blocked",
  },
  success: {
    icon: ArchiveIcon,
    label: "Hold to archive",
    completeLabel: "Archived",
  },
  green: {
    icon: ArchiveIcon,
    label: "Hold to archive",
    completeLabel: "Archived",
  },
  info: {
    icon: SendIcon,
    label: "Hold to send",
    completeLabel: "Sent",
  },
  blue: {
    icon: SendIcon,
    label: "Hold to send",
    completeLabel: "Sent",
  },
  warning: {
    icon: LogOutIcon,
    label: "Hold to sign out",
    completeLabel: "Signed out",
  },
  orange: {
    icon: LogOutIcon,
    label: "Hold to sign out",
    completeLabel: "Signed out",
  },
};

export interface HoldButtonProps
  extends
    Omit<
      ButtonHTMLAttributes<HTMLButtonElement>,
      "children" | "onAnimationStart" | "onDrag" | "onDragEnd" | "onDragStart"
    >,
    VariantProps<typeof holdButtonVariants> {
  /** Idle label. Defaults to a verb that matches the variant. */
  children?: ReactNode;
  /** Custom icon shown in idle state. Overrides variant default. */
  icon?: LucideIcon;
  /** How long (ms) the button has to be held. */
  holdDuration?: number;
  /** Label while holding. */
  holdingLabel?: ReactNode;
  /** Label once the hold completes. */
  completeLabel?: ReactNode;
  /** How long (ms) the complete state shows before resetting. 0 keeps it. */
  resetAfter?: number;
  /**
   * Called once the button has been held for the full `holdDuration`.
   * A short click or an early release never calls it.
   */
  onHoldComplete?: () => void;
}

type Phase = "idle" | "holding" | "complete";

const HOLD_KEYS = new Set([" ", "Enter"]);
const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const LABEL_TRANSITION = { duration: 0.2, ease: EASE_OUT };
/** Time (ms) a full fill takes to drain after an early release. */
const DRAIN_MS = 300;
/** The holding label waits this long (ms), so a quick tap doesn't flicker it. */
const LABEL_DELAY_MS = 150;

function DrawnCheck() {
  return (
    <svg
      aria-hidden="true"
      className="size-4 shrink-0"
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

export function HoldButton({
  className,
  variant = "destructive",
  size = "default",
  holdDuration = 1200,
  holdingLabel = "Keep holding",
  completeLabel,
  resetAfter = 1800,
  onHoldComplete,
  children,
  icon: CustomIcon,
  type = "button",
  disabled,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  onPointerCancel,
  onKeyDown,
  onKeyUp,
  onBlur,
  ...props
}: HoldButtonProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [showHoldingLabel, setShowHoldingLabel] = useState(false);
  const labelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phaseRef = useRef<Phase>("idle");
  const progress = useMotionValue(0);
  const animationRef = useRef<AnimationPlaybackControls | null>(null);
  const resetRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onHoldCompleteRef = useRef(onHoldComplete);
  const shouldReduceMotion = useReducedMotion();

  // Progress fill: advances horizontally from left to right.
  // Parent's `overflow-hidden rounded-lg` clips it to the button's boundary,
  // preventing subpixel seams or Skia arc distortion at corner radius.
  const clipPath = useTransform(
    progress,
    (p) => `inset(0 ${(1 - p) * 100}% 0 0)`,
  );

  const defaults = VARIANT_DEFAULTS[variant ?? "destructive"];
  const Icon = CustomIcon ?? defaults.icon;

  const idleLabel: ReactNode = children ?? defaults.label;
  const finalCompleteLabel: ReactNode = completeLabel ?? defaults.completeLabel;

  useEffect(() => {
    onHoldCompleteRef.current = onHoldComplete;
  }, [onHoldComplete]);

  useEffect(
    () => () => {
      animationRef.current?.stop();
      if (labelTimerRef.current) {
        clearTimeout(labelTimerRef.current);
      }
      if (resetRef.current) {
        clearTimeout(resetRef.current);
      }
    },
    [],
  );

  const updatePhase = (next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
    if (labelTimerRef.current) {
      clearTimeout(labelTimerRef.current);
      labelTimerRef.current = null;
    }
    if (next === "holding") {
      labelTimerRef.current = setTimeout(
        () => setShowHoldingLabel(true),
        LABEL_DELAY_MS,
      );
    } else {
      setShowHoldingLabel(false);
    }
  };

  const complete = () => {
    updatePhase("complete");
    onHoldCompleteRef.current?.();
    if (resetAfter > 0) {
      resetRef.current = setTimeout(() => {
        resetRef.current = null;
        progress.set(0);
        updatePhase("idle");
      }, resetAfter);
    }
  };

  const startHold = () => {
    if (phaseRef.current !== "idle" || disabled) {
      return;
    }
    updatePhase("holding");
    animationRef.current?.stop();
    // Picks up from wherever a previous drain left the fill.
    const remaining = (1 - progress.get()) * holdDuration;
    animationRef.current = animate(progress, 1, {
      duration: remaining / 1000,
      ease: "linear",
      onComplete: () => {
        if (phaseRef.current === "holding") {
          complete();
        }
      },
    });
  };

  const endHold = () => {
    if (phaseRef.current !== "holding") {
      return;
    }
    updatePhase("idle");
    animationRef.current?.stop();
    // A near miss visibly unwinds; a short tap barely moves.
    animationRef.current = animate(progress, 0, {
      duration: shouldReduceMotion ? 0 : (progress.get() * DRAIN_MS) / 1000,
      ease: EASE_OUT,
    });
  };

  const handlePointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    onPointerDown?.(e);
    if (e.button !== 0) {
      return;
    }
    // Touch pointers are captured implicitly, which would keep the hold
    // going after the finger slides off. Release so pointerleave cancels it.
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    startHold();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(e);
    if (HOLD_KEYS.has(e.key)) {
      // Stops Enter from firing click and Space from scrolling.
      e.preventDefault();
      if (!e.repeat) {
        startHold();
      }
    }
  };

  const handleKeyUp = (e: KeyboardEvent<HTMLButtonElement>) => {
    onKeyUp?.(e);
    if (HOLD_KEYS.has(e.key)) {
      endHold();
    }
  };

  let activeLabel: ReactNode = idleLabel;
  if (phase === "holding" && showHoldingLabel) {
    activeLabel = holdingLabel;
  } else if (phase === "complete") {
    activeLabel = finalCompleteLabel;
  }

  const labelKey = phase === "holding" && !showHoldingLabel ? "idle" : phase;

  return (
    <MotionConfig reducedMotion="user">
      <button
        {...props}
        aria-disabled={phase === "complete" || undefined}
        className={cn(holdButtonVariants({ variant, size }), className)}
        data-complete={phase === "complete" || undefined}
        data-holding={phase === "holding" || undefined}
        data-phase={phase}
        data-slot="hold-button"
        disabled={disabled}
        onBlur={(e) => {
          onBlur?.(e);
          endHold();
        }}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onPointerCancel={(e) => {
          onPointerCancel?.(e);
          endHold();
        }}
        onPointerDown={handlePointerDown}
        onPointerLeave={(e) => {
          onPointerLeave?.(e);
          endHold();
        }}
        onPointerUp={(e) => {
          onPointerUp?.(e);
          endHold();
        }}
        type={type}
      >
        {/* The fill is the button's ink at low strength, revealed left to
            right. It only renders while holding and fades out once complete. */}
        <motion.span
          animate={{ opacity: phase === "holding" ? 1 : 0 }}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-current/15 dark:bg-current/20"
          style={{ clipPath }}
          transition={{ duration: 0.15 }}
        />

        {/* Place-stable single-cell grid anchor:
            All states are placed in row 1, col 1. Invisible ghost items calculate
            max natural content width at render time so the button never shifts or shrinks. */}
        <span
          className="relative grid items-center justify-center"
          data-slot="hold-button-content"
        >
          {/* Ghost 1: Idle label */}
          <span
            aria-hidden="true"
            className="pointer-events-none invisible col-start-1 row-start-1 inline-flex items-center gap-2 px-0.5 whitespace-nowrap"
          >
            <Icon aria-hidden="true" className="size-4 shrink-0" />
            <span>{idleLabel}</span>
          </span>

          {/* Ghost 2: Holding label */}
          <span
            aria-hidden="true"
            className="pointer-events-none invisible col-start-1 row-start-1 inline-flex items-center gap-2 px-0.5 whitespace-nowrap"
          >
            <Icon aria-hidden="true" className="size-4 shrink-0" />
            <span>{holdingLabel}</span>
          </span>

          {/* Ghost 3: Complete label */}
          <span
            aria-hidden="true"
            className="pointer-events-none invisible col-start-1 row-start-1 inline-flex items-center gap-2 px-0.5 whitespace-nowrap"
          >
            <DrawnCheck />
            <span>{finalCompleteLabel}</span>
          </span>

          {/* Active animated label */}
          <span className="col-start-1 row-start-1 inline-flex items-center justify-center overflow-y-clip px-0.5">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                className="inline-flex items-center gap-2 whitespace-nowrap"
                exit={{ opacity: 0, y: -8, filter: "blur(2px)" }}
                initial={{ opacity: 0, y: 8, filter: "blur(2px)" }}
                key={labelKey}
                transition={LABEL_TRANSITION}
              >
                {labelKey === "complete" ? (
                  <DrawnCheck />
                ) : (
                  <Icon aria-hidden="true" className="size-4 shrink-0" />
                )}
                <span>{activeLabel}</span>
              </motion.span>
            </AnimatePresence>
          </span>
        </span>

        <span aria-live="polite" className="sr-only">
          {phase === "complete" ? finalCompleteLabel : ""}
        </span>
      </button>
    </MotionConfig>
  );
}
