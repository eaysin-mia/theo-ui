"use client";

import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "theoui/components/alert-dialog";
import { Button } from "theoui/components/button";
import { Spinner } from "theoui/components/spinner";

export type RemovePhoneNumberDialogProps = {
  description: string;
  isPending: boolean;
  label: string;
  title: string;
  cancelLabel: string;
  onConfirm: () => void;
};

/** Confirm removal because it can disable a sign-in and recovery method. */
export function RemovePhoneNumberDialog({
  cancelLabel,
  description,
  isPending,
  label,
  onConfirm,
  title,
}: RemovePhoneNumberDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isPending}
          />
        }
      >
        {label}
      </AlertDialogTrigger>
      <AlertDialogPopup>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogClose
            disabled={isPending}
            render={<Button variant="ghost">{cancelLabel}</Button>}
          />
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending && <Spinner />}
            {label}
          </Button>
        </AlertDialogFooter>
      </AlertDialogPopup>
    </AlertDialog>
  );
}
