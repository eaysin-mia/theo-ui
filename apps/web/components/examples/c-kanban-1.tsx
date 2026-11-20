"use client";

import type { ComponentProps } from "react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "theoui/components/avatar";
import { Badge } from "theoui/components/badge";
import { Button } from "theoui/components/button";
import { Card } from "theoui/components/card";
import {
  cn,
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnContent,
  KanbanColumnHandle,
  KanbanItem,
  KanbanItemHandle,
  KanbanOverlay,
} from "theoui";
import { GripVerticalIcon } from "lucide-react";

interface Task {
  id: string;
  title: string;
  priority: "low" | "medium" | "high";
  description?: string;
  assignee?: string;
  assigneeAvatar?: string;
  dueDate?: string;
}

const COLUMN_TITLES: Record<string, string> = {
  backlog: "Backlog",
  inProgress: "In Progress",
  done: "Done",
};

interface TaskCardProps extends Omit<
  ComponentProps<typeof KanbanItem>,
  "value" | "children"
> {
  task: Task;
  asHandle?: boolean;
  isOverlay?: boolean;
}

function TaskCard({ task, asHandle, isOverlay, ...props }: TaskCardProps) {
  const priorityVariant =
    task.priority === "high"
      ? "error"
      : task.priority === "medium"
        ? "info"
        : "secondary";

  const cardContent = (
    <Card
      className={cn(
        "cursor-grab border-border/60 bg-card p-3 shadow-2xs transition-shadow hover:shadow-xs",
        isOverlay && "rotate-1 cursor-grabbing shadow-xl ring-1 ring-border/80",
      )}
    >
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="line-clamp-1 text-sm font-medium tracking-tight text-foreground">
            {task.title}
          </span>
          <Badge
            variant={priorityVariant}
            size="sm"
            className="pointer-events-none shrink-0 capitalize"
          >
            {task.priority}
          </Badge>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {task.assignee && (
            <div className="flex items-center gap-1.5">
              <Avatar className="size-4">
                <AvatarImage src={task.assigneeAvatar} alt={task.assignee} />
                <AvatarFallback className="text-[9px]">
                  {task.assignee.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="line-clamp-1">{task.assignee}</span>
            </div>
          )}
          {task.dueDate && (
            <time className="font-mono text-[10px] whitespace-nowrap tabular-nums">
              {task.dueDate}
            </time>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <KanbanItem value={task.id} {...props}>
      {asHandle && !isOverlay ? (
        <KanbanItemHandle>{cardContent}</KanbanItemHandle>
      ) : (
        cardContent
      )}
    </KanbanItem>
  );
}

interface TaskColumnProps extends Omit<
  ComponentProps<typeof KanbanColumn>,
  "children"
> {
  tasks: Task[];
  isOverlay?: boolean;
}

function TaskColumn({ value, tasks, isOverlay, ...props }: TaskColumnProps) {
  return (
    <KanbanColumn
      value={value}
      className={cn(
        "flex flex-col rounded-2xl border border-border/60 bg-muted/30 p-3 shadow-2xs backdrop-blur-xs",
        isOverlay &&
          "rotate-1 cursor-grabbing shadow-2xl ring-2 ring-primary/40",
      )}
      {...props}
    >
      <div className="mb-2.5 flex items-center justify-between px-1 py-0.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold tracking-tight text-foreground">
            {COLUMN_TITLES[value] ?? value}
          </span>
          <Badge
            variant="outline"
            size="sm"
            className="font-mono text-[11px] tabular-nums"
          >
            {tasks.length}
          </Badge>
        </div>
        <KanbanColumnHandle
          render={
            <Button
              size="icon-xs"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              aria-label="Drag column"
            >
              <GripVerticalIcon className="size-3.5" aria-hidden="true" />
            </Button>
          }
        />
      </div>
      <KanbanColumnContent
        value={value}
        className="flex min-h-24 flex-col gap-2"
      >
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            asHandle={!isOverlay}
            isOverlay={isOverlay}
          />
        ))}
      </KanbanColumnContent>
    </KanbanColumn>
  );
}

export function Pattern() {
  const [columns, setColumns] = useState<Record<string, Task[]>>({
    backlog: [
      {
        id: "1",
        title: "Add authentication",
        priority: "high",
        assignee: "Alex Johnson",
        assigneeAvatar:
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=96&h=96&dpr=2&q=80",
        dueDate: "Jan 10, 2025",
      },
      {
        id: "2",
        title: "Create API endpoints",
        priority: "medium",
        assignee: "Sarah Chen",
        assigneeAvatar:
          "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=96&h=96&dpr=2&q=80",
        dueDate: "Jan 15, 2025",
      },
      {
        id: "3",
        title: "Write documentation",
        priority: "low",
        assignee: "Michael Rodriguez",
        assigneeAvatar:
          "https://images.unsplash.com/photo-1584308972272-9e4e7685e80f?w=96&h=96&dpr=2&q=80",
        dueDate: "Jan 20, 2025",
      },
    ],
    inProgress: [
      {
        id: "4",
        title: "Design system updates",
        priority: "high",
        assignee: "Emma Wilson",
        assigneeAvatar:
          "https://images.unsplash.com/photo-1485893086445-ed75865251e0?w=96&h=96&dpr=2&q=80",
        dueDate: "Aug 25, 2025",
      },
      {
        id: "5",
        title: "Implement dark mode",
        priority: "medium",
        assignee: "David Kim",
        assigneeAvatar:
          "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=96&h=96&dpr=2&q=80",
        dueDate: "Aug 25, 2025",
      },
    ],
    done: [
      {
        id: "7",
        title: "Setup project",
        priority: "high",
        assignee: "Aron Thompson",
        assigneeAvatar:
          "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=96&h=96&dpr=2&q=80",
        dueDate: "Sep 25, 2025",
      },
      {
        id: "8",
        title: "Initial commit",
        priority: "low",
        assignee: "James Brown",
        assigneeAvatar:
          "https://images.unsplash.com/photo-1543299750-19d1d6297053?w=96&h=96&dpr=2&q=80",
        dueDate: "Sep 20, 2025",
      },
    ],
  });

  return (
    <Kanban
      value={columns}
      onValueChange={setColumns}
      getItemValue={(item) => item.id}
    >
      <KanbanBoard className="grid auto-rows-fr grid-cols-1 gap-4 md:grid-cols-3">
        {Object.entries(columns).map(([columnValue, tasks]) => (
          <TaskColumn key={columnValue} value={columnValue} tasks={tasks} />
        ))}
      </KanbanBoard>
      <KanbanOverlay className="rounded-md border-2 border-dashed border-border/80 bg-muted/20" />
    </Kanban>
  );
}
