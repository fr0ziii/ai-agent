import {
  ToolLoopAgent,
  type InferAgentUIMessage,
  stepCountIs,
  smoothStream,
  type UIMessageStreamWriter,
  type LanguageModel,
} from "ai";
import type { Session } from "next-auth";
import { createDocument } from "./tools/create-document";
import { updateDocument } from "./tools/update-document";
import { requestSuggestions } from "./tools/request-suggestions";
import { getWeather } from "./tools/get-weather";
import type { ChatMessage } from "@/lib/types";

export type CreateAgentOptions = {
  model: LanguageModel;
  systemPrompt: string;
  session: Session;
  dataStream: UIMessageStreamWriter<ChatMessage>;
  isReasoningModel?: boolean;
  maxSteps?: number;
};

// Define the chat tools for the agent
const createChatTools = (
  session: Session,
  dataStream: UIMessageStreamWriter<ChatMessage>
) => ({
  getWeather,
  createDocument: createDocument({ session, dataStream }),
  updateDocument: updateDocument({ session, dataStream }),
  requestSuggestions: requestSuggestions({ session, dataStream }),
});

type ChatTools = ReturnType<typeof createChatTools>;

export function createAgent({
  model,
  systemPrompt,
  session,
  dataStream,
  isReasoningModel = false,
  maxSteps = 5,
}: CreateAgentOptions) {
  if (isReasoningModel) {
    // Reasoning models don't use tools
    return new ToolLoopAgent({
      model,
      instructions: systemPrompt,
      toolChoice: "none",
      stopWhen: stepCountIs(maxSteps),
      prepareStep: async () => ({}),
    });
  }

  const tools = createChatTools(session, dataStream);

  return new ToolLoopAgent<never, ChatTools>({
    model,
    instructions: systemPrompt,
    tools,
    toolChoice: "auto",
    stopWhen: stepCountIs(maxSteps),
    prepareStep: async () => {
      // Future: context trimming, model escalation
      return {};
    },
  });
}

// Agent type for non-reasoning models (with tools)
export type ChatAgent = ToolLoopAgent<never, ChatTools>;

// Agent message type - union of both agent types
export type AgentMessage = InferAgentUIMessage<ChatAgent>;

// Smooth stream transform to apply during streaming
export { smoothStream };
