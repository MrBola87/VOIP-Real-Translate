import axios from 'axios';

const apiKey = 'YOUR_API_KEY'; // Replace with your OpenAI or other translation API key

async function translateText(text, sourceLang, targetLang) {
  try {
    const response = await axios.post('https://api.openai.com/v1/translate', {
      prompt: `Translate this text from ${sourceLang} to ${targetLang}: ${text}`,
      model: 'gpt-4o', // Use the appropriate model or translation service
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      }
    });
    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error('Translation Error:', error);
    return text; // Return the original text in case of an error
  }
}

export default translateText;
