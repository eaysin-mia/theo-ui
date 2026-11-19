"use client";

import type { CSSProperties, ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type {
  CollisionDetection,
  DragCancelEvent,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DropAnimation,
  Modifiers,
  UniqueIdentifier,
} from "@dnd-kit/core";
import {
  closestCenter,
  defaultDropAnimationSideEffects,
  DndContext,
  DragOverlay,
  getFirstCollision,
  KeyboardSensor,
  MeasuringStrategy,
  MouseSensor,
  pointerWithin,
  rectIntersection,
  TouchSensor,
  useSensor,
  useSensors,
  type DraggableAttributes,
  type DraggableSyntheticListeners,
} from "@dnd-kit/core";
import {
  arrayMove,
  defaultAnimateLayoutChanges,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  type AnimateLayoutChanges,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createPortal } from "react-dom";
import { cn } from "@theo/ui/lib/utils";

interface KanbanContextProps<T> {
  columns: Record<string, T[]>;
  setColumns: (columns: Record<string, T[]>) => void;
  getItemId: (item: T) => string;
  columnIds: string[];
  activeId: UniqueIdentifier | null;
  setActiveId: (id: UniqueIdentifier | null) => void;
  findContainer: (id: UniqueIdentifier) => string | undefined;
  isColumn: (id: UniqueIdentifier) => boolean;
  modifiers?: Modifiers;
}

// Internal unexported transport carrier for generic kanban context
const KanbanContext = createContext<KanbanContextProps<any> | null>(null);

function useKanban<T = unknown>(): KanbanContextProps<T> {
  const context = useContext(KanbanContext);
  if (!context) {
    throw new Error("useKanban must be used within a <Kanban /> provider");
  }
  return context;
}

interface ColumnContextProps {
  attributes?: DraggableAttributes;
  listeners?: DraggableSyntheticListeners;
  isDragging?: boolean;
  disabled?: boolean;
}

const ColumnContext = createContext<ColumnContextProps>({
  attributes: undefined,
  listeners: undefined,
  isDragging: false,
  disabled: false,
});

interface ItemContextProps {
  listeners?: DraggableSyntheticListeners;
  isDragging?: boolean;
  disabled?: boolean;
}

const ItemContext = createContext<ItemContextProps>({
  listeners: undefined,
  isDragging: false,
  disabled: false,
});

const IsOverlayContext = createContext(false);

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true });

const dropAnimationConfig: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.4",
      },
    },
  }),
};

const subscribeToNothing = () => () => {};
const getIsMounted = () => true;
const getIsMountedOnServer = () => false;

const MOUSE_SENSOR_OPTIONS = { activationConstraint: { distance: 10 } };
const TOUCH_SENSOR_OPTIONS = {
  activationConstraint: { delay: 250, tolerance: 5 },
};
const KEYBOARD_SENSOR_OPTIONS = {
  coordinateGetter: sortableKeyboardCoordinates,
};
const MEASURING_CONFIG = {
  droppable: { strategy: MeasuringStrategy.Always },
};

export interface KanbanMoveEvent {
  event: DragEndEvent;
  activeContainer: string;
  activeIndex: number;
  overContainer: string;
  overIndex: number;
}

export interface KanbanCommitMeta<T> {
  kind: "item" | "column";
  event: DragEndEvent;
  activeContainer: string;
  activeIndex: number;
  overContainer: string;
  overIndex: number;
  previousValue: Record<string, T[]>;
}

export interface KanbanRootProps<T> extends Omit<
  useRender.ComponentProps<"div">,
  "children" | "onDragStart" | "onDragEnd"
