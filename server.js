// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// In-memory conversation store: { sessionId: [ {role, content, time}, ... ] }
const conversations = {};

app.post('/chat', async (req, res) => {
    const { message, sessionId } = req.body;
    if (!message || !sessionId) {
        return res.status(400).json({ error: 'Message and sessionId are required.' });
    }
    if (!conversations[sessionId]) conversations[sessionId] = [];
    conversations[sessionId].push({ role: 'user', content: message, time: new Date().toISOString() });

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: "You are a helpful assistant." },
                ...conversations[sessionId].map(m => ({ role: m.role, content: m.content }))
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        const aiMessage = response.data.choices[0].message.content;
        conversations[sessionId].push({ role: 'assistant', content: aiMessage, time: new Date().toISOString() });
        // Save conversation to Supabase
        await supabase.from('conversations').upsert({
            conversation_id: sessionId,
            messages: conversations[sessionId],
        }, { onConflict: ['conversation_id'] });
        res.json({ reply: aiMessage });
    } catch (err) {
        res.status(500).json({ error: 'Failed to get response from OpenAI or save to Supabase.' });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
}); 