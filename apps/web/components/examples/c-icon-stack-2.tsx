import { IconStack } from "theo-ui/components/icon-stack";
import { ArchiveIcon, PackageIcon, LayersIcon } from "lucide-react";

const sizes = [
  {
    label: "Small",
    size: "sm" as const,
    icon: <ArchiveIcon className="size-3.5" />,
  },
  {
    label: "Default",
    size: "default" as const,
    icon: <PackageIcon className="size-4" />,
  },
  {
    label: "Large",
    size: "lg" as const,
    icon: <LayersIcon className="size-6" />,
  },
];

export function Pattern() {
  return (
    <div className="flex flex-wrap items-end justify-center gap-8">
      {sizes.map((item) => (
        <div key={item.label} className="flex flex-col items-center gap-2">
          <IconStack aria-hidden="true" size={item.size}>
            {item.icon}
          </IconStack>
          <span className="text-sm text-muted-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