> {
  value: Record<string, T[]>;
  onValueChange: (value: Record<string, T[]>) => void;
  getItemValue: (item: T) => string;
  children: ReactNode;
  onMove?: (event: KanbanMoveEvent) => void;
  onValueCommit?: (
    value: Record<string, T[]>,
    meta: KanbanCommitMeta<T>,
  ) => void;
  restoreOnCancel?: boolean;
  onDragStart?: (event: DragStartEvent) => void;
  onDragEnd?: (event: DragEndEvent) => void;
  onDragCancel?: (event: DragCancelEvent) => void;
  accessibility?: React.ComponentProps<typeof DndContext>["accessibility"];
  modifiers?: Modifiers;
}

function Kanban<T>({
  value,
  onValueChange,
  getItemValue,
  children,
  className,
  render,
  onMove,
  onValueCommit,
  restoreOnCancel = false,
  onDragStart,
  onDragEnd,
  onDragCancel,
  accessibility,
  modifiers,
  ...props
}: KanbanRootProps<T>) {
  const columns = value;
  const setColumns = onValueChange;
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const valueRef = useRef(value);
  const getItemValueRef = useRef(getItemValue);
  useLayoutEffect(() => {
    valueRef.current = value;
    getItemValueRef.current = getItemValue;
  });

  const dragOriginRef = useRef<{
    value: Record<string, T[]>;
    container: string | undefined;
    index: number;
  } | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, MOUSE_SENSOR_OPTIONS),
    useSensor(TouchSensor, TOUCH_SENSOR_OPTIONS),
    useSensor(KeyboardSensor, KEYBOARD_SENSOR_OPTIONS),
  );

  const columnIds = useMemo(() => {
    const keys = Object.keys(columns);
    if (process.env.NODE_ENV !== "production") {
      const seen = new Set<string>();
      for (const key of keys) {
        const items = columns[key];
        if (!items) continue;
        for (const item of items) {
          const itemId = getItemValue(item);
          if (seen.has(itemId)) {
            console.warn(
              `[Kanban] Duplicate item id "${itemId}". Item ids must be unique across all columns, or drag and drop will misbehave.`,
            );
            break;
          }
          seen.add(itemId);
        }
      }
    }
    return keys;
  }, [columns, getItemValue]);

  const isColumn = useCallback(
    (id: UniqueIdentifier) => columnIds.includes(String(id)),
    [columnIds],
  );

  const findContainer = useCallback(
    (id: UniqueIdentifier) => {
      const strId = String(id);
      if (isColumn(id)) return strId;
      return columnIds.find((key) => {
        const items = columns[key];
        return items
          ? items.some((item) => getItemValue(item) === strId)
          : false;
      });
    },
    [columns, columnIds, getItemValue, isColumn],
  );

  const lastOverIdRef = useRef<UniqueIdentifier | null>(null);
  const collisionDetection = useCallback<CollisionDetection>(
    (args) => {
      if (isColumn(args.active.id)) {
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter((container) =>
            isColumn(container.id),
          ),
        });
      }

      if (!args.pointerCoordinates) return rectIntersection(args);

      let overId = getFirstCollision(pointerWithin(args), "id");
      if (overId != null) {
        if (isColumn(overId)) {
          const colItems = columns[String(overId)];
          const itemIds = new Set(colItems ? colItems.map(getItemValue) : []);
          overId =
            closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                (container) => itemIds.has(String(container.id)),
              ),
            })[0]?.id ?? overId;
        }
        lastOverIdRef.current = overId;
        return [{ id: overId }];
      }

      return lastOverIdRef.current != null
        ? [{ id: lastOverIdRef.current }]
        : rectIntersection(args);
    },
    [columns, getItemValue, isColumn],
  );

  const commitChange = useCallback(
    (
      finalValue: Record<string, T[]>,
      event: DragEndEvent,
      kind: "item" | "column",
    ) => {
      if (!onValueCommit) return;
      const origin = dragOriginRef.current;
      if (!origin) return;

      const id = event.active.id;
      const strId = String(id);

      if (kind === "column") {
        const keys = Object.keys(finalValue);
        const overIndex = keys.indexOf(strId);
        if (overIndex === -1 || overIndex === origin.index) return;
        onValueCommit(finalValue, {
          kind: "column",
          event,
          activeContainer: strId,
          activeIndex: origin.index,
          overContainer: String(event.over?.id ?? id),
          overIndex,
          previousValue: origin.value,
        });
        return;
      }

      const getId = getItemValueRef.current;
      let overContainer: string | undefined;
      let overIndex = -1;
      for (const key of Object.keys(finalValue)) {
        const list = finalValue[key];
        if (!list) continue;
        const found = list.findIndex((item) => getId(item) === strId);
        if (found !== -1) {
          overContainer = key;
          overIndex = found;
          break;
        }
      }
      if (overContainer === undefined) return;
      if (overContainer === origin.container && overIndex === origin.index) {
        return;
      }
      onValueCommit(finalValue, {
        kind: "item",
        event,
        activeContainer: origin.container ?? overContainer,
        activeIndex: origin.index,
        overContainer,
        overIndex,
        previousValue: origin.value,
      });
    },
    [onValueCommit],
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      lastOverIdRef.current = null;
      setActiveId(event.active.id);
      onDragStart?.(event);

      if (onValueCommit || restoreOnCancel) {
        const snapshot = valueRef.current;
        const id = event.active.id;
        const strId = String(id);
        const keys = Object.keys(snapshot);
        if (keys.includes(strId)) {
          dragOriginRef.current = {
            value: snapshot,
            container: strId,
            index: keys.indexOf(strId),
          };
        } else {
          const getId = getItemValueRef.current;
          let container: string | undefined;
          let index = -1;
          for (const key of keys) {
            const list = snapshot[key];
            if (!list) continue;
            const found = list.findIndex((item) => getId(item) === strId);
            if (found !== -1) {
              container = key;
              index = found;
              break;
            }
          }
          dragOriginRef.current = { value: snapshot, container, index };
        }
      }
    },
    [onDragStart, onValueCommit, restoreOnCancel],
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      if (onMove) {
        return;
      }

      const { active, over } = event;
      if (!over) return;
      if (isColumn(active.id)) return;

      const activeContainer = findContainer(active.id);
      const overContainer = findContainer(over.id);

      if (!activeContainer || !overContainer) {
        return;
      }

      const activeItems = columns[activeContainer];
      const overItems = columns[overContainer];
      if (!activeItems || !overItems) return;

      const activeStrId = String(active.id);
      const overStrId = String(over.id);

      if (activeContainer !== overContainer) {
        const activeIndex = activeItems.findIndex(
          (item: T) => getItemValue(item) === activeStrId,
        );
        if (activeIndex === -1) return;

        let overIndex = overItems.findIndex(
          (item: T) => getItemValue(item) === overStrId,
        );

        if (isColumn(over.id) || overIndex === -1) {
          overIndex = overItems.length;
        }

        const newActiveItems = [...activeItems];
        const newOverItems = [...overItems];
        const [movedItem] = newActiveItems.splice(activeIndex, 1);
        if (movedItem !== undefined) {
          newOverItems.splice(overIndex, 0, movedItem);
          setColumns({
            ...columns,
            [activeContainer]: newActiveItems,
            [overContainer]: newOverItems,
          });
        }
      } else {
        const activeIndex = activeItems.findIndex(
          (item: T) => getItemValue(item) === activeStrId,
        );
        const overIndex = activeItems.findIndex(
          (item: T) => getItemValue(item) === overStrId,
        );

        if (
          activeIndex !== -1 &&
          overIndex !== -1 &&
          activeIndex !== overIndex
        ) {
          setColumns({
            ...columns,
            [activeContainer]: arrayMove(activeItems, activeIndex, overIndex),
          });
        }
      }
    },
    [findContainer, getItemValue, isColumn, setColumns, columns, onMove],
  );

  const handleDragCancel = useCallback(
    (event: DragCancelEvent) => {
      const origin = dragOriginRef.current;

      if (restoreOnCancel && origin && !onMove) {
        setColumns(origin.value);
      } else if (onValueCommit && origin && !onMove) {
        commitChange(valueRef.current, event, "item");
      }

      dragOriginRef.current = null;
      lastOverIdRef.current = null;
      setActiveId(null);
      onDragCancel?.(event);
    },
    [
      restoreOnCancel,
      onMove,
      onValueCommit,
      setColumns,
      onDragCancel,
      commitChange,
    ],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      lastOverIdRef.current = null;
      setActiveId(null);
      onDragEnd?.(event);

      if (!over) {
        commitChange(valueRef.current, event, "item");
        dragOriginRef.current = null;
        return;
      }

      if (onMove && !isColumn(active.id)) {
        const activeContainer = findContainer(active.id);
        const overContainer = findContainer(over.id);

        if (activeContainer && overContainer) {
          const activeList = columns[activeContainer];
          const overList = columns[overContainer];
          if (activeList && overList) {
            const activeStrId = String(active.id);
            const overStrId = String(over.id);
            const activeIndex = activeList.findIndex(
              (item: T) => getItemValue(item) === activeStrId,
            );
            const overIndex = isColumn(over.id)
              ? overList.length
              : overList.findIndex(
                  (item: T) => getItemValue(item) === overStrId,
                );

            onMove({
              event,
              activeContainer,
              activeIndex,
              overContainer,
              overIndex,
            });
          }
        }
        dragOriginRef.current = null;
        return;
      }

      if (isColumn(active.id) && isColumn(over.id)) {
        const activeStr = String(active.id);
        const overStr = String(over.id);
        const activeIndex = columnIds.indexOf(activeStr);
        const overIndex = columnIds.indexOf(overStr);
        if (
          activeIndex !== -1 &&
          overIndex !== -1 &&
          activeIndex !== overIndex
        ) {
          const newOrder = arrayMove(
            Object.keys(columns),
            activeIndex,
            overIndex,
          );
          const newColumns: Record<string, T[]> = {};
          for (const key of newOrder) {
            const col = columns[key];
            if (col) newColumns[key] = col;
          }
          setColumns(newColumns);
          commitChange(newColumns, event, "column");
        }
        dragOriginRef.current = null;
        return;
      }

      if (isColumn(active.id)) {
        dragOriginRef.current = null;
        return;
      }

      // Cross-column and same-column moves are applied live during dragOver,
      // so the current columns state is already final.
      commitChange(columns, event, "item");
      dragOriginRef.current = null;
    },
    [
      columnIds,
      columns,
      findContainer,
      getItemValue,
      isColumn,
      setColumns,
      onMove,
      onDragEnd,
      commitChange,
    ],
  );

  const contextValue = useMemo(
    () => ({
      columns,
      setColumns,
      getItemId: getItemValue,
      columnIds,
      activeId,
      setActiveId,
      findContainer,
      isColumn,
      modifiers,
    }),
    [
      columns,
      setColumns,
      getItemValue,
      columnIds,
      activeId,
      findContainer,
      isColumn,
      modifiers,
    ],
  );

  const defaultProps = {
    "data-slot": "kanban",
    "data-dragging": activeId !== null || undefined,
    className: cn(activeId !== null && "cursor-grabbing!", className),
    children,
  };

  return (
    <KanbanContext.Provider value={contextValue}>
      <DndContext
        sensors={sensors}
        modifiers={modifiers}
        accessibility={accessibility}
        measuring={MEASURING_CONFIG}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {useRender({
          defaultTagName: "div",
          render,
          props: mergeProps<"div">(defaultProps, props),
        })}
      </DndContext>
    </KanbanContext.Provider>
  );
}

