<a href="https://chat.vercel.ai/">
  <img alt="Next.js AI Agent Template" src="app/(chat)/opengraph-image.png">
  <h1 align="center">AI Agent Template</h1>
</a>

<p align="center">
  A production-ready AI agent template built with Next.js and the AI SDK. Features tool usage, planning, web search, and document creation.
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#architecture"><strong>Architecture</strong></a> ·
  <a href="#tools"><strong>Tools</strong></a> ·
  <a href="#running-locally"><strong>Running locally</strong></a> ·
  <a href="#use-as-template"><strong>Use as Template</strong></a>
</p>
<br/>

## Features

- **🤖 Agentic Architecture**
  - ToolLoopAgent pattern from AI SDK for multi-step reasoning
  - Automatic planning for complex tasks
  - State persistence across conversation turns

- **🔧 Built-in Tools**
  - Web search (Tavily) and content extraction
  - Document creation and editing (text, code, sheets)
  - URL fetching and content analysis
  
- **💬 Chat Interface**
  - Real-time streaming responses
  - Plan visualization during execution
  - Error boundaries for graceful failure handling

- **🏗️ Modern Stack**
  - [Next.js 16](https://nextjs.org) with App Router
  - [AI SDK](https://ai-sdk.dev) for LLM integration
  - [Drizzle ORM](https://orm.drizzle.team) with PostgreSQL
  - [Auth.js](https://authjs.dev) for authentication
  - [shadcn/ui](https://ui.shadcn.com) components

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │  Chat UI    │  │ Data Stream │  │ AI Elements Components  │ │
│  │             │◀─│   Handler   │◀─│ (Plan, Reasoning, etc.) │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                      API Route                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   Agent     │──│   Planning  │──│    State Management     │ │
│  │ (ToolLoop)  │  │   System    │  │  (Persistent Memory)    │ │
│  └──────┬──────┘  └─────────────┘  └─────────────────────────┘ │
│         │                                                       │
│  ┌──────▼───────────────────────────────────────────────────┐  │
│  │                       Tools                               │  │
│  │  webSearch │ webExtract │ fetchUrl │ createDocument │ ... │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Tools

| Tool | Description |
|------|-------------|
| `webSearch` | Search the web using Tavily API |
| `webExtract` | Extract clean content from URLs |
| `fetchUrl` | Fetch and parse URL content |
| `analyzeContent` | Analyze and synthesize information |
| `createDocument` | Create text, code, or sheet artifacts |
| `updateDocument` | Modify existing documents |
| `finalAnswer` | Provide final response to user |

### Adding Custom Tools

Create a new file in `lib/ai/tools/`:

```typescript
import { tool } from "ai";
import { z } from "zod";

export const myTool = tool({
  description: "What this tool does",
  inputSchema: z.object({
    param: z.string().describe("Parameter description"),
  }),
  execute: async ({ param }) => {
    // Your tool logic
    return { result: "..." };
  },
});
```

Then add it to `lib/ai/tools/index.ts`.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AUTH_SECRET` | Yes | NextAuth secret ([generate](https://generate-secret.vercel.app/32)) |
| `AI_GATEWAY_API_KEY` | Yes* | Vercel AI Gateway key (*auto-provided on Vercel) |
| `POSTGRES_URL` | Yes | PostgreSQL connection string |
| `BLOB_READ_WRITE_TOKEN` | Yes | Vercel Blob storage token |
| `TAVILY_API_KEY` | Yes | Web search API key ([get one](https://tavily.com)) |
| `REDIS_URL` | No | Redis for resumable streams |
| `PLANNING_MODEL` | No | Override planning model (default: `google/gemini-2.5-flash-lite`) |

## Running Locally

1. Clone the repository
2. Copy `.env.example` to `.env.local` and fill in the values
3. Install dependencies and run:

```bash
pnpm install
pnpm db:migrate
pnpm dev
```

Visit [localhost:3000](http://localhost:3000)

## Use as Template

This template is designed to be forked and customized:

1. **Fork/clone** this repository
2. **Add your tools** in `lib/ai/tools/`
3. **Customize prompts** in `lib/ai/prompts.ts`
4. **Modify UI** in `components/` 
5. **Add features** to the agent in `lib/ai/agent.ts`

### Key Extension Points

- `lib/ai/tools/` - Add new agent capabilities
- `lib/ai/prompts.ts` - Customize system prompts
- `lib/ai/planning.ts` - Modify planning behavior
- `lib/ai/models.ts` - Configure available models
- `components/ai-elements/` - UI components for agent features

## Model Providers

Uses [Vercel AI Gateway](https://vercel.com/docs/ai-gateway) by default. To use direct providers:

```typescript
// lib/ai/providers.ts
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";

export const getModel = (id: string) => {
  if (id.startsWith("gpt")) return openai(id);
  if (id.startsWith("claude")) return anthropic(id);
  // ... etc
};
```

## License

MIT
