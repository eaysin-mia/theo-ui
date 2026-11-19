"use client";

import { createContext, useContext } from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { ItemInstance, TreeInstance } from "@headless-tree/core";

import { cn } from "@theo/ui/lib/utils";
import { MinusIcon, PlusIcon, ChevronDownIcon } from "lucide-react";

type ToggleIconType = "chevron" | "plus-minus";

interface TreeContextValue<T = any> {
  indent: number;
  currentItem?: ItemInstance<T>;
  tree?: TreeInstance<T>;
  toggleIconType?: ToggleIconType;
}

const TreeContext = createContext<TreeContextValue<any>>({
  indent: 20,
  currentItem: undefined,
  tree: undefined,
  toggleIconType: "plus-minus",
});

function useTreeContext<T = any>() {
  return useContext(TreeContext) as TreeContextValue<T>;
}

interface TreeProps<T = any> extends useRender.ComponentProps<"div"> {
  indent?: number;
  tree?: TreeInstance<T>;
  toggleIconType?: ToggleIconType;
}

function Tree<T = any>({
  indent = 20,
  tree,
  className,
  toggleIconType = "chevron",
  render,
  ...props
}: TreeProps<T>) {
  const containerProps =
    tree && typeof tree.getContainerProps === "function"
      ? tree.getContainerProps()
      : {};
  const mergedProps = mergeProps<"div">(props, containerProps);

  const { style: propStyle, ...otherProps } = mergedProps;

  const mergedStyle = {
    ...propStyle,
    "--tree-indent": `${indent}px`,
  } as React.CSSProperties;

  const defaultProps = {
    "data-slot": "tree",
    style: mergedStyle,
    className: cn("flex flex-col", className),
  };

  return (
    <TreeContext.Provider value={{ indent, tree, toggleIconType }}>
      {useRender({
        defaultTagName: "div",
        render,
        props: mergeProps<"div">(defaultProps, otherProps),
      })}
    </TreeContext.Provider>
  );
}

interface TreeItemProps<T = any> extends Omit<
  useRender.ComponentProps<"button">,
  "indent"
> {
  item: ItemInstance<T>;
  indent?: number;
}

function TreeItem<T = any>({
  item,
  className,
  render,
  children,
  ...props
}: TreeItemProps<T>) {
  const parentContext = useTreeContext<T>();
  const { indent } = parentContext;

  const itemProps = typeof item.getProps === "function" ? item.getProps() : {};
  const mergedProps = { ...props, children, ...itemProps };

  // Extract style from mergedProps to merge with our custom styles
  const { style: propStyle, ...otherProps } = mergedProps;

  // Merge styles
  const mergedStyle = {
    ...propStyle,
    "--tree-padding": `${item.getItemMeta().level * indent}px`,
  } as React.CSSProperties;

  const defaultProps = {
    "data-slot": "tree-item",
    style: mergedStyle,
    className: cn(
      "z-10 ps-(--tree-padding) outline-hidden select-none not-last:pb-0.5 focus:z-20 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    ),
    "data-focus":
      typeof item.isFocused === "function"
        ? item.isFocused() || false
        : undefined,
    "data-folder":
      typeof item.isFolder === "function"
        ? item.isFolder() || false
        : undefined,
    "data-selected":
      typeof item.isSelected === "function"
        ? item.isSelected() || false
        : undefined,
    "data-drag-target":
      typeof item.isDragTarget === "function"
        ? item.isDragTarget() || false
        : undefined,
    "data-search-match":
      typeof item.isMatchingSearch === "function"
        ? item.isMatchingSearch() || false
        : undefined,
    "aria-expanded": item.isExpanded(),
  };

  return (
    <TreeContext.Provider value={{ ...parentContext, currentItem: item }}>
      {useRender({
        defaultTagName: "button",
        render,
        props: mergeProps<"button">(defaultProps, otherProps),
      })}
    </TreeContext.Provider>
  );
}

interface TreeItemLabelProps<T = any> extends useRender.ComponentProps<"span"> {
  item?: ItemInstance<T>;
}

function TreeItemLabel<T = any>({
  item: propItem,
  children,
  className,
  render,
  ...props
}: TreeItemLabelProps<T>) {
  const { currentItem, toggleIconType } = useTreeContext<T>();
  const item = propItem || currentItem;

  if (!item) {
    console.warn("TreeItemLabel: No item provided via props or context");
    return null;
  }

  const defaultProps = {
    "data-slot": "tree-item-label",
    className: cn(
      "flex items-center gap-1 rounded-md bg-background px-2 py-1.5 text-sm transition-colors not-in-data-[folder=true]:ps-7 hover:bg-accent in-focus-visible:ring-[3px] in-focus-visible:ring-ring/50 in-data-[drag-target=true]:bg-accent in-data-[search-match=true]:bg-accent! in-data-[selected=true]:bg-accent in-data-[selected=true]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0",
      className,
    ),
    children: (
      <>
        {item.isFolder() &&
          (toggleIconType === "plus-minus" ? (
            item.isExpanded() ? (
              <MinusIcon
                aria-hidden="true"
                className="size-3.5 text-muted-foreground"
                stroke="currentColor"
                strokeWidth="1"
              />
            ) : (
              <PlusIcon
                aria-hidden="true"
                className="size-3.5 text-muted-foreground"
                stroke="currentColor"
                strokeWidth="1"
              />
            )
          ) : (
            <ChevronDownIcon
              aria-hidden="true"
              className="size-4 text-muted-foreground in-aria-[expanded=false]:-rotate-90"
            />
          ))}
        {children ||
          (typeof item.getItemName === "function" ? item.getItemName() : null)}
      </>
    ),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

interface TreeDragLineProps extends useRender.ComponentProps<"div"> {}

function TreeDragLine({
  className,
  render,
  style,
  ...props
}: TreeDragLineProps) {
  const { tree } = useTreeContext();

  if (!tree || typeof tree.getDragLineStyle !== "function") {
    console.warn(
      "TreeDragLine: No tree provided via context or tree does not have getDragLineStyle method",
    );
    return null;
  }

  const dragLine = tree.getDragLineStyle();
  const defaultProps = {
    "data-slot": "tree-drag-line",
    style: { ...dragLine, ...style },
    className: cn(
      "absolute z-30 -mt-px h-0.5 w-[unset] bg-primary before:absolute before:start-0 before:-top-[3px] before:size-2 before:rounded-full before:border-2 before:border-primary before:bg-background",
      className,
    ),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export { Tree, TreeItem, TreeItemLabel, TreeDragLine };
