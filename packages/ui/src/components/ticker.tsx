"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { TrendingDown, TrendingUp } from "lucide-react";
import type React from "react";
import { createContext, useContext, useMemo } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "#components/avatar";
import { cn } from "#lib/utils";

type TickerContextValue = {
  formatter: Intl.NumberFormat;
};

const DEFAULT_CURRENCY = "USD";
const DEFAULT_LOCALE = "en-US";

const defaultFormatter = new Intl.NumberFormat(DEFAULT_LOCALE, {
  style: "currency",
  currency: DEFAULT_CURRENCY,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const TickerContext = createContext<TickerContextValue>({
  formatter: defaultFormatter,
});

export const useTickerContext = () => useContext(TickerContext);

export const tickerVariants = cva(
  "inline-flex items-center align-middle font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-64 [button&,a&]:cursor-pointer",
  {
    variants: {
      variant: {
        default: "gap-1.5",
        outline:
          "rounded-lg border border-input bg-background shadow-xs/5 hover:bg-accent/50 dark:bg-input/32 dark:hover:bg-input/48",
        surface:
          "rounded-lg bg-muted/50 hover:bg-muted dark:bg-input/24 dark:hover:bg-input/36",
      },
      size: {
        sm: "text-xs [&_[data-slot=avatar]]:size-5 [&_[data-slot=ticker-icon]]:size-5",
        default:
          "text-sm [&_[data-slot=avatar]]:size-7 [&_[data-slot=ticker-icon]]:size-7",
        lg: "text-base [&_[data-slot=avatar]]:size-8 [&_[data-slot=ticker-icon]]:size-8",
      },
    },
    compoundVariants: [
      {
        variant: ["outline", "surface"],
        size: "sm",
        className: "gap-1 px-2 py-0.5",
      },
      {
        variant: ["outline", "surface"],
        size: "default",
        className: "gap-1.5 px-2.5 py-1",
      },
      {
        variant: ["outline", "surface"],
        size: "lg",
        className: "gap-2 px-3 py-1.5",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface TickerProps
  extends
    useRender.ComponentProps<"button">,
    VariantProps<typeof tickerVariants> {
  currency?: string;
  locale?: string;
}

export function Ticker({
  children,
  className,
  currency = DEFAULT_CURRENCY,
  locale = DEFAULT_LOCALE,
  variant,
  size,
  render,
  ...props
}: TickerProps) {
  const formatter = useMemo(() => {
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency.toUpperCase(),
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } catch {
      return defaultFormatter;
    }
  }, [currency, locale]);

  const defaultProps = {
    "data-slot": "ticker",
    type: "button" as const,
    className: cn(tickerVariants({ variant, size }), className),
    children,
  };

  const element = useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
  });

  return (
    <TickerContext.Provider value={{ formatter }}>
      {element}
    </TickerContext.Provider>
  );
}

export interface TickerIconProps extends React.ComponentProps<typeof Avatar> {
  src?: string;
  symbol?: string;
  asChild?: boolean;
}

export function TickerIcon({
  src,
  symbol,
  className,
  asChild,
  children,
  ...props
}: TickerIconProps) {
  if (asChild || children) {
    return (
      <div
        data-slot="ticker-icon"
        className={cn(
          "flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/50 bg-muted",
          className,
        )}
      >
        {children}
      </div>
    );
  }

  return (
    <Avatar
      data-slot="ticker-icon"
      className={cn(
        "size-7 shrink-0 rounded-md border border-border/50 bg-muted",
        className,
      )}
      {...props}
    >
      {src && <AvatarImage src={src} alt={symbol ?? "Ticker logo"} />}
      <AvatarFallback className="rounded-[inherit] text-xs font-semibold text-muted-foreground uppercase">
        {symbol?.slice(0, 2).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}

export interface TickerSymbolProps extends React.ComponentProps<"span"> {
  symbol: string;
}

export function TickerSymbol({
  symbol,
  className,
  ...props
}: TickerSymbolProps) {
  return (
    <span
      data-slot="ticker-symbol"
      className={cn("font-semibold tracking-tight text-foreground", className)}
      {...props}
    >
      {symbol.toUpperCase()}
    </span>
  );
}

export interface TickerPriceProps extends React.ComponentProps<"span"> {
  price: number;
}

export function TickerPrice({ price, className, ...props }: TickerPriceProps) {
  const { formatter } = useTickerContext();

  const formattedPrice = useMemo(() => {
    try {
      return formatter.format(price);
    } catch {
      return String(price);
    }
  }, [price, formatter]);

  return (
    <span
      data-slot="ticker-price"
      className={cn("text-muted-foreground tabular-nums", className)}
      {...props}
    >
      {formattedPrice}
    </span>
  );
}

export interface TickerPriceChangeProps extends React.ComponentProps<"span"> {
  change: number;
  isPercent?: boolean;
  showIcon?: boolean;
  icon?: React.ReactNode;
}

export function TickerPriceChange({
  change,
  isPercent = false,
  showIcon = true,
  icon,
  className,
  ...props
}: TickerPriceChangeProps) {
  const isPositiveChange = change >= 0;
  const isZero = change === 0;
  const { formatter } = useTickerContext();

  const changeFormatted = useMemo(() => {
    if (isPercent) {
      return `${change.toFixed(2)}%`;
    }
    return formatter.format(change);
  }, [change, isPercent, formatter]);

  return (
    <span
      data-slot="ticker-price-change"
      data-direction={isZero ? "neutral" : isPositiveChange ? "up" : "down"}
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-medium tabular-nums",
        isZero
          ? "text-muted-foreground"
          : isPositiveChange
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-red-600 dark:text-red-400",
        className,
      )}
      {...props}
    >
      <span className="sr-only">
        {isPositiveChange
          ? "Increased by"
          : isZero
            ? "Unchanged"
            : "Decreased by"}
      </span>
      {showIcon &&
        (icon ? (
          icon
        ) : (
          <svg
            aria-hidden="true"
            className={cn(
              "size-2.5 shrink-0 fill-current",
              !isPositiveChange && "rotate-180",
            )}
            viewBox="0 0 24 24"
          >
            <path d="M24 22H0L12 2z" />
          </svg>
        ))}
      {changeFormatted}
    </span>
  );
}
