"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";

import { AutoHeight } from "@theo/ui/components/auto-height";
import { Button } from "@theo/ui/components/button";

const SHORT =
  "Animate UI is a set of animated primitives for React, built with Motion.";

const LONG = [
  "Animate UI is a set of animated primitives for React, built with Motion.",
  "Swap the import of your Radix UI, Base UI or React Aria primitives and your components animate, with exactly the same API.",
  "Its own primitives, like this one, cover the effects those libraries don't have.",
];

const swap = {
  initial: { opacity: 0, filter: "blur(4px)" },
  animate: { opacity: 1, filter: "blur(0px)" },
  exit: { opacity: 0, filter: "blur(4px)" },
  transition: { duration: 0.3, ease: "easeInOut" },
} as const;

export function AutoHeightDemo() {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className="flex w-full max-w-sm flex-col items-start gap-4">
      <AutoHeight
        deps={[expanded]}
        className="w-full rounded-xl border bg-card p-4 text-sm shadow-xs"
      >
        <AnimatePresence mode="wait" initial={false}>
          {expanded ? (
            <motion.div key="long" className="flex flex-col gap-2" {...swap}>
              {LONG.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </motion.div>
          ) : (
            <motion.p key="short" {...swap}>
              {SHORT}
            </motion.p>
          )}
        </AnimatePresence>
      </AutoHeight>
      <Button
        variant="outline"
        size="sm"
        aria-expanded={expanded}
        onClick={() => setExpanded((value) => !value)}
      >
        {expanded ? "Show less" : "Show more"}
      </Button>
    </div>
  );
}
