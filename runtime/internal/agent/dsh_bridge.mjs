import { createRequire } from 'node:module';
import { realpathSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const requireHarness = createRequire(realpathSync(process.argv[1]));
const loadHarness = (name) => import(pathToFileURL(requireHarness.resolve(name)));
const { JsonRpcLineTransport } = await loadHarness('@deepseek-ai/dsh-sdk-protocol');
const { createUserMessage } = await loadHarness('@deepseek-ai/dsh-llm');

export const name = 'botinc-dsh-bridge';
export const inject = ['agents', 'llm', 'sdkAppStartup', 'loader', 'systemPrompt'];

export function apply(ctx) {
  const transport = new JsonRpcLineTransport(process.stdin, process.stdout);
  let handle;
  let options;
  let sessionId;
  let shutdownTask;
  const shutdown = () => {
    shutdownTask ??= handle?.dispose() ?? Promise.resolve();
    return shutdownTask;
  };

  ctx.on('session/event', (session, event) => {
    if (String(session.id) === sessionId) transport.notify('session.event', { sessionId, event });
  });
  ctx.on('agent/assistant-stream', ({ agent, frame }) => {
    if (String(agent.session.id) === sessionId) transport.notify('session.stream', { sessionId, frame });
  });
  ctx.on('agent/status', ({ agent, status }) => {
    if (String(agent.session.id) === sessionId) transport.notify('session.status', { sessionId, status });
  });
  ctx.on('agent/error', ({ agent, error }) => {
    if (String(agent.session.id) === sessionId) transport.notify('session.error', { sessionId, message: String(error) });
  });

  transport.onRequest(async (method, params) => {
    if (method === 'initialize') {
      if (options) throw new Error('Already initialized');
      await ctx.loader.await();
      ctx.systemPrompt.variable('botinc_persona', () => params.systemPrompt || 'You are a helpful software engineer assistant.');
      options = { provider: 'openrouter', model: params.model, ...(params.reasoningEffort ? { reasoningEffort: params.reasoningEffort } : {}) };
      await ctx.llm.resolveCallConfig(options);
      return { version: 1 };
    }
    if (method === 'session/prompt') {
      if (!options || handle) throw new Error('Expected one prompt after initialize');
      sessionId = params.sessionId;
      handle = await ctx.agents.create({ sessionId, meta: { cwd: process.cwd() }, agentOptions: options });
      const message = createUserMessage({ content: [{ type: 'text', text: params.prompt }], source: { kind: 'user' } });
      handle.agent.followup(message);
      return { messageId: message.id };
    }
    if (method === 'shutdown') {
      await shutdown();
      setImmediate(async () => {
        await transport.flush();
        await ctx.root.fiber.dispose();
        process.exit(0);
      });
      return {};
    }
    throw new Error(`Unknown method: ${method}`);
  });

  ctx.effect(() => {
    transport.start();
    return async () => {
      await shutdown();
      transport.close();
    };
  }, 'botinc.stdio');
}