export type KanbanBoardProps = useRender.ComponentProps<"div">;

function KanbanBoard({ className, render, ...props }: KanbanBoardProps) {
  const { columnIds } = useKanban();

  const defaultProps = {
    "data-slot": "kanban-board",
    className: cn("grid auto-rows-fr gap-4 sm:grid-cols-3", className),
    children: props.children,
  };

  return (
    <SortableContext items={columnIds} strategy={rectSortingStrategy}>
      {useRender({
        defaultTagName: "div",
        render,
        props: mergeProps<"div">(defaultProps, props),
      })}
    </SortableContext>
  );
}

export interface KanbanColumnProps extends useRender.ComponentProps<"div"> {
  value: string;
  disabled?: boolean;
}

function KanbanColumn({
  value,
  className,
  render,
  disabled,
  ...props
}: KanbanColumnProps) {
  const isOverlay = useContext(IsOverlayContext);

  const {
    setNodeRef,
    transform,
    transition,
    attributes,
    listeners,
    isDragging: isSortableDragging,
  } = useSortable({
    id: value,
    disabled: disabled || isOverlay,
    animateLayoutChanges,
  });

  const { activeId, isColumn } = useKanban();
  const isColumnDragging = activeId ? isColumn(activeId) : false;

  const style: CSSProperties = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const defaultProps = isOverlay
    ? {
        "data-slot": "kanban-column",
        "data-value": value,
        "data-dragging": true,
        className: cn("flex flex-col", className),
        children: props.children,
      }
    : {
        "data-slot": "kanban-column",
        "data-value": value,
        "data-dragging": isSortableDragging || undefined,
        "data-disabled": disabled || undefined,
        ref: setNodeRef,
        style,
        className: cn(
          "flex flex-col",
          isSortableDragging && "z-50 opacity-50",
          disabled && "pointer-events-none opacity-50",
          className,
        ),
        children: props.children,
      };

  return (
    <ColumnContext.Provider
      value={
        isOverlay
          ? {
              attributes: undefined,
              listeners: undefined,
              isDragging: true,
              disabled: false,
            }
          : { attributes, listeners, isDragging: isColumnDragging, disabled }
      }
    >
      {useRender({
        defaultTagName: "div",
        render,
        props: mergeProps<"div">(defaultProps, props),
      })}
    </ColumnContext.Provider>
  );
}

