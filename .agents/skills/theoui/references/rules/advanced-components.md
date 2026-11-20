# Advanced Domain Components (theoui exclusive)

Use this guide when implementing complex domain widgets that exist in `theoui` but are **NOT** part of standard `coss ui`.

All components on this page are imported directly from `"theoui"`.

---

## 1. Gantt Timeline (`Gantt`)

Interactive, draggable project schedule and milestone timeline with day/week/month zoom views.

```tsx
"use client";

import { useState } from "react";
import {
  Gantt,
  GanttNav,
  GanttToolbar,
  GanttView,
  type GanttEvent,
  type GanttResource,
} from "theoui";

export function ProjectTimeline() {
  const [events, setEvents] = useState<GanttEvent[]>([
    {
      id: "task-1",
      title: "Sprint Planning",
      start: new Date(2026, 10, 1),
      end: new Date(2026, 10, 5),
      resourceId: "dev-1",
    },
  ]);

  const resources: GanttResource[] = [
    { id: "dev-1", name: "Engineering Team" },
  ];

  return (
    <Gantt events={events} resources={resources} onEventsChange={setEvents}>
      <GanttToolbar>
        <GanttNav />
      </GanttToolbar>
      <GanttView />
    </Gantt>
  );
}
```

---

## 2. Kanban Board (`Kanban`)

Drag-and-drop workflow board with sortable columns, item handles, and animated drag overlay.

```tsx
"use client";

import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnHeader,
  KanbanColumnContent,
  KanbanColumnHandle,
  KanbanItem,
  KanbanItemHandle,
  KanbanOverlay,
  Card,
  Badge,
} from "theoui";
import { GripVerticalIcon } from "lucide-react";

export function TaskBoard() {
  return (
    <Kanban>
      <KanbanBoard>
        <KanbanColumn id="todo">
          <KanbanColumnHeader>
            <span>To Do</span>
            <KanbanColumnHandle />
          </KanbanColumnHeader>
          <KanbanColumnContent>
            <KanbanItem id="card-1">
              <Card className="p-3 flex items-center justify-between">
                <span>Implement OAuth</span>
                <KanbanItemHandle render={<GripVerticalIcon className="size-4 text-muted-foreground" />} />
              </Card>
            </KanbanItem>
          </KanbanColumnContent>
        </KanbanColumn>
      </KanbanBoard>
      <KanbanOverlay />
    </Kanban>
  );
}
```

---

## 3. Event Calendar (`EventCalendar`)

Full calendar with Month, Agenda, Resource, and Time Grid layouts.

```tsx
"use client";

import {
  EventCalendar,
  EventCalendarHeader,
  EventCalendarNav,
  EventCalendarViewSelect,
  EventCalendarMonthView,
  EventCalendarAgendaView,
} from "theoui";

export function TeamCalendar() {
  return (
    <EventCalendar>
      <EventCalendarHeader>
        <EventCalendarNav />
        <EventCalendarViewSelect />
      </EventCalendarHeader>
      <EventCalendarMonthView />
      <EventCalendarAgendaView />
    </EventCalendar>
  );
}
```

---

## 4. Advanced Filters Builder (`Filters`)

Composable query builder with typed operators (equals, contains, between, date ranges) and query chips.

```tsx
"use client";

import {
  Filters,
  FiltersBuilder,
  FiltersChip,
  FiltersDraft,
} from "theoui";

export function SearchFilterBar() {
  return (
    <Filters>
      <FiltersBuilder />
      <FiltersDraft />
    </Filters>
  );
}
```

---

## 5. Rich Composer (`Composer`)

Multi-line rich input with slash-command popups, mention suggestions, attachments, and submit controls.

```tsx
"use client";

import {
  Composer,
  ComposerInput,
  ComposerList,
  ComposerItem,
  ComposerPopup,
  ComposerActions,
  ComposerSubmit,
  Button,
} from "theoui";

export function PromptComposer() {
  return (
    <Composer>
      <ComposerInput placeholder="Ask anything or type / for commands..." />
      <ComposerPopup>
        <ComposerList>
          <ComposerItem value="code">/code — Generate snippet</ComposerItem>
          <ComposerItem value="summarize">/summarize — Summarize document</ComposerItem>
        </ComposerList>
      </ComposerPopup>
      <ComposerActions>
        <ComposerSubmit render={<Button size="sm">Send</Button>} />
      </ComposerActions>
    </Composer>
  );
}
```

---

## 6. AI Chat Feed (`MessageScroller`, `Message`, `Bubble`, `Trace`)

Complete AI assistant message streaming UI with auto-scrolling feed, speech bubbles, and collapsible reasoning traces.

```tsx
import {
  MessageScroller,
  MessageScrollerContent,
  Message,
  MessageContent,
  MessageAvatar,
  Bubble,
  BubbleContent,
  TraceCollapsible,
  TraceCollapsibleTrigger,
  TraceCollapsibleContent,
  TraceTitle,
  TraceDescription,
} from "theoui";

export function ChatFeed({ messages }) {
  return (
    <MessageScroller>
      <MessageScrollerContent>
        {messages.map((m) => (
          <Message key={m.id} align={m.role === "user" ? "end" : "start"}>
            <MessageAvatar fallback={m.role === "user" ? "U" : "AI"} />
            <MessageContent>
              {m.reasoning && (
                <TraceCollapsible>
                  <TraceCollapsibleTrigger>
                    <TraceTitle>Reasoning Process</TraceTitle>
                  </TraceCollapsibleTrigger>
                  <TraceCollapsibleContent>
                    <TraceDescription>{m.reasoning}</TraceDescription>
                  </TraceCollapsibleContent>
                </TraceCollapsible>
              )}
              <Bubble variant={m.role === "user" ? "default" : "muted"}>
                <BubbleContent>{m.text}</BubbleContent>
              </Bubble>
            </MessageContent>
          </Message>
        ))}
      </MessageScrollerContent>
    </MessageScroller>
  );
}
```

---

## 7. Dynamic AutoHeight (`AutoHeight`)

Container with smooth CSS transition when inner content dynamically expands or contracts.

```tsx
import { AutoHeight } from "theoui";

export function DynamicAccordion({ isOpen, children }) {
  return (
    <AutoHeight>
      {isOpen && <div>{children}</div>}
    </AutoHeight>
  );
}
```

---

## 8. Micro-Interaction Buttons

- `HoldButton`: Action triggers only after long-pressing/holding for a set duration.
- `RainbowButton`: Animated glowing rainbow border.
- `ShimmerButton`: Shimmering gradient light pass effect.
- `UndoButton`: Button with embedded timer countdown allowing action cancellation.
- `CartButton`: Animated fly-to-cart or item tally button.

```tsx
import { HoldButton, RainbowButton, ShimmerButton, UndoButton } from "theoui";

<HoldButton onHoldComplete={() => deleteRecord()}>Hold to Delete</HoldButton>
<RainbowButton>Get Started</RainbowButton>
<ShimmerButton>Upgrade to Pro</ShimmerButton>
<UndoButton duration={5} onUndo={() => restore()}>Sent (Undo)</UndoButton>
```
