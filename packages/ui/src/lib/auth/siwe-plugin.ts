import { createAuthPlugin } from "@better-auth-ui/core";
import {
  siwePlugin as coreSiwePlugin,
  type SiwePluginOptions,
} from "@better-auth-ui/core/plugins/siwe";

import { SignInEthereumButton } from "theoui/components/auth/siwe/sign-in-ethereum-button";
import { WalletAccounts } from "theoui/components/auth/siwe/wallet-accounts";

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
