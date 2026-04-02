/**
 * NESTchat — Gateway Integration Snippet
 *
 * Add this to your chat handler (e.g. gateway/src/chat.ts)
 * after the streaming response completes.
 *
 * This persists messages in the background without blocking the response.
 */

// ─── Session Key Generation ─────────────────────────────────────────────────
// Generate a stable session key from the first user message + date
// This deduplicates naturally — same conversation = same key

const firstUserMsg = body.messages.find((m: any) => m.role === 'user');
const sessionKey = firstUserMsg
  ? `chat-${new Date().toISOString().split('T')[0]}-${String(firstUserMsg.content).slice(0, 50).replace(/[^a-zA-Z0-9]/g, '').slice(0, 20)}`
  : `chat-${Date.now()}`;

// ─── Persistence (add after final response is ready) ────────────────────────

if (ctx) {
  const persistMessages = body.messages.map((m: any) => ({
    role: m.role,
    content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content)
  }));
  // Add the assistant's final response
  persistMessages.push({ role: 'assistant', content: finalContent });

  // Fire and forget — doesn't block the response to the user
  ctx.waitUntil(
    executeTool('nestchat_persist', {
      session_id: sessionKey,
      room: 'chat', // or 'workshop', 'porch', etc.
      messages: persistMessages
    }, env)
  );
}
