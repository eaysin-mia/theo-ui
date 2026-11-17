"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { cn } from "@theo/ui/utils";

const formatDate = (
  date: Date,
  timeZone: string,
  locale = "en-US",
  options?: Intl.DateTimeFormatOptions,
) => {
  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "long",
      timeZone,
      ...options,
    }).format(date);
  } catch {
    return date.toLocaleDateString(locale);
  }
};

const formatTime = (
  date: Date,
  timeZone: string,
  locale = "en-US",
  options?: Intl.DateTimeFormatOptions,
) => {
  try {
    return new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone,
      ...options,
    }).format(date);
  } catch {
    return date.toLocaleTimeString(locale);
  }
};

type RelativeTimeContextType = {
  time: Date;
  locale?: string;
  dateFormatOptions?: Intl.DateTimeFormatOptions;
  timeFormatOptions?: Intl.DateTimeFormatOptions;
};

const RelativeTimeContext = createContext<RelativeTimeContextType>({
  time: new Date(),
  locale: "en-US",
  dateFormatOptions: {
    dateStyle: "long",
  },
  timeFormatOptions: {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  },
});

export const useRelativeTimeContext = () => useContext(RelativeTimeContext);

export interface RelativeTimeProps extends useRender.ComponentProps<"div"> {
  time?: Date;
  defaultTime?: Date;
  onTimeChange?: (time: Date) => void;
  locale?: string;
  dateFormatOptions?: Intl.DateTimeFormatOptions;
  timeFormatOptions?: Intl.DateTimeFormatOptions;
  intervalMs?: number;
}

export function RelativeTime({
  time: controlledTime,
  defaultTime,
  onTimeChange,
  locale = "en-US",
  dateFormatOptions,
  timeFormatOptions,
  intervalMs = 1000,
  className,
  children,
  render,
  ...props
}: RelativeTimeProps) {
  const [uncontrolledTime, setUncontrolledTime] = useState<Date>(
    () => defaultTime ?? new Date(),
  );

  const isControlled = controlledTime !== undefined;
  const currentTime = isControlled ? controlledTime : uncontrolledTime;

  const updateTime = useCallback(
    (nextTime: Date) => {
      if (!isControlled) {
        setUncontrolledTime(nextTime);
      }
      onTimeChange?.(nextTime);
    },
    [isControlled, onTimeChange],
  );

  useEffect(() => {
    if (isControlled || intervalMs <= 0) {
      return;
    }

    const timer = setInterval(() => {
      updateTime(new Date());
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isControlled, intervalMs, updateTime]);

  const defaultProps = {
    "data-slot": "relative-time",
    className: cn("grid gap-2 text-sm", className),
    children,
  };

  const element = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });

  const contextValue = useMemo(
    () => ({
      time: currentTime,
      locale,
      dateFormatOptions,
      timeFormatOptions,
    }),
    [currentTime, locale, dateFormatOptions, timeFormatOptions],
  );

  return (
    <RelativeTimeContext.Provider value={contextValue}>
      {element}
    </RelativeTimeContext.Provider>
  );
}

export interface RelativeTimeZoneProps extends useRender.ComponentProps<"div"> {
  zone: string;
  dateFormatOptions?: Intl.DateTimeFormatOptions;
  timeFormatOptions?: Intl.DateTimeFormatOptions;
}

type RelativeTimeZoneContextType = {
  zone: string;
  dateFormatOptions?: Intl.DateTimeFormatOptions;
  timeFormatOptions?: Intl.DateTimeFormatOptions;
};

const RelativeTimeZoneContext = createContext<RelativeTimeZoneContextType>({
  zone: "UTC",
});

export const useRelativeTimeZoneContext = () =>
  useContext(RelativeTimeZoneContext);

export function RelativeTimeZone({
  zone,
  dateFormatOptions,
  timeFormatOptions,
  className,
  children,
  render,
  ...props
}: RelativeTimeZoneProps) {
  const defaultProps = {
    "data-slot": "relative-time-zone",
    className: cn(
      "flex items-center justify-between gap-1.5 text-xs",
      className,
    ),
    children,
  };

  const element = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });

  const contextValue = useMemo(
    () => ({
      zone,
      dateFormatOptions,
      timeFormatOptions,
    }),
    [zone, dateFormatOptions, timeFormatOptions],
  );

  return (
    <RelativeTimeZoneContext.Provider value={contextValue}>
      {element}
    </RelativeTimeZoneContext.Provider>
  );
}

export interface RelativeTimeZoneDisplayProps extends useRender.ComponentProps<"time"> {
  formatOptions?: Intl.DateTimeFormatOptions;
}

export function RelativeTimeZoneDisplay({
  className,
  children,
  formatOptions,
  render,
  ...props
}: RelativeTimeZoneDisplayProps) {
  const {
    time,
    locale,
    timeFormatOptions: globalTimeFormatOptions,
  } = useRelativeTimeContext();
  const { zone, timeFormatOptions: zoneTimeFormatOptions } =
    useRelativeTimeZoneContext();

  const options =
    formatOptions ?? zoneTimeFormatOptions ?? globalTimeFormatOptions;
  const display = formatTime(time, zone, locale, options);

  const defaultProps = {
    "data-slot": "relative-time-zone-display",
    dateTime: time.toISOString(),
    suppressHydrationWarning: true,
    className: cn(
      "ms-auto ps-8 text-muted-foreground tabular-nums select-none",
      className,
    ),
    children: children ?? display,
  };

  return useRender({
    defaultTagName: "time",
    render,
    props: mergeProps<"time">(defaultProps, props),
  });
}

export interface RelativeTimeZoneDateProps extends useRender.ComponentProps<"time"> {
  formatOptions?: Intl.DateTimeFormatOptions;
}

export function RelativeTimeZoneDate({
  className,
  children,
  formatOptions,
  render,
  ...props
}: RelativeTimeZoneDateProps) {
  const {
    time,
    locale,
    dateFormatOptions: globalDateFormatOptions,
  } = useRelativeTimeContext();
  const { zone, dateFormatOptions: zoneDateFormatOptions } =
    useRelativeTimeZoneContext();

  const options =
    formatOptions ?? zoneDateFormatOptions ?? globalDateFormatOptions;
  const display = formatDate(time, zone, locale, options);

  const defaultProps = {
    "data-slot": "relative-time-zone-date",
    dateTime: time.toISOString(),
    suppressHydrationWarning: true,
    className: cn("text-foreground", className),
    children: children ?? display,
  };

  return useRender({
    defaultTagName: "time",
    render,
    props: mergeProps<"time">(defaultProps, props),
  });
}

export interface RelativeTimeZoneLabelProps extends useRender.ComponentProps<"span"> {}

export function RelativeTimeZoneLabel({
  className,
  children,
  render,
  ...props
}: RelativeTimeZoneLabelProps) {
  const defaultProps = {
    "data-slot": "relative-time-zone-label",
    className: cn(
      "inline-flex h-4 items-center justify-center rounded-xs bg-secondary px-1.5 font-mono text-[10px] text-secondary-foreground uppercase",
      className,
    ),
    children,
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}
