import { createAuthPlugin } from "@better-auth-ui/core";
import {
  siwePlugin as coreSiwePlugin,
  type SiwePluginOptions,
} from "@better-auth-ui/core/plugins/siwe";

import { SignInEthereumButton } from "@theo/ui/auth/siwe/sign-in-ethereum-button";
import { WalletAccounts } from "@theo/ui/auth/siwe/wallet-accounts";

export {
  createEip1193WalletConnector,
  type SiweWalletConnector,
  type SiweConnectedWallet,
  type SiweWalletManager,
  type SiwePluginOptions,
} from "@better-auth-ui/core/plugins/siwe";

export const siwePlugin = createAuthPlugin(
  coreSiwePlugin.id,
  (options: SiwePluginOptions) => ({
    ...coreSiwePlugin(options),
    authButtons: [SignInEthereumButton],
    securityCards: options.walletManager ? [WalletAccounts] : [],
  }),
);
