import { Frame, FramePanel } from "@theo/ui/components/frame";
import { IconTile } from "@theo/ui/components/icon-tile";
import { LayoutDashboardIcon } from "lucide-react";

export function Pattern() {
  return (
    <Frame className="w-full max-w-xs">
      <FramePanel className="flex flex-col gap-3">
        <IconTile variant="elevated" size="lg" aria-hidden="true">
          <LayoutDashboardIcon />
        </IconTile>
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-medium">Unified dashboard</h3>
          <p className="text-xs text-muted-foreground">
            Track every project, deployment and metric from a single workspace.
          </p>
        </div>
      </FramePanel>
    </Frame>
  );
}
