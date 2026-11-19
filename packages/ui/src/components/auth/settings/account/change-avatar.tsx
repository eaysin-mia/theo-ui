"use client";

import { fileToAvatarDataUrl } from "@better-auth-ui/core";
import { useAuth, useSession, useUpdateUser } from "@better-auth-ui/react";
import { Trash2, Upload } from "lucide-react";
import { type ChangeEvent, useRef, useState } from "react";
import { toastManager } from "@theo/ui/components/toast";
import { UserAvatar } from "@theo/ui/components/auth/user/user-avatar";
import { Button, buttonVariants } from "@theo/ui/components/button";
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuTrigger,
} from "@theo/ui/components/menu";
import { Field, FieldLabel } from "@theo/ui/components/field";
import { Spinner } from "@theo/ui/components/spinner";
import { cn } from "@theo/ui/lib/utils";

export type ChangeAvatarProps = {
  className?: string;
};

/**
 * Avatar management component with file upload and removal.
 *
 * Built with Coss UI Menu primitives.
 */
export function ChangeAvatar({ className }: ChangeAvatarProps) {
  const { authClient, localization, avatar } = useAuth();
  const { data: session } = useSession(authClient);

  const { mutate: updateUser, isPending: updatePending } =
    useUpdateUser(authClient);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isPending = updatePending || isUploading || isDeleting;

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = "";

    setIsUploading(true);

    try {
      const resized =
        (await avatar.resize?.(file, avatar.size, avatar.extension)) || file;

      const image =
        (await avatar.upload?.(resized)) ||
        (await fileToAvatarDataUrl(resized));

      updateUser(
        { image },
        {
          onSuccess: () =>
            toastManager.add({
              type: "success",
              title: localization.settings.avatarChangedSuccess,
            }),
        },
      );
    } catch (error) {
      console.error("[Better Auth UI] Image operation failed", error);
      toastManager.add({
        type: "error",
        title: localization.errors.imageUploadFailed,
      });
    }

    setIsUploading(false);
  }

  async function handleDelete() {
    const currentImage = session?.user.image;

    updateUser(
      { image: null },
      {
        onSuccess: async () => {
          if (currentImage) {
            setIsDeleting(true);
            try {
              await avatar.delete?.(currentImage);
            } finally {
              setIsDeleting(false);
            }
          }

          toastManager.add({
            type: "success",
            title: localization.settings.avatarDeletedSuccess,
          });
        },
      },
    );
  }

  return (
    <Field className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="ghost"
          className="h-auto w-auto rounded-full p-0"
          disabled={isPending}
          onClick={() => fileInputRef.current?.click()}
        >
          <UserAvatar className="size-12" isPending={isPending} />
        </Button>

        <Menu>
          <MenuTrigger
            className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
            disabled={!session || isPending}
          >
            {isPending && <Spinner />}

            {localization.settings.changeAvatar}
          </MenuTrigger>

          <MenuPopup className="min-w-fit">
            <MenuItem onClick={() => fileInputRef.current?.click()}>
              <Upload aria-hidden="true" className="text-muted-foreground" />

              {localization.settings.uploadAvatar}
            </MenuItem>

            <MenuItem
              variant="destructive"
              disabled={!session?.user.image}
              onClick={handleDelete}
            >
              <Trash2 aria-hidden="true" />

              {localization.settings.deleteAvatar}
            </MenuItem>
          </MenuPopup>
        </Menu>
      </div>
    </Field>
  );
}
