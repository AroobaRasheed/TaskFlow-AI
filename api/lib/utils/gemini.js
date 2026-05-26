const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

async function callGeminiAPI(prompt, apiKey) {
  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
    }),
  });
  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
}

async function callGroqAPI(prompt, apiKey) {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });
  if (!res.ok) throw new Error(`Groq API error: ${res.status}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content?.trim() || '';
}

export async function callGemini(prompt) {
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  // Try Gemini first
  if (geminiKey) {
    try {
      return await callGeminiAPI(prompt, geminiKey);
    } catch (err) {
      console.warn('Gemini failed, trying Groq fallback:', err.message);
    }
  }

  // Fallback to Groq
  if (groqKey) {
    try {
      return await callGroqAPI(prompt, groqKey);
    } catch (err) {
      console.warn('Groq fallback also failed:', err.message);
    }
  }

  throw new Error('No AI provider available');
}
