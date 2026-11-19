import { createAuthPlugin } from "@better-auth-ui/core";
import {
  multiSessionPlugin as coreMultiSessionPlugin,
  type MultiSessionPluginOptions,
} from "@better-auth-ui/core/plugins/multi-session";

import { ManageAccounts } from "theoui/components/auth/multi-session/manage-accounts";
import { SwitchAccountSubmenu } from "theoui/components/auth/multi-session/switch-account-submenu";

export const multiSessionPlugin = createAuthPlugin(
  coreMultiSessionPlugin.id,
  (options: MultiSessionPluginOptions = {}) => ({
    ...coreMultiSessionPlugin(options),
    accountCards: [ManageAccounts],
    userMenuItems: [SwitchAccountSubmenu],
  }),
);
