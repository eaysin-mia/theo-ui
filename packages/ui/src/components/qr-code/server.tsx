import QR from "qrcode";
import type React from "react";
import { formatHex } from "culori";
import { cn } from "@workspace/ui/lib/utils";

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

export async function QRCode({
  data,
  foreground = "#000000",
  background = "#ffffff",
  robustness = "M",
  margin = 0,
  className,
  ...props
}: QRCodeProps) {
  const darkHex = resolveColorToHex(foreground, "#000000");
  const lightHex = resolveColorToHex(background, "#ffffff");

  const svg = await QR.toString(data, {
    type: "svg",
    color: {
      dark: darkHex,
      light: lightHex,
    },
    width: 200,
    errorCorrectionLevel: robustness,
    margin,
  });

  if (!svg) {
    throw new Error("Failed to generate QR code");
  }

  return (
    <div
      data-slot="qr-code"
      className={cn(
        "inline-flex size-32 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-background p-2 text-foreground shadow-xs/5",
        "[&_svg]:size-full [&_svg]:rounded-[inherit]",
        className,
      )}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: "Required for SVG QR code"
      dangerouslySetInnerHTML={{ __html: svg }}
      {...props}
    />
  );
}
