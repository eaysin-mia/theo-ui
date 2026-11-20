import { Organization } from "theoui/auth";
import { organizationPlugin } from "theoui/auth/plugins";
import { notFound, redirect } from "next/navigation";

const validOrganizationPaths = new Set([
  ...Object.values(organizationPlugin().viewPaths.organization ?? {}),
  "billing",
  "sso",
]);

export default async function OrganizationCatchAllPage({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  const { path } = await params;

  if (!path || path.length === 0) {
    redirect("/organization/settings");
  }

  const firstSegment = path[0];
  // If a single slug segment is provided (e.g. /organization/@acme), redirect to its settings tab
  if (
    path.length === 1 &&
    firstSegment &&
    !validOrganizationPaths.has(firstSegment)
  ) {
    redirect(`/organization/${firstSegment}/settings`);
  }

  const resolvedPath = path[path.length - 1] ?? "settings";

  if (!validOrganizationPaths.has(resolvedPath)) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <Organization path={resolvedPath} />
    </div>
  );
}
