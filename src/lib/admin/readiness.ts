import { isAuthConfigured } from "@/lib/auth/session";
import { isNeonConfigured } from "@/lib/db/neon";

export function isAdminPanelReady(): boolean {
  return isNeonConfigured() && isAuthConfigured();
}
