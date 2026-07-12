require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

(async () => {
  console.log('API key present:', !!process.env.GEMINI_API_KEY);
  for (const name of ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest', 'gemini-1.5-flash']) {
    try {
      const m = genAI.getGenerativeModel({ model: name });
      const r = await m.generateContent('Reply with just: OK');
      console.log('✅ WORKS:', name, '->', r.response.text().trim());
    } catch (e) {
      console.log('❌ FAILS:', name, '->', e.message.split('\n')[0]);
    }
  }
})();