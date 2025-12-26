<objective>
Update the frontend UI to properly display agent execution, including plan visualization, step progress, tool execution status, and the enhanced agent workflow.

This prompt transforms the chat UI from a simple message thread to an agent execution dashboard while maintaining the clean, minimal aesthetic.
</objective>

<context>
This project has been refactored to an agent architecture. Previous prompts established:
- 001: ToolLoopAgent architecture
- 002: Web-focused tools (webSearch, fetchUrl, analyzeContent, finalAnswer)
- 003: Agent memory and state system with planning

Now we need the UI to reflect the agent's internal state: showing plans, tracking progress through steps, and visualizing the agent's "thinking" process.

Read these files to understand current UI:
@components/chat.tsx (main chat component)
@components/message.tsx (message rendering)
@components/data-stream-handler.tsx (custom data stream processing)
@hooks/use-messages.tsx (message management)
@lib/types.ts (type definitions including CustomUIDataTypes)
</context>

<requirements>
1. Create agent state display component `/components/agent-status.tsx`:
   - Shows current agent status (planning, executing, reflecting, completed)
   - Displays progress indicator (step X of Y)
   - Collapsible/expandable for minimal distraction
   - Animate status transitions smoothly

2. Create plan visualization component `/components/agent-plan.tsx`:
   - Render the agent's plan as a checklist/timeline
   - Show each step with status: pending, in-progress, completed, failed
   - Display step descriptions and results (collapsed by default)
   - Update in real-time as steps complete
   - Allow expanding individual steps to see details

3. Create tool execution component `/components/tool-execution.tsx`:
   - Show when a tool is being executed
   - Display tool name and inputs (sanitized for display)
   - Show execution duration
   - Display tool results in a readable format
   - Handle different tool types appropriately:
     - webSearch: Show search query and result count
     - fetchUrl: Show URL being fetched, loading state
     - analyzeContent: Show analysis type
     - finalAnswer: Highlight as the conclusion

4. Update data stream handler `/components/data-stream-handler.tsx`:
   - Handle new custom data types from agent state:
     - `agentStatus`: Status updates (planning, executing, etc.)
     - `agentPlan`: Plan object with steps
     - `stepProgress`: Current step index and result
     - `toolExecution`: Tool being executed
   - Update React context with agent state

5. Update message component `/components/message.tsx`:
   - Integrate agent status display within assistant messages
   - Show plan inline or as expandable section
   - Display tool executions within the message flow
   - Handle the finalAnswer tool specially (styled as conclusion)

6. Update chat component `/components/chat.tsx`:
   - Add agent state to the UI context
   - Show overall agent status in header/toolbar when active
   - Handle agent-specific interactions (cancel, retry step)

7. Create agent context provider `/components/agent-context.tsx`:
   - Centralize agent state for UI components
   - Provide hooks: useAgentState(), useAgentPlan(), useAgentProgress()
   - Handle state updates from data stream
</requirements>

<design_guidelines>
Visual hierarchy:
- Agent status should be visible but not overwhelming
- Plan steps should be scannable at a glance
- Tool executions should feel like "thinking out loud"
- Final answer should be prominently displayed

Animations (use framer-motion, already installed):
- Smooth transitions between agent states
- Steps appearing and completing
- Tool execution pulse/loading indicator
- Plan items checking off

Color coding:
- Use existing theme colors from Tailwind config
- Status indicators: blue (in-progress), green (completed), yellow (planning), red (failed)
- Keep it subtle - don't make it look like a Christmas tree

Responsiveness:
- Plan should collapse on mobile to save space
- Tool executions should be compact on small screens
- Status bar should be fixed position on mobile

Accessibility:
- Proper ARIA labels for status changes
- Screen reader announcements for state transitions
- Keyboard navigation for expandable sections
</design_guidelines>

<component_structure>
```
<Chat>
  <AgentContextProvider>
    <AgentStatusBar /> <!-- Fixed at top when agent is active -->
    <Messages>
      <Message role="user">...</Message>
      <Message role="assistant">
        <AgentPlan /> <!-- If planning/executing -->
        <ToolExecution tool="webSearch" /> <!-- Multiple possible -->
        <ToolExecution tool="fetchUrl" />
        <AssistantContent /> <!-- Streamed text -->
        <FinalAnswer /> <!-- If completed -->
      </Message>
    </Messages>
  </AgentContextProvider>
</Chat>
```
</component_structure>

<output>
Create these files:
- `./components/agent-status.tsx` - Status display component
- `./components/agent-plan.tsx` - Plan visualization
- `./components/tool-execution.tsx` - Tool execution display
- `./components/agent-context.tsx` - Agent state context provider

Modify these files:
- `./components/chat.tsx` - Integrate agent components
- `./components/message.tsx` - Show agent state in messages
- `./components/data-stream-handler.tsx` - Handle new data types
- `./lib/types.ts` - Add UI-specific agent types
</output>

<verification>
Before completing, verify:
1. Agent status displays correctly during execution
2. Plan renders and updates in real-time
3. Tool executions show with appropriate loading states
4. Final answer is prominently displayed
5. UI is responsive on mobile
6. Animations are smooth, not janky
7. No TypeScript errors
8. Accessibility: screen reader can announce status changes
9. Run `pnpm build` to verify build succeeds
10. Test with actual agent execution (send a message that triggers multi-step)
</verification>

<success_criteria>
- Agent status visible during execution
- Plan visualization shows steps and progress
- Tool executions display clearly
- Real-time updates from data stream work
- UI remains clean and not cluttered
- Mobile responsive
- Accessible
- Smooth animations
- Code is well-organized for template reuse
</success_criteria>
