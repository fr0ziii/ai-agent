<objective>
Implement a persistent memory and state management system for the agent, enabling multi-step planning, task tracking, and context persistence across agent steps.

This transforms the agent from stateless request-response to a stateful system that can plan, execute, and reflect on multi-step tasks.
</objective>

<context>
This project is being refactored to an agent template. Previous prompts established:
- 001: ToolLoopAgent architecture in `/lib/ai/agent.ts`
- 002: Web-focused tools (webSearch, fetchUrl, analyzeContent, finalAnswer)

Now we need to add the "brain" - memory and state that allows the agent to:
- Plan multi-step approaches before execution
- Track progress through complex tasks
- Remember context from previous steps
- Adapt strategy based on results

Read these files:
@lib/ai/agent.ts (agent definition)
@lib/db/schema.ts (database schema)
@lib/db/queries.ts (existing query patterns)
@app/(chat)/api/chat/route.ts (route handler)
</context>

<ai_sdk_state_patterns>
Agent state can be managed through:

1. **prepareStep callback** - Inject state into each step:
```typescript
prepareStep: async ({ stepNumber, messages, steps }) => {
  const state = await getAgentState(chatId);
  return {
    messages: [
      ...messages,
      { role: 'system', content: formatStateContext(state) }
    ]
  };
}
```

2. **Tool results as state** - Tools can return state updates:
```typescript
execute: async (input) => {
  await updateAgentState(chatId, { currentStep: 'researching' });
  return { result, stateUpdate: { ... } };
}
```

3. **Custom data stream** - Stream state to client:
```typescript
writer.writeCustomData('agentState', {
  currentStep: 'planning',
  progress: 0.25
});
```
</ai_sdk_state_patterns>

<requirements>
1. Create agent state schema in `/lib/db/schema.ts`:
   ```typescript
   AgentState {
     id: string (uuid)
     chatId: string (references Chat)
     plan: json (array of planned steps)
     currentStepIndex: number
     completedSteps: json (array of completed step results)
     context: json (accumulated knowledge/findings)
     status: enum ('idle' | 'planning' | 'executing' | 'reflecting' | 'completed' | 'failed')
     createdAt: timestamp
     updatedAt: timestamp
   }
   ```

2. Create state management utilities in `/lib/ai/state.ts`:
   - `initializeAgentState(chatId)` - Create new state for a chat
   - `getAgentState(chatId)` - Retrieve current state
   - `updateAgentState(chatId, updates)` - Partial update
   - `addCompletedStep(chatId, stepResult)` - Track step completion
   - `updatePlan(chatId, plan)` - Set/update the execution plan
   - `clearAgentState(chatId)` - Reset state for new task

3. Create a planning system in `/lib/ai/planning.ts`:
   - `createPlan(task, context)` - Generate execution plan using LLM
   - Plan structure: `{ goal, steps: [{ id, description, tool?, status }], reasoning }`
   - Use a fast model for planning (haiku/gpt-4-mini)

4. Update agent to use state:
   - Modify `prepareStep` in `/lib/ai/agent.ts` to inject state context
   - State context should include: current plan, completed steps, accumulated findings
   - Implement state-aware tool execution

5. Add reflection capability:
   - After each tool result, agent should evaluate progress
   - Reflection prompt: "Given the plan and this result, what's the next best action?"
   - Store reflections in completedSteps

6. Stream state updates to client:
   - Add new custom data types for agent state
   - Stream: plan updates, step progress, status changes
   - Update `/lib/types.ts` with new CustomUIDataTypes
</requirements>

<implementation_guidelines>
Database migration:
- Create a new migration for AgentState table
- Run migration: `pnpm db:generate && pnpm db:migrate`

State lifecycle:
1. User sends message → Initialize state (status: 'planning')
2. Agent creates plan → Update state (status: 'executing', plan: [...])
3. Each step executes → Update state (currentStepIndex++, add to completedSteps)
4. After each step → Reflection (may update plan)
5. finalAnswer called → Update state (status: 'completed')

Context injection format:
```
<agent_state>
  <current_plan>
    Goal: {plan.goal}
    Steps:
    1. [DONE] {step1.description} - Result: {step1.result}
    2. [IN PROGRESS] {step2.description}
    3. [PENDING] {step3.description}
  </current_plan>
  <accumulated_context>
    {findings from previous steps}
  </accumulated_context>
</agent_state>
```

Memory limits:
- Keep accumulated context under 4000 tokens
- Summarize older findings if context grows too large
- Use `prepareStep` to manage context window

Concurrent requests:
- Use database transactions for state updates
- Handle race conditions gracefully
</implementation_guidelines>

<output>
Create these files:
- `./lib/ai/state.ts` - State management utilities
- `./lib/ai/planning.ts` - Planning system
- `./lib/db/migrations/XXXX_add_agent_state.sql` - Migration (auto-generated)

Modify these files:
- `./lib/db/schema.ts` - Add AgentState table
- `./lib/db/queries.ts` - Add state query functions
- `./lib/ai/agent.ts` - Integrate state into prepareStep
- `./lib/types.ts` - Add state-related CustomUIDataTypes
- `./app/(chat)/api/chat/route.ts` - Initialize state on new messages
</output>

<verification>
Before completing, verify:
1. Database migration runs successfully
2. State CRUD operations work (test with simple queries)
3. Agent injects state context into messages
4. State updates stream to client
5. Plan is created for new tasks
6. Steps are tracked as completed
7. No TypeScript errors
8. Run `pnpm build` to verify build succeeds
</verification>

<success_criteria>
- AgentState table created and migrated
- State management functions work correctly
- Planning system generates reasonable plans
- Agent uses state in prepareStep
- State changes are streamed to client
- Memory limits are enforced
- Clean, well-documented code for template reuse
</success_criteria>
