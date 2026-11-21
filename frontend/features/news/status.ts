import type { BadgeTone } from "@/components/admin/shared/Badge";

import type { NewsStatus } from "./types";

/** `NEWS_STATUS` di Design/admin/assets/admin.js. */
export const NEWS_STATUS: Record<NewsStatus, { label: string; tone: BadgeTone }> = {
  published: { label: "Terbit", tone: "green" },
  draft: { label: "Draft", tone: "amber" },
  archived: { label: "Arsip", tone: "grey" },
};