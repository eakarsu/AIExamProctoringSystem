const axios = require('axios');

async function analyzeWithAI(prompt, systemMessage) {
  try {
    const response = await axios.post(
      `${process.env.OPENROUTER_BASE_URL}/chat/completions`,
      {
        model: 'anthropic/claude-3-5-sonnet-20241022',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1024,
        temperature: 0.3,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'AI Exam Proctoring System',
        },
      }
    );

    const content = response.data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No content in AI response');
    }

    return content;
  } catch (err) {
    console.error('AI Service Error:', err.response?.data || err.message);
    throw new Error(`AI analysis failed: ${err.message}`);
  }
}

module.exports = { analyzeWithAI };
