// Vercel serverless function for Teja AI Assistant
// Expects POST { messages: array, system?: string }
const fetch = global.fetch || require('node-fetch');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { messages: history, system } = req.body || {};
    if (!history || !Array.isArray(history) || history.length === 0) {
      return res.status(400).json({ error: 'Missing messages array' });
    }

    const latestMessage = history[history.length - 1].content;
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    const GROQ_API_URL = process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions';

    // If no API key present, return a helpful canned response (so local/dev works).
    if (!GROQ_API_KEY) {
      const m = (latestMessage || '').toLowerCase();
      let reply = "Teja is a B.Tech CSE student and full-stack developer. Ask about projects, skills, or experience.";
      if (m.includes('campus')) reply = 'Campus Connect is a realtime campus social platform with anonymous chat, friend chat, group chat, Firebase Authentication, and Firestore for realtime sync.';
      else if (m.includes('technolog')) reply = 'Teja works with HTML, CSS, JavaScript, Firebase, Node.js, AWS, Azure, and GitHub.';
      else if (m.includes('aws')) reply = 'Teja is an AWS cloud learner with hands-on experience exploring cloud services and deployment patterns.';
      else if (m.includes('hire')) reply = 'You should hire Teja for strong frontend craftsmanship, realtime systems experience, and a focus on production-quality UX.';

      return res.status(200).json({ reply });
    }

    // Build the messages array for Chat Completions API
    const apiMessages = [];
    if (system) {
      apiMessages.push({ role: 'system', content: system });
    }
    // Append the entire chat history
    apiMessages.push(...history);

    const body = {
      // Use a valid Groq model like llama3-8b-8192 or mixtral-8x7b-32768
      model: process.env.GROQ_MODEL || 'openai/gpt-oss-20b',
      messages: apiMessages,
      max_tokens: 512,
      temperature: 0.2,
    };

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Groq API error', response.status, errText);
      return res.status(502).json({ error: 'AI provider error' });
    }

    const data = await response.json();
    
    // Extract text from the chat completions response format
    let text = '';
    if (data.choices && data.choices[0] && data.choices[0].message) {
      text = data.choices[0].message.content;
    }
    text = (text || '').toString().trim();
    if (!text) text = 'Sorry, I could not generate a response.';

    return res.status(200).json({ reply: text });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};
