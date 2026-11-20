"use client";

import { formatHex } from "culori";
import QR from "qrcode";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "#lib/utils";

export interface QRCodeProps extends React.ComponentProps<"div"> {
  data: string;
  foreground?: string;
  background?: string;
  robustness?: "L" | "M" | "Q" | "H";
  margin?: number;
}

function resolveColorToHex(
  color: string | undefined,
  fallback: string,
): string {
  if (!color || color === "transparent" || color === "rgba(0, 0, 0, 0)") {
    return fallback;
  }
  try {
    const hex = formatHex(color);
    if (hex) {
      return hex;
    }
  } catch {
    // fallback below
  }
  return fallback;
}

export function QRCode({
  data,
  foreground,
  background,
  robustness = "M",
  margin = 0,
  className,
  ...props
}: QRCodeProps) {
  const [svg, setSVG] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const generateQR = async () => {
      try {
        let fgHex = foreground
          ? resolveColorToHex(foreground, "#000000")
          : null;
        let bgHex = background
          ? resolveColorToHex(background, "#ffffff")
          : null;

        if (!fgHex || !bgHex) {
          const el = containerRef.current;
          const isDark = document.documentElement.classList.contains("dark");
          const defaultFg = isDark ? "#ffffff" : "#000000";
          const defaultBg = isDark ? "#09090b" : "#ffffff";

          if (el) {
            const computed = window.getComputedStyle(el);
            if (!fgHex) {
              fgHex = resolveColorToHex(computed.color, defaultFg);
            }
            if (!bgHex) {
              bgHex = resolveColorToHex(computed.backgroundColor, defaultBg);
            }
          } else {
            fgHex = fgHex ?? defaultFg;
            bgHex = bgHex ?? defaultBg;
          }
        }

        const newSvg = await QR.toString(data, {
          type: "svg",
          color: {
            dark: fgHex,
            light: bgHex,
          },
          width: 200,
          errorCorrectionLevel: robustness,
          margin,
        });

        setSVG(newSvg);
      } catch (err) {
        console.error("Failed to generate QR code:", err);
      }
    };

    generateQR();

    // Re-generate if dark mode class on <html> changes and colors weren't explicitly provided
    if (!foreground || !background) {
      const observer = new MutationObserver(() => {
        generateQR();
      });
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });
      return () => observer.disconnect();
    }
  }, [data, foreground, background, robustness, margin]);

  return (
    <div
      ref={containerRef}
      data-slot="qr-code"
      className={cn(
        "inline-flex size-32 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-background p-2 text-foreground shadow-xs/5",
        "[&_svg]:size-full [&_svg]:rounded-[inherit]",
        className,
      )}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: "Required for SVG QR code"
      dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
      {...props}
    />
  );
}
