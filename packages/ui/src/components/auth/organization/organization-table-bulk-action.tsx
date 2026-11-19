"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "theo-ui/components/alert-dialog";
import { Button, buttonVariants } from "theo-ui/components/button";
import { Spinner } from "theo-ui/components/spinner";

export function OrganizationTableBulkAction({
  actionLabel,
  cancelLabel,
  count,
  description,
  disabled,
  isPending,
  onConfirm,
  selectedLabel,
}: {
  actionLabel: string;
  cancelLabel: string;
  count: number;
  description: string;
  disabled?: boolean;
  isPending: boolean;
  onConfirm: () => Promise<void>;
  selectedLabel: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground tabular-nums">
        {selectedLabel.replace("{{count}}", String(count))}
      </span>
      <AlertDialog
        open={open}
        onOpenChange={(nextOpen) => !isPending && setOpen(nextOpen)}
      >
        <AlertDialogTrigger
          className={buttonVariants({ size: "sm", variant: "destructive" })}
          disabled={disabled || count === 0}
        >
          <Trash2 data-icon="inline-start" />
          {actionLabel}
        </AlertDialogTrigger>
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>{actionLabel}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose
              disabled={isPending}
              render={<Button variant="ghost">{cancelLabel}</Button>}
            />
            <Button
              disabled={isPending}
              onClick={async () => {
                await onConfirm();
                setOpen(false);
              }}
              variant="destructive"
            >
              {isPending && <Spinner data-icon="inline-start" />}
              {actionLabel}
            </Button>
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>
    </div>
  );
}
