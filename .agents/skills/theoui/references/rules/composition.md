# Composition Rules (theoui)

Use this when composing complex UI and overlays from `theoui` primitives.

## Base UI `render` Prop Composition

Base UI does not use the Radix `asChild` cloneElement pattern. Instead, elements delegate rendering via the polymorphic `render` prop:

```tsx
// Link as a Button
import Link from "next/link";
import { Button } from "theoui";

export function NavLink() {
  return (
    <Button variant="outline" render={<Link href="/analytics" />}>
      Analytics
    </Button>
  );
}

// Custom trigger for a Dialog
<DialogTrigger render={<Button variant="default" size="lg" />}>
  Open Modal
</DialogTrigger>
```

---

## Trigger + Popup Hierarchy

For overlay primitives (`Dialog`, `AlertDialog`, `Drawer`, `Menu`, `Select`, `Popover`, `Tooltip`), maintain the complete semantic part hierarchy:

### Dialog Example
```tsx
import {
  Dialog,
  DialogTrigger,
  DialogPopup,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogPanel,
  DialogFooter,
  DialogClose,
  Button,
} from "theoui";

export function ConfirmModal() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>
        Confirm Action
      </DialogTrigger>
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your account.
          </DialogDescription>
        </DialogHeader>
        <DialogPanel>
          <p className="text-sm text-muted-foreground">Additional details here.</p>
        </DialogPanel>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
          <Button variant="destructive">Confirm</Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}
```

### Drawer (Replaces Sheet)
Always use `Drawer` for slide-over side panels on mobile and desktop:
```tsx
import {
  Drawer,
  DrawerTrigger,
  DrawerPopup,
  DrawerHeader,
  DrawerTitle,
  DrawerPanel,
  Button,
} from "theoui";

export function NavigationDrawer() {
  return (
    <Drawer>
      <DrawerTrigger render={<Button variant="outline" />}>Menu</DrawerTrigger>
      <DrawerPopup>
        <DrawerHeader>
          <DrawerTitle>Navigation</DrawerTitle>
        </DrawerHeader>
        <DrawerPanel>
          <nav className="flex flex-col gap-2">...</nav>
        </DrawerPanel>
      </DrawerPopup>
    </Drawer>
  );
}
```

---

## Anti-patterns
- Using `asChild` on any `theoui` component (will be ignored or throw runtime warnings).
- Using `Sheet` instead of `Drawer`.
- Omitting required accessibility titles (`DialogTitle`, `DrawerTitle`) inside popups.
