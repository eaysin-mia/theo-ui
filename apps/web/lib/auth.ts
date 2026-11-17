import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { nextCookies } from "better-auth/next-js";
import { agentAuth } from "@better-auth/agent-auth";
import { apiKey } from "@better-auth/api-key";
import { oauthProvider } from "@better-auth/oauth-provider";
import { passkey } from "@better-auth/passkey";
import { siwe } from "better-auth/plugins/siwe";
import { verifyMessage } from "viem";
import { generateSiweNonce } from "viem/siwe";
import { sso } from "@better-auth/sso";
import {
  admin,
  anonymous,
  bearer,
  emailOTP,
  jwt,
  lastLoginMethod,
  magicLink,
  multiSession,
  oneTap,
  organization,
  phoneNumber,
  twoFactor,
  username,
} from "better-auth/plugins";
import client, { db } from "./db";

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
    transaction: false,
  }),
  secret:
    process.env.BETTER_AUTH_SECRET ||
    "default_dev_secret_must_be_at_least_32_characters_long_for_security",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? {
          github: {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
          },
        }
      : {}),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
  },
  plugins: [
    jwt(),
    agentAuth({
      deviceAuthorizationPage: "/auth/agent-approval",
      capabilities: [
        {
          name: "profile:read",
          description: "Read your basic profile information",
          approvalStrength: "session",
        },
        {
          name: "account:write",
          description: "Update account settings and preferences",
          approvalStrength: "session",
        },
      ],
    }),
    oauthProvider({
      loginPage: "/auth/sign-in",
      consentPage: "/auth/oauth-consent",
      signup: {
        page: "/auth/oauth-sign-up",
      },
      selectAccount: {
        page: "/auth/select-account",
        shouldRedirect: async () => true,
      },
    }),
    nextCookies(),
    username(),
    anonymous(),
    passkey(),
    twoFactor(),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        console.log(`[Better Auth Magic Link] Sent to ${email}: ${url}`);
      },
    }),
    emailOTP({
      sendVerificationOTP: async ({ email, otp, type }) => {
        console.log(
          `[Better Auth Email OTP] (${type}) Sent to ${email}: ${otp}`,
        );
      },
    }),
    organization({
      teams: {
        enabled: true,
      },
    }),
    multiSession(),
    apiKey(),
    admin(),
    bearer(),
    lastLoginMethod({
      customResolveMethod: (context) =>
        context.path === "/one-tap/callback" ? "google" : null,
    }),
    phoneNumber({
      otpLength: 6,
      sendOTP: async ({ phoneNumber, code }) => {
        console.log(`[Better Auth Phone OTP] Sent to ${phoneNumber}: ${code}`);
      },
      sendPasswordResetOTP: async ({ phoneNumber, code }) => {
        console.log(
          `[Better Auth Phone Password Reset OTP] Sent to ${phoneNumber}: ${code}`,
        );
      },
    }),
    sso(),
    ...(process.env.GOOGLE_CLIENT_ID
      ? [oneTap({ clientId: process.env.GOOGLE_CLIENT_ID })]
      : []),
    siwe({
      domain: process.env.BETTER_AUTH_URL
        ? new URL(process.env.BETTER_AUTH_URL).host
        : "localhost:3000",
      getNonce: async () => generateSiweNonce(),
      verifyMessage: async ({ message, signature, address }) => {
        return verifyMessage({
          address: address as `0x${string}`,
          message,
          signature: signature as `0x${string}`,
        });
      },
    }),
  ],
});
