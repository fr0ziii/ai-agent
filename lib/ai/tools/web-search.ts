import { tavilyExtract, tavilySearch } from "@tavily/ai-sdk";

/**
 * Web search tool using Tavily API
 * Requires TAVILY_API_KEY environment variable
 */
export const webSearch = tavilySearch({
  maxResults: 5,
  searchDepth: "basic",
});

/**
 * Web content extraction tool using Tavily API
 * Extracts clean content from URLs
 */
export const webExtract = tavilyExtract();
