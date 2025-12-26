// Export individual tools
export { fetchUrl } from "./fetch-url";
export { analyzeContent } from "./analyze-content";
export { finalAnswer } from "./final-answer";

// Export all tools as a collection for easy import
import { fetchUrl } from "./fetch-url";
import { analyzeContent } from "./analyze-content";
import { finalAnswer } from "./final-answer";

export const agentTools = {
  fetchUrl,
  analyzeContent,
  finalAnswer,
};
