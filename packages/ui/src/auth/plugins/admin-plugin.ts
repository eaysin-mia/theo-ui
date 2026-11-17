import { createAuthPlugin } from "@better-auth-ui/core";
import {
  type AdminPluginOptions,
  adminPlugin as coreAdminPlugin,
} from "@better-auth-ui/core/plugins/admin";

import { StopImpersonating } from "@theo/ui/auth/admin/stop-impersonating";

export const adminPlugin = createAuthPlugin(
  coreAdminPlugin.id,
  (options: AdminPluginOptions = {}) => ({
    ...coreAdminPlugin(options),
    userMenuItems: [StopImpersonating],
  }),
);
