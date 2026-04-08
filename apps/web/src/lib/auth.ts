import { createAuthClient } from "better-auth/client";
import { genericOAuthClient } from "better-auth/client/plugins";

// Create typed auth client for end-to-end type safety
export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL,
  plugins: [genericOAuthClient()],
});
