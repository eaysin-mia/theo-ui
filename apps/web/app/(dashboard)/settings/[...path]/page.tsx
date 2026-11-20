import { Settings } from "theoui/auth";

export default async function SettingsCatchAllPage({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  const { path } = await params;
  const resolvedPath = path?.join("/") ?? "account";

  return <Settings path={resolvedPath} />;
}
