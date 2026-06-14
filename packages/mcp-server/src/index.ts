import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { analyzeRecording, analyzeRecordingSchema, type AnalyzeRecordingInput } from './tools/analyze-recording.js';
import { evaluateAssessment, evaluateAssessmentSchema, type EvaluateAssessmentInput } from './tools/evaluate-assessment.js';
import { generateFeedback, generateFeedbackSchema, type GenerateFeedbackInput } from './tools/generate-feedback.js';
import { recommendContent, recommendContentSchema, type RecommendContentInput } from './tools/recommend-content.js';

const PORT = Number(process.env.MCP_PORT ?? 3100);

function createMcpServer(): McpServer {
  const server = new McpServer({
    name: 'mymusic-coach-mcp',
    version: '0.1.0',
  });

  // ── Tool: analyze_recording ───────────────────────────────
  server.tool(
    'analyze_recording',
    'Analyze a student music recording and provide structured performance feedback using AI.',
    analyzeRecordingSchema,
    async (input) => {
      const result = await analyzeRecording(input as AnalyzeRecordingInput);
      return { content: [{ type: 'text' as const, text: result }] };
    },
  );

  // ── Tool: evaluate_assessment ─────────────────────────────
  server.tool(
    'evaluate_assessment',
    'Evaluate a completed music theory assessment, compute the score, and generate an AI narrative report.',
    evaluateAssessmentSchema,
    async (input) => {
      const result = await evaluateAssessment(input as EvaluateAssessmentInput);
      return { content: [{ type: 'text' as const, text: result }] };
    },
  );

  // ── Tool: generate_feedback ───────────────────────────────
  server.tool(
    'generate_feedback',
    'Generate personalized learning feedback for a student based on their progress, bookings, and activity.',
    generateFeedbackSchema,
    async (input) => {
      const result = await generateFeedback(input as GenerateFeedbackInput);
      return { content: [{ type: 'text' as const, text: result }] };
    },
  );

  // ── Tool: recommend_content ───────────────────────────────
  server.tool(
    'recommend_content',
    "Recommend courses, teachers, and events tailored to a student's instruments, style preferences, and skill level.",
    recommendContentSchema,
    async (input) => {
      const result = await recommendContent(input as RecommendContentInput);
      return { content: [{ type: 'text' as const, text: result }] };
    },
  );

  return server;
}

// ── HTTP / SSE Transport ──────────────────────────────────────
const app = express();
app.use(express.json());

// Map of sessionId → SSEServerTransport (one per connected client)
const transports = new Map<string, SSEServerTransport>();

app.get('/sse', async (_req, res) => {
  const transport = new SSEServerTransport('/messages', res);
  transports.set(transport.sessionId, transport);
  res.on('close', () => transports.delete(transport.sessionId));

  const server = createMcpServer();
  await server.connect(transport);
});

app.post('/messages', async (req, res) => {
  const sessionId = req.query.sessionId as string;
  const transport = transports.get(sessionId);
  if (!transport) {
    res.status(404).json({ error: 'Session not found. Connect to /sse first.' });
    return;
  }
  await transport.handlePostMessage(req, res);
});

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'mymusic-coach-mcp',
    tools: ['analyze_recording', 'evaluate_assessment', 'generate_feedback', 'recommend_content'],
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`[mcp-server] Listening on port ${PORT}`);
  console.log(`[mcp-server] SSE endpoint:  http://0.0.0.0:${PORT}/sse`);
  console.log(`[mcp-server] Health check:  http://0.0.0.0:${PORT}/health`);
});
