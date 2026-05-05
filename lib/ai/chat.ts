// Shared chat surface used by app routes and UI
export type ChatMessage = {
  role: 'user' | 'system' | 'assistant';
  content: string;
};

export const chat = (messages: ChatMessage[]): string => {
  return messages.map(m => `[${m.role}] ${m.content}`).join('\n');
};
