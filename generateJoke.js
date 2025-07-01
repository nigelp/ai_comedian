const Groq = require('groq-sdk');

async function generateJoke(prompt, apiKey, selectedModel = 'llama-3.3-70b-versatile', enableReasoning = false) {
  if (!apiKey) {
    throw new Error('Groq API key is missing. Please configure it in the application settings.');
  }

  const groq = new Groq({
    apiKey: apiKey,
  });

  // Prepare the request parameters
  const requestParams = {
    messages: [{ role: 'user', content: prompt }],
    model: selectedModel,
    temperature: 0.8,
    max_tokens: 1024,
    top_p: 0.9,
    stream: false,
  };

  // Handle reasoning parameter based on model support
  if (selectedModel.includes('qwen')) {
    // Qwen models support reasoning - explicitly disable it
    requestParams.reasoning_effort = 'none';
  } else if (selectedModel === 'deepseek-r1-distill-llama-70b') {
    // DeepSeek model (if it were enabled)
    if (enableReasoning) {
      requestParams.reasoning_effort = 'medium';
    } else {
      requestParams.reasoning_effort = 'none';
    }
  }
  // For Llama models, don't include reasoning_effort parameter at all as they don't support it

  const chatCompletion = await groq.chat.completions.create(requestParams);

  return chatCompletion.choices[0].message.content.trim();
}

module.exports = generateJoke;
