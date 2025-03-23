import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey) {
  throw new Error('Missing OpenAI API key. Please add VITE_OPENAI_API_KEY to your .env file.');
}

export const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true // Note: In production, you should proxy requests through your backend
});

export async function generateQuestion(category: string): Promise<string> {
  const prompt = `Generate a thoughtful and engaging question to ask my boyfriend in the category of "${category}". 
    The question should be personal, respectful, and encourage meaningful conversation.`;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are a relationship expert helping couples deepen their connection through meaningful conversations."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 150
  });

  return response.choices[0]?.message?.content || "What's your favorite thing about our relationship?";
}