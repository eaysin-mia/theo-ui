"use client";

import { useState } from "react";
import { Badge } from "theoui/components/badge";
import {
  Sortable,
  SortableItem,
  SortableItemHandle,
} from "theoui/components/sortable";
import { toast } from "sonner";
import {
  ImageIcon,
  FileTextIcon,
  MusicIcon,
  VideoIcon,
  GripVerticalIcon,
} from "lucide-react";

interface SortableItem {
  id: string;
  title: string;
  description: string;
  type: "image" | "document" | "audio" | "video";
  size: string;
}

const defaultItems: SortableItem[] = [
  {
    id: "1",
    title: "Product Demo",
    description: "Main product image",
    type: "image",
    size: "2.4 MB",
  },
  {
    id: "2",
    title: "Product Specification",
    description: "Technical details document",
    type: "document",
    size: "1.2 MB",
  },
  {
    id: "3",
    title: "Product Demo Video",
    description: "How to use the product",
    type: "video",
    size: "15.7 MB",
  },
  {
    id: "4",
    title: "Product Audio Guide",
    description: "Audio instructions",
    type: "audio",
    size: "8.3 MB",
  },
  {
    id: "5",
    title: "Product Specification",
    description: "Additional product view",
    type: "image",
    size: "3.1 MB",
  },
];

const getTypeIcon = (type: SortableItem["type"]) => {
  switch (type) {
    case "image":
      return <ImageIcon className="size-4" aria-hidden="true" />;
    case "document":
      return <FileTextIcon className="size-4" aria-hidden="true" />;
    case "audio":
      return <MusicIcon className="size-4" aria-hidden="true" />;
    case "video":
      return <VideoIcon className="size-4" aria-hidden="true" />;
  }
};

const getTypeColor = (
  type: SortableItem["type"],
): React.ComponentProps<typeof Badge>["variant"] => {
  switch (type) {
    case "image":
      return "secondary";
    case "document":
      return "success";
    case "audio":
      return "error";
    case "video":
      return "info";
  }
};

export function Pattern() {
  const [items, setItems] = useState<SortableItem[]>(defaultItems);

  const handleValueChange = (newItems: SortableItem[]) => {
    setItems(newItems);

    // Show toast with new order
    toast.success("Items reordered successfully!", {
      description: newItems
        .map((item, index) => `${index + 1}. ${item.title}`)
        .join(", "),
    });
  };

  const getItemValue = (item: SortableItem) => item.id;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-8 p-6">
      <Sortable
        value={items}
        onValueChange={handleValueChange}
        getItemValue={getItemValue}
        strategy="vertical"
        className="flex flex-col gap-2"
      >
        {items.map((item) => (
          <SortableItem key={item.id} value={item.id}>
            <div className="flex items-center gap-3 rounded-md border bg-background p-3 transition-colors hover:bg-accent/50">
              <SortableItemHandle
                className="text-muted-foreground hover:text-foreground"
                aria-label="Drag to reorder"
              >
                <GripVerticalIcon className="size-4" aria-hidden="true" />
              </SortableItemHandle>

              <div className="flex items-center gap-2 text-muted-foreground">
                {getTypeIcon(item.type)}
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="truncate text-sm font-medium">{item.title}</h4>
                <p className="truncate text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={getTypeColor(item.type)}>{item.type}</Badge>
                <span className="text-xs text-muted-foreground">
                  {item.size}
                </span>
              </div>
            </div>
          </SortableItem>
        ))}
      </Sortable>
    </div>
  );
}
