import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey || apiKey === 'your_openai_api_key_here') {
  console.error('Invalid or missing OpenAI API key. Please add a valid VITE_OPENAI_API_KEY to your .env file.');
}

export const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true // Note: In production, you should proxy requests through your backend
});

export async function generateQuestion(category: string, context?: string): Promise<string> {
  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    throw new Error('Please configure your OpenAI API key in the .env file');
  }

  try {
    const contextPrompt = context 
      ? `Consider this context about the relationship: "${context}". `
      : '';

    const prompt = `${contextPrompt}Generate a thoughtful and engaging question to ask my boyfriend in the category of "${category}". 
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

    if (!response.choices[0]?.message?.content) {
      throw new Error('No response from OpenAI');
    }

    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    if (error instanceof Error && error.message.includes('API key')) {
      throw new Error('Invalid OpenAI API key. Please check your configuration.');
    }
    throw new Error('Failed to generate question. Please try again later.');
  }
}