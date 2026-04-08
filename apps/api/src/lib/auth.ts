import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { genericOAuth } from "better-auth/plugins/generic-oauth";

import { account, session, user, verification } from "../schemas/auth";
import { db } from "./db";

// Validate required environment variables
const requiredEnvVars = ["BETTER_AUTH_SECRET", "BETTER_AUTH_URL"] as const;
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: { user, session, account, verification },
  }),
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: process.env.CORS_ORIGIN ? [process.env.CORS_ORIGIN] : ["http://localhost:5173"],
  // Session configuration with cookie cache for performance
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day - refresh session if older than this
    cookieCache: {
      maxAge: 5 * 60, // 5 minutes - cache session in cookie to reduce DB queries
    },
  },
  // Rate limiting to prevent brute force attacks
  rateLimit: {
    enabled: true,
    window: 60, // 1 minute window
    max: 100, // 100 requests per window
    storage: "database",
  },
  // Account linking configuration
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["gitee"],
    },
  },
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: "gitee",
          clientId: process.env.GITEE_CLIENT_ID!,
          clientSecret: process.env.GITEE_CLIENT_SECRET!,
          authorizationUrl: "https://gitee.com/oauth/authorize",
          tokenUrl: "https://gitee.com/oauth/token",
          userInfoUrl: "https://gitee.com/api/v5/user",
          scopes: ["user_info"],
          // Map Gitee user info fields to better-auth expected format
          getUserInfo: async (tokens) => {
            const response = await fetch("https://gitee.com/api/v5/user", {
              headers: {
                Authorization: `Bearer ${tokens.accessToken}`,
                "User-Agent": "Better-Auth/1.0",
              },
            });

            if (!response.ok) {
              throw new Error(
                `Failed to fetch user info: ${response.status} ${response.statusText}`,
              );
            }

            const profile = await response.json();

            // Gitee API returns user info with the following fields:
            // - id: numeric user id
            // - login: username
            // - name: display name (may be empty)
            // - email: email address (may be empty if not public)
            // - avatar_url: avatar image URL
            return {
              id: String(profile.id),
              name: profile.name || profile.login,
              email: profile.email,
              image: profile.avatar_url,
              emailVerified: false, // Gitee does not provide email verification status
            };
          },
        },
      ],
    }),
  ],
});
