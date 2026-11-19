"use client";

import * as React from "react";
import { useState } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { StarIcon } from "lucide-react";

import { cn } from "@theo/ui/lib/utils";

const ratingVariants = cva("inline-flex items-center", {
  variants: {
    size: {
      xs: "gap-1.5 text-xs",
      sm: "gap-2 text-xs",
      default: "gap-2.5 text-sm",
      lg: "gap-3 text-base",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

const starVariants = cva("shrink-0 transition-colors", {
  variants: {
    size: {
      xs: "size-3.5",
      sm: "size-4",
      default: "size-5",
      lg: "size-6",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

const valueVariants = cva("font-medium text-muted-foreground", {
  variants: {
    size: {
      xs: "text-xs",
      sm: "text-xs",
      default: "text-sm",
      lg: "text-base",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

type RatingProps = Omit<React.ComponentProps<"div">, "onChange"> &
  VariantProps<typeof ratingVariants> & {
    /**
     * Current rating value (supports decimal values for partial stars)
     */
    rating?: number;
    value?: number;
    /**
     * Default rating value when uncontrolled
     */
    defaultValue?: number;
    /**
     * Maximum rating value (number of stars to show)
     */
    maxRating?: number;
    max?: number;
    /**
     * Whether to show the numeric rating value
     */
    showValue?: boolean;
    /**
     * Class name for the star icons
     */
    starClassName?: string;
    /**
     * Class name for the value span
     */
    valueClassName?: string;
    /**
     * Whether the rating is editable (clickable & keyboard interactive)
     */
    editable?: boolean;
    /**
     * Whether the rating is disabled
     */
    disabled?: boolean;
    /**
     * Whether the rating is read-only
     */
    readOnly?: boolean;
    /**
     * Callback function called when rating changes
     */
    onRatingChange?: (rating: number) => void;
    onChange?: (rating: number) => void;
  };

function Rating({
  rating: ratingProp,
  value: valueProp,
  defaultValue = 0,
  maxRating: maxRatingProp,
  max = 5,
  size = "default",
  className,
  starClassName,
  valueClassName,
  showValue = false,
  editable = false,
  disabled = false,
  readOnly = false,
  onRatingChange,
  onChange,
  ...props
}: RatingProps) {
  const maxStars = maxRatingProp ?? max;
  const isControlled = ratingProp !== undefined || valueProp !== undefined;
  const [internalRating, setInternalRating] = useState<number>(
    ratingProp ?? valueProp ?? defaultValue,
  );
  const currentRating = isControlled
    ? (ratingProp ?? valueProp ?? 0)
    : internalRating;

  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const isInteractive = editable && !disabled && !readOnly;
  const displayRating =
    isInteractive && hoveredRating !== null ? hoveredRating : currentRating;

  const handleRatingSelect = (newRating: number) => {
    if (!isInteractive) return;
    if (!isControlled) {
      setInternalRating(newRating);
    }
    onRatingChange?.(newRating);
    onChange?.(newRating);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (!isInteractive) return;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(maxStars, (currentRating || index) + 1);
      handleRatingSelect(next);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      const prev = Math.max(1, (currentRating || index) - 1);
      handleRatingSelect(prev);
    } else if (e.key === "Home") {
      e.preventDefault();
      handleRatingSelect(1);
    } else if (e.key === "End") {
      e.preventDefault();
      handleRatingSelect(maxStars);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleRatingSelect(index);
    }
  };

  return (
    <div
      data-slot="rating"
      data-size={size}
      data-disabled={disabled ? "" : undefined}
      data-editable={isInteractive ? "" : undefined}
      className={cn(
        ratingVariants({ size }),
        disabled && "pointer-events-none opacity-64",
        className,
      )}
      {...(!isInteractive
        ? {
            role: "img",
            "aria-label": `Rating: ${currentRating} of ${maxStars} stars`,
          }
        : {
            role: "radiogroup",
            "aria-label": "Rating",
          })}
      {...props}
    >
      <div
        className="inline-flex items-center"
        onMouseLeave={() => isInteractive && setHoveredRating(null)}
      >
        {Array.from({ length: maxStars }, (_, index) => {
          const starIndex = index + 1;
          const filled = displayRating >= starIndex;
          const partiallyFilled =
            displayRating > starIndex - 1 && displayRating < starIndex;
          const fillPercentage = partiallyFilled
            ? (displayRating - (starIndex - 1)) * 100
            : 0;

          const StarWrapper = isInteractive ? "button" : "div";

          return (
            <StarWrapper
              key={starIndex}
              {...(isInteractive
                ? {
                    type: "button" as const,
                    role: "radio" as const,
                    "aria-checked": currentRating === starIndex,
                    "aria-label": `${starIndex} of ${maxStars} stars`,
                    tabIndex:
                      currentRating === starIndex ||
                      (currentRating === 0 && starIndex === 1)
                        ? 0
                        : -1,
                    onClick: () => handleRatingSelect(starIndex),
                    onMouseEnter: () => setHoveredRating(starIndex),
                    onKeyDown: (e: React.KeyboardEvent) =>
                      handleKeyDown(e, starIndex),
                  }
                : {})}
              className={cn(
                "relative inline-flex items-center justify-center rounded-xs outline-none focus-visible:ring-1 focus-visible:ring-ring",
                isInteractive && "cursor-pointer",
              )}
            >
              {/* Star icon (filled or empty) */}
              <StarIcon
                data-slot={filled ? "rating-star-filled" : "rating-star-empty"}
                aria-hidden="true"
                className={cn(
                  starVariants({ size }),
                  filled
                    ? "fill-amber-400 text-amber-400 dark:fill-amber-500 dark:text-amber-500"
                    : "text-muted-foreground/30",
                  starClassName,
                )}
              />

              {/* Partially filled overlay (only for fractional ratings like 3.5) */}
              {partiallyFilled && (
                <div
                  className="pointer-events-none absolute inset-0 overflow-hidden"
                  style={{
                    width: `${fillPercentage}%`,
                  }}
                >
                  <StarIcon
                    data-slot="rating-star-filled"
                    aria-hidden="true"
                    className={cn(
                      starVariants({ size }),
                      "fill-amber-400 text-amber-400 dark:fill-amber-500 dark:text-amber-500",
                      starClassName,
                    )}
                  />
                </div>
              )}
            </StarWrapper>
          );
        })}
      </div>

      {showValue && (
        <span
          data-slot="rating-value"
          className={cn(valueVariants({ size }), valueClassName)}
        >
          {displayRating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

export { Rating, ratingVariants, starVariants, type RatingProps };
