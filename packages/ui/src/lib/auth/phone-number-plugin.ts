import { createAuthPlugin } from "@better-auth-ui/core";
import {
  phoneNumberPlugin as corePhoneNumberPlugin,
  type PhoneNumberPluginOptions,
} from "@better-auth-ui/core/plugins/phone-number";

import { ChangePhoneNumber } from "#auth/phone-number/change-phone-number";
import { ForgotPhoneNumberPassword } from "#auth/phone-number/forgot-phone-number-password";
import { PhoneNumber } from "#auth/phone-number/phone-number";
import { PhoneNumberButton } from "#auth/phone-number/phone-number-button";
import { ResetPhoneNumberPassword } from "#auth/phone-number/reset-phone-number-password";

export const phoneNumberPlugin = createAuthPlugin(
  corePhoneNumberPlugin.id,
  (options: PhoneNumberPluginOptions = {}) => {
    const plugin = corePhoneNumberPlugin(options);
    const hasSignIn = plugin.signIn || plugin.passwordSignIn;

    return {
      ...plugin,
      authButtons: hasSignIn ? [PhoneNumberButton] : [],
      views: {
        auth: {
          ...(hasSignIn && { phoneNumber: PhoneNumber }),
          ...(plugin.passwordReset && {
            phoneNumberForgotPassword: ForgotPhoneNumberPassword,
            phoneNumberResetPassword: ResetPhoneNumberPassword,
          }),
        },
      },
      ...(hasSignIn && {
        fallbackViews: { auth: { signIn: PhoneNumber } },
      }),
      accountCards: plugin.changePhoneNumber ? [ChangePhoneNumber] : [],
    };
  },
);
