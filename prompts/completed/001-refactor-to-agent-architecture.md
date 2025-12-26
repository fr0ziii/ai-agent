<objective>
Refactor the chat API route from a simple chatbot pattern to an AI SDK v6 ToolLoopAgent architecture.

This is the foundational refactoring that transforms `/app/(chat)/api/chat/route.ts` from using `streamText()` directly to using the `ToolLoopAgent` class with proper loop control, stop conditions, and agent configuration.

The goal is to create a clean, reusable template for building AI agents with the Vercel AI SDK.
</objective>

<context>
This is a Next.js 16 project using:
- AI SDK 6.0.0-beta (with @ai-sdk/react, @ai-sdk/gateway)
- Vercel AI Gateway for model routing
- PostgreSQL with Drizzle ORM
- Redis for resumable streams

Current architecture uses `streamText()` with tools in a single-turn pattern. We're converting to `ToolLoopAgent` for multi-step agentic behavior.

Read these files to understand the current implementation:
@app/(chat)/api/chat/route.ts
@app/(chat)/api/chat/schema.ts
@lib/ai/providers.ts
@lib/ai/models.ts
@lib/ai/prompts.ts
</context>

<ai_sdk_v6_agent_patterns>
Key imports for ToolLoopAgent:
```typescript
import { ToolLoopAgent, tool, stepCountIs, hasToolCall, Output, InferAgentUIMessage } from 'ai';
```

Agent definition pattern:
```typescript
const agent = new ToolLoopAgent({
  model: myModel,
  instructions: systemPrompt,
  tools: { /* tool definitions */ },
  toolChoice: 'auto',
  stopWhen: stepCountIs(20), // or array of conditions
  prepareStep: async ({ stepNumber, messages, steps, model }) => {
    // Dynamic adjustments per step
    return {};
  },
});
```

Streaming with agent:
```typescript
const response = agent.createAgentUIStreamResponse({
  messages,
  // other options
});
```

Stop conditions can be combined:
```typescript
stopWhen: [
  stepCountIs(20),
  hasToolCall('finalAnswer'),
]
```
</ai_sdk_v6_agent_patterns>

<requirements>
1. Create a new agent definition in `/lib/ai/agent.ts`:
   - Export a function `createAgent(model, options)` that returns a ToolLoopAgent instance
   - Include configurable stop conditions (default: stepCountIs(20))
   - Include a `prepareStep` callback for dynamic model switching and context management
   - Support structured output via Output schema (optional)

2. Refactor `/app/(chat)/api/chat/route.ts`:
   - Replace `streamText()` with agent.stream() or agent.createAgentUIStreamResponse()
   - Preserve existing functionality: rate limiting, auth, resumable streams, geo hints
   - Maintain compatibility with the existing useChat() hook on the client
   - Keep tool approval flow working (needsApproval on tools)

3. Update `/lib/ai/prompts.ts`:
   - Create an `agentInstructions` prompt that defines agent behavior:
     - Multi-step reasoning approach
     - When to use tools vs respond directly
     - How to handle errors and retry
     - Output format preferences

4. Export TypeScript types:
   - Use `InferAgentUIMessage<typeof agent>` for type-safe messages
   - Export types from a central location for client consumption

5. Preserve backwards compatibility:
   - The client-side useChat() hook should continue working
   - Message format should remain compatible with Message_v2 schema
   - Data stream custom types should still work
</requirements>

<implementation_guidelines>
- Keep the agent configuration separate from the route handler for reusability
- Use the existing provider system (getLanguageModel) - don't change model routing
- Maintain the resumable stream pattern with Redis
- Keep entitlements/rate limiting checks before agent execution
- The agent should be stateless per-request (state management comes in a later prompt)

Error handling:
- Wrap agent execution in try/catch
- Return appropriate error responses for rate limits, auth failures
- Log agent step failures for debugging

Performance considerations:
- Use `prepareStep` to trim context if messages exceed threshold
- Consider model escalation for complex multi-step tasks
</implementation_guidelines>

<output>
Create/modify these files:
- `./lib/ai/agent.ts` - New file: Agent factory and configuration
- `./app/(chat)/api/chat/route.ts` - Modify: Use agent instead of streamText
- `./lib/ai/prompts.ts` - Modify: Add agentInstructions prompt
- `./lib/types.ts` - Modify: Export agent-related types
</output>

<verification>
Before completing, verify:
1. The chat API still responds to POST requests
2. Streaming works end-to-end (test with a simple message)
3. Tool calls are properly streamed to the client
4. Tool approval flow still works (if a tool has needsApproval: true)
5. No TypeScript errors in modified files
6. Existing tests pass (run: pnpm test)
</verification>

<success_criteria>
- Agent is defined using ToolLoopAgent class
- Route handler uses agent.stream() or createAgentUIStreamResponse()
- Stop conditions are configurable
- prepareStep callback is implemented for context management
- All existing functionality preserved (auth, rate limits, streaming)
- TypeScript types are properly exported
- Code is clean and well-documented for template reuse
</success_criteria>
