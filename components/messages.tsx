import type { UseChatHelpers } from "@ai-sdk/react";
import equal from "fast-deep-equal";
import {
  ArrowDownIcon,
  CheckCircle2Icon,
  CircleIcon,
  Loader2Icon,
  XCircleIcon,
} from "lucide-react";
import { memo } from "react";
import { useMessages } from "@/hooks/use-messages";
import type { Vote } from "@/lib/db/schema";
import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Plan,
  PlanContent,
  PlanDescription,
  PlanHeader,
  PlanTitle,
  PlanTrigger,
} from "./ai-elements/plan";
import { useDataStream } from "./data-stream-provider";
import { Greeting } from "./greeting";
import { PreviewMessage, ThinkingMessage } from "./message";

type MessagesProps = {
  addToolApprovalResponse: UseChatHelpers<ChatMessage>["addToolApprovalResponse"];
  chatId: string;
  status: UseChatHelpers<ChatMessage>["status"];
  votes: Vote[] | undefined;
  messages: ChatMessage[];
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  regenerate: UseChatHelpers<ChatMessage>["regenerate"];
  isReadonly: boolean;
  isArtifactVisible: boolean;
  selectedModelId: string;
};

function PureMessages({
  addToolApprovalResponse,
  chatId,
  status,
  votes,
  messages,
  setMessages,
  regenerate,
  isReadonly,
  selectedModelId: _selectedModelId,
}: MessagesProps) {
  const {
    containerRef: messagesContainerRef,
    endRef: messagesEndRef,
    isAtBottom,
    scrollToBottom,
    hasSentMessage,
  } = useMessages({
    status,
  });

  const { agentPlan, agentStatus } = useDataStream();

  return (
    <div className="relative flex-1">
      <div
        className="absolute inset-0 touch-pan-y overflow-y-auto"
        ref={messagesContainerRef}
      >
        <div className="mx-auto flex min-w-0 max-w-4xl flex-col gap-4 px-2 py-4 md:gap-6 md:px-4">
          {messages.length === 0 && <Greeting />}

          {agentPlan &&
            (agentStatus === "planning" || agentStatus === "executing") && (
              <Plan className="mb-4" isStreaming={agentStatus === "planning"}>
                <PlanHeader>
                  <div className="flex flex-col gap-1">
                    <PlanTitle>
                      {agentStatus === "planning"
                        ? "Calculando Plan..."
                        : agentPlan.goal}
                    </PlanTitle>
                    <PlanDescription>
                      {agentStatus === "planning"
                        ? "El agente está diseñando una estrategia para responder."
                        : `${agentPlan.steps.filter((s) => s.status === "done").length} de ${agentPlan.steps.length} pasos completados`}
                    </PlanDescription>
                  </div>
                  <PlanTrigger />
                </PlanHeader>
                <PlanContent>
                  <div className="flex flex-col gap-3">
                    {agentPlan.steps.map((step, index) => (
                      <div
                        className="flex items-start gap-3 text-sm"
                        key={step.id}
                      >
                        <div className="mt-0.5">
                          {step.status === "done" ? (
                            <CheckCircle2Icon className="size-4 text-green-500" />
                          ) : step.status === "in_progress" ? (
                            <Loader2Icon className="size-4 animate-spin text-blue-500" />
                          ) : step.status === "failed" ? (
                            <XCircleIcon className="size-4 text-red-500" />
                          ) : (
                            <CircleIcon className="size-4 text-muted-foreground" />
                          )}
                        </div>
                        <div
                          className={cn(
                            "flex-1",
                            step.status === "done"
                              ? "text-muted-foreground line-through"
                              : "text-foreground"
                          )}
                        >
                          <span className="mr-2 font-medium">
                            Paso {index + 1}:
                          </span>
                          {step.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </PlanContent>
              </Plan>
            )}

          {messages.map((message, index) => (
            <PreviewMessage
              addToolApprovalResponse={addToolApprovalResponse}
              chatId={chatId}
              isLoading={
                status === "streaming" && messages.length - 1 === index
              }
              isReadonly={isReadonly}
              key={message.id}
              message={message}
              regenerate={regenerate}
              requiresScrollPadding={
                hasSentMessage && index === messages.length - 1
              }
              setMessages={setMessages}
              vote={
                votes
                  ? votes.find((vote) => vote.messageId === message.id)
                  : undefined
              }
            />
          ))}

          {status === "submitted" &&
            !messages.some((msg) =>
              msg.parts?.some(
                (part) => "state" in part && part.state === "approval-responded"
              )
            ) && <ThinkingMessage />}

          <div
            className="min-h-[24px] min-w-[24px] shrink-0"
            ref={messagesEndRef}
          />
        </div>
      </div>

      <button
        aria-label="Scroll to bottom"
        className={`-translate-x-1/2 absolute bottom-4 left-1/2 z-10 rounded-full border bg-background p-2 shadow-lg transition-all hover:bg-muted ${
          isAtBottom
            ? "pointer-events-none scale-0 opacity-0"
            : "pointer-events-auto scale-100 opacity-100"
        }`}
        onClick={() => scrollToBottom("smooth")}
        type="button"
      >
        <ArrowDownIcon className="size-4" />
      </button>
    </div>
  );
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.isArtifactVisible && nextProps.isArtifactVisible) {
    return true;
  }

  if (prevProps.status !== nextProps.status) {
    return false;
  }
  if (prevProps.selectedModelId !== nextProps.selectedModelId) {
    return false;
  }
  if (prevProps.messages.length !== nextProps.messages.length) {
    return false;
  }
  if (!equal(prevProps.messages, nextProps.messages)) {
    return false;
  }
  if (!equal(prevProps.votes, nextProps.votes)) {
    return false;
  }

  return false;
});
