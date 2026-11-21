import { DocsSidebar } from "@/components/docs-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function DocsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="container mx-auto flex w-full flex-1 flex-col px-2">
      <SidebarProvider
        style={{ "--sidebar-width": "15rem" } as React.CSSProperties}
        className="min-h-0 flex-1 items-start px-0 [--footer-height:--spacing(14)] [--header-height:--spacing(14)] lg:grid lg:grid-cols-[var(--sidebar-width)_minmax(0,1fr)]"
      >
        <DocsSidebar />
        <div className="min-w-0 flex-1">{children}</div>
      </SidebarProvider>
    </div>
  );
}
