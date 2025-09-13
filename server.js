import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

// Node 18+ has global fetch; if your node version <18 install node-fetch and uncomment next line:
// import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

if (!API_KEY) {
console.warn('⚠️ GEMINI_API_KEY is not set. Set it in your .env file.');
}

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/api/generate', async (req, res) => {
try {
const idea = (req.body.idea || '').trim();
if (!idea) return res.status(400).json({ error: 'Missing idea in request body' });

if (!API_KEY) return res.status(500).json({ error: 'Server not configured with API key' });

const prompt = `Create a detailed business plan for: ${idea}. Include execution strategy, funding analysis, and legal compliance.`;

const payload = {
contents: [
{ parts: [{ text: prompt }] }
],
// optional: tune additional params like safety settings or max output length
};

const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

const apiRes = await fetch(url, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(payload)
});

const json = await apiRes.json();
// Defensive extraction of the response text
const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || JSON.stringify(json) || 'No response';

return res.json({ result: text });

} catch (err) {
console.error('Error in /api/generate:', err);
return res.status(500).json({ error: err.message || 'Server error' });
}
});

app.listen(PORT, () => {
console.log(`Server listening on http://localhost:${PORT}`);
});