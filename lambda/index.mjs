// AWS Lambda handler for Teja AI Assistant
// Runtime: Node.js 18.x or later (uses native fetch)

export const handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle CORS preflight
  if (event.requestContext?.http?.method === 'OPTIONS' || event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { messages: history, system } = body;

    if (!history || !Array.isArray(history) || history.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing messages array' }),
      };
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    const GROQ_API_URL = process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions';

    // Fallback if no API key (for testing)
    if (!GROQ_API_KEY) {
      const latestMessage = (history[history.length - 1].content || '').toLowerCase();
      let reply = "Teja is a B.Tech CSE student and full-stack developer. Ask about projects, skills, or experience.";
      if (latestMessage.includes('campus')) reply = 'Campus Connect is a realtime campus social platform with anonymous chat, friend chat, group chat, Firebase Authentication, and Firestore for realtime sync.';
      else if (latestMessage.includes('technolog')) reply = 'Teja works with HTML, CSS, JavaScript, Firebase, Node.js, AWS, Azure, and GitHub.';
      else if (latestMessage.includes('aws')) reply = 'Teja is an AWS cloud learner with hands-on experience exploring cloud services and deployment patterns.';
      else if (latestMessage.includes('hire')) reply = 'You should hire Teja for strong frontend craftsmanship, realtime systems experience, and a focus on production-quality UX.';
      return { statusCode: 200, headers, body: JSON.stringify({ reply }) };
    }

    // Build messages array
    const apiMessages = [];
    if (system) {
      apiMessages.push({ role: 'system', content: system });
    }
    apiMessages.push(...history);

    const requestBody = {
      model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
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
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Groq API error', response.status, errText);
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: 'AI provider error' }),
      };
    }

    const data = await response.json();

    let text = '';
    if (data.choices && data.choices[0] && data.choices[0].message) {
      text = data.choices[0].message.content;
    }
    text = (text || '').toString().trim();
    if (!text) text = 'Sorry, I could not generate a response.';

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply: text }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server error' }),
    };
  }
};
