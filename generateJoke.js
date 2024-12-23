const Groq = require('groq-sdk');
const Store = require('electron-store');
const store = new Store();

async function generateJoke(prompt) {
  const apiKey = store.get('groqKey');
  if (!apiKey) {
    throw new Error('Groq API key is missing. Please configure it in the application settings.');
  }

  const groq = new Groq({
    apiKey: apiKey,
  });

  const chatCompletion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.8,
    max_tokens: 1024,
    top_p: 0.9,
    stream: false,
  });

  return chatCompletion.choices[0].message.content.trim();
}

module.exports = generateJoke;