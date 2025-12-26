"use client";

import { BrainIcon, Loader2Icon, SparklesIcon, ZapIcon } from "lucide-react";
import { memo } from "react";
import { cn } from "@/lib/utils";
import { Shimmer } from "./ai-elements/shimmer";

export type AgentStatus = "idle" | "thinking" | "planning" | "executing";

type AgentStatusIndicatorProps = {
  status: AgentStatus;
  className?: string;
  currentStep?: string;
};

const statusConfig: Record<
  AgentStatus,
  { icon: typeof BrainIcon; label: string; showShimmer: boolean }
> = {
  idle: { icon: SparklesIcon, label: "Listo", showShimmer: false },
  thinking: { icon: BrainIcon, label: "Pensando", showShimmer: true },
  planning: { icon: ZapIcon, label: "Planificando", showShimmer: true },
  executing: { icon: Loader2Icon, label: "Ejecutando", showShimmer: true },
};

const PureAgentStatusIndicator = ({
  status,
  className,
  currentStep,
}: AgentStatusIndicatorProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  if (status === "idle") {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-sm",
        "fade-in animate-in duration-300",
        className
      )}
    >
      <Icon
        className={cn("size-4", status === "executing" && "animate-spin")}
      />
      <div className="flex flex-col">
        {config.showShimmer ? (
          <Shimmer className="font-medium">{config.label}</Shimmer>
        ) : (
          <span className="font-medium">{config.label}</span>
        )}
        {currentStep && (
          <span className="text-muted-foreground text-xs">{currentStep}</span>
        )}
      </div>
    </div>
  );
};

export const AgentStatusIndicator = memo(PureAgentStatusIndicator);
AgentStatusIndicator.displayName = "AgentStatusIndicator";
