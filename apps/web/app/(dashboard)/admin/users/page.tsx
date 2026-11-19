import { AdminUsers } from "theo-ui/components/auth/admin/admin-users";

export default function AdminUsersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          User Management
        </h1>
        <p className="text-sm text-muted-foreground">
          View, inspect, ban, elevate roles, and impersonate users across the
          platform.
        </p>
      </div>
      <AdminUsers />
    </div>
  );
}
