"use client";

import type { DataUIPart } from "ai";
import type React from "react";
import { createContext, useContext, useMemo, useState } from "react";
import type { CustomUIDataTypes } from "@/lib/types";

type AgentPlan = CustomUIDataTypes["agent-plan"];

type DataStreamContextValue = {
  dataStream: DataUIPart<CustomUIDataTypes>[];
  setDataStream: React.Dispatch<
    React.SetStateAction<DataUIPart<CustomUIDataTypes>[]>
  >;
  agentPlan: AgentPlan | null;
  setAgentPlan: React.Dispatch<React.SetStateAction<AgentPlan | null>>;
  agentStatus: string;
  setAgentStatus: React.Dispatch<React.SetStateAction<string>>;
};

const DataStreamContext = createContext<DataStreamContextValue | null>(null);

export function DataStreamProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [dataStream, setDataStream] = useState<DataUIPart<CustomUIDataTypes>[]>(
    []
  );
  const [agentPlan, setAgentPlan] = useState<AgentPlan | null>(null);
  const [agentStatus, setAgentStatus] = useState<string>("idle");

  const value = useMemo(
    () => ({
      dataStream,
      setDataStream,
      agentPlan,
      setAgentPlan,
      agentStatus,
      setAgentStatus,
    }),
    [dataStream, agentPlan, agentStatus]
  );

  return (
    <DataStreamContext.Provider value={value}>
      {children}
    </DataStreamContext.Provider>
  );
}

export function useDataStream() {
  const context = useContext(DataStreamContext);
  if (!context) {
    throw new Error("useDataStream must be used within a DataStreamProvider");
  }
  return context;
}
