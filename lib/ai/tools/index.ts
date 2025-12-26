import type { UIMessageStreamWriter } from "ai";
import type { Session } from "next-auth";
import type { ChatMessage } from "@/lib/types";

export { analyzeContent } from "./analyze-content";
// Export document tool factories (require context)
export { createDocument } from "./create-document";
// Export individual static tools
export { fetchUrl } from "./fetch-url";
export { finalAnswer } from "./final-answer";
export { updateDocument } from "./update-document";
export { webExtract, webSearch } from "./web-search";

import { analyzeContent } from "./analyze-content";
// Import document tool factories
import { createDocument } from "./create-document";
// Import static tools
import { fetchUrl } from "./fetch-url";
import { finalAnswer } from "./final-answer";
import { updateDocument } from "./update-document";
import { webExtract, webSearch } from "./web-search";

/**
 * Static tools that don't require session/dataStream context
 */
export const staticTools = {
  fetchUrl,
  analyzeContent,
  finalAnswer,
  webSearch,
  webExtract,
};

/**
 * Create all agent tools with required context
 */
export type CreateAgentToolsProps = {
  session: Session;
  dataStream: UIMessageStreamWriter<ChatMessage>;
};

export const createAgentTools = ({
  session,
  dataStream,
}: CreateAgentToolsProps) => ({
  ...staticTools,
  createDocument: createDocument({ session, dataStream }),
  updateDocument: updateDocument({ session, dataStream }),
});

// Type for all agent tools
export type AgentTools = ReturnType<typeof createAgentTools>;

// Legacy export for backwards compatibility
export const agentTools = staticTools;