export interface KanbanColumnHandleProps extends useRender.ComponentProps<"div"> {
  cursor?: boolean;
}

function KanbanColumnHandle({
  className,
  render,
  cursor = true,
  ...props
}: KanbanColumnHandleProps) {
  const { attributes, listeners, isDragging, disabled } =
    useContext(ColumnContext);

  const defaultProps = {
    "data-slot": "kanban-column-handle",
    "data-dragging": isDragging || undefined,
    "data-disabled": disabled || undefined,
    ...attributes,
    ...listeners,
    className: cn(
      "opacity-0 transition-opacity focus-visible:opacity-100 in-[[data-slot=kanban-column]:hover]:opacity-100 has-focus-visible:opacity-100",
      cursor && (isDragging ? "cursor-grabbing!" : "cursor-grab!"),
      className,
    ),
    children: props.children,
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export interface KanbanItemProps extends useRender.ComponentProps<"div"> {
  value: string;
  disabled?: boolean;
}

function KanbanItem({
  value,
  className,
  render,
  disabled,
  ...props
}: KanbanItemProps) {
  const isOverlay = useContext(IsOverlayContext);

  const {
    setNodeRef,
    transform,
    transition,
    attributes,
    listeners,
    isDragging: isSortableDragging,
  } = useSortable({
    id: value,
    disabled: disabled || isOverlay,
    animateLayoutChanges,
  });

  const { activeId, isColumn } = useKanban();
  const isItemDragging = activeId ? !isColumn(activeId) : false;

  const style: CSSProperties = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const defaultProps = isOverlay
    ? {
        "data-slot": "kanban-item",
        "data-value": value,
        "data-dragging": true,
        className: cn(className),
        children: props.children,
      }
    : {
        "data-slot": "kanban-item",
        "data-value": value,
        "data-dragging": isSortableDragging || undefined,
        "data-disabled": disabled || undefined,
        ref: setNodeRef,
        style,
        ...attributes,
        className: cn(
          isSortableDragging && "z-50 opacity-50",
          disabled && "pointer-events-none opacity-50",
          className,
        ),
        children: props.children,
      };

  return (
    <ItemContext.Provider
      value={
        isOverlay
          ? { listeners: undefined, isDragging: true, disabled: false }
          : { listeners, isDragging: isItemDragging, disabled }
      }
    >
      {useRender({
        defaultTagName: "div",
        render,
        props: mergeProps<"div">(defaultProps, props),
      })}
    </ItemContext.Provider>
  );
}

export interface KanbanItemHandleProps extends useRender.ComponentProps<"div"> {
  cursor?: boolean;
}

function KanbanItemHandle({
  className,
  render,
  cursor = true,
  ...props
}: KanbanItemHandleProps) {
  const { listeners, isDragging, disabled } = useContext(ItemContext);

  const defaultProps = {
    "data-slot": "kanban-item-handle",
    "data-dragging": isDragging || undefined,
    "data-disabled": disabled || undefined,
    ...listeners,
    className: cn(
      cursor && (isDragging ? "cursor-grabbing!" : "cursor-grab!"),
      className,
    ),
    children: props.children,
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export interface KanbanColumnContentProps extends useRender.ComponentProps<"div"> {
  value: string;
}

function KanbanColumnContent({
  value,
  className,
  render,
  ...props
}: KanbanColumnContentProps) {
  const { columns, getItemId } = useKanban();

  const itemIds = useMemo(() => {
    const items = columns[value];
    if (!items) {
      throw new Error(
        `KanbanColumnContent: column "${value}" was not found in the Kanban value. ` +
          `Available columns: ${Object.keys(columns).join(", ") || "(none)"}.`,
      );
    }
    return items.map(getItemId);
  }, [columns, getItemId, value]);

  const defaultProps = {
    "data-slot": "kanban-column-content",
    className: cn("flex flex-col gap-2", className),
    children: props.children,
  };

  return (
    <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
      {useRender({
        defaultTagName: "div",
        render,
        props: mergeProps<"div">(defaultProps, props),
      })}
    </SortableContext>
  );
}

export interface KanbanOverlayProps extends Omit<
  React.ComponentProps<typeof DragOverlay>,
  "children"
> {
  children?:
    | ReactNode
    | ((params: {
        value: UniqueIdentifier;
        variant: "column" | "item";
      }) => ReactNode);
}

function KanbanOverlay({ children, className, ...props }: KanbanOverlayProps) {
  const { activeId, isColumn, modifiers } = useKanban();
  const mounted = useSyncExternalStore(
    subscribeToNothing,
    getIsMounted,
    getIsMountedOnServer,
  );

  const [activeItem, setActiveItem] = useState<{
    id: UniqueIdentifier;
    variant: "column" | "item";
  } | null>(null);

  useLayoutEffect(() => {
    if (activeId != null) {
      setActiveItem({
        id: activeId,
        variant: isColumn(activeId) ? "column" : "item",
      });
    }
  }, [activeId, isColumn]);

  const currentItem = activeId
    ? {
        id: activeId,
        variant: isColumn(activeId) ? ("column" as const) : ("item" as const),
      }
    : activeItem;

  const content =
    currentItem && children
      ? typeof children === "function"
        ? children({ value: currentItem.id, variant: currentItem.variant })
        : children
      : null;

  if (!mounted) return null;

  return createPortal(
    <DragOverlay
      dropAnimation={dropAnimationConfig}
      modifiers={modifiers}
      className={cn("z-50", activeId && "cursor-grabbing", className)}
      {...props}
    >
      <IsOverlayContext.Provider value={true}>
        {content}
      </IsOverlayContext.Provider>
    </DragOverlay>,
    document.body,
  );
}

export {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnContent,
  KanbanColumnHandle,
  KanbanItem,
  KanbanItemHandle,
  KanbanOverlay,
  useKanban,
};
