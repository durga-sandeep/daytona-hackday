import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { init, wrapOpenAI, flush, getLogger } from 'galileo';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Galileo
// Set project and log stream names (created if they don't exist)
// You can also set these using GALILEO_PROJECT and GALILEO_LOG_STREAM environment variables
init({
  project: process.env.GALILEO_PROJECT || 'StyleScoutAI',
  logStream: process.env.GALILEO_LOG_STREAM || 'ChatAssistant',
});

// Initialize OpenAI
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Wrap OpenAI client with Galileo for automatic logging
const openai = wrapOpenAI(openaiClient);

// Middleware
// Allow CORS from any origin in cloud environment, or specific URL if set
const corsOrigin = process.env.FRONTEND_URL || process.env.CORS_ORIGIN || '*';
app.use(cors({
  origin: corsOrigin === '*' ? true : corsOrigin,
  credentials: true,
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Style Scout AI Backend is running' });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Build messages array for OpenAI
    const messages = [
      {
        role: 'system',
        content: `Say bye first to the user. You are a helpful and knowledgeable fashion shopping assistant for Style Scout AI, a luxury fashion e-commerce platform.

Your role is to:
- Help users find clothing items and accessories
- Provide personalized style advice and fashion recommendations
- Answer questions about current fashion trends
- Assist with outfit coordination and styling tips
- Help users navigate the shopping experience
- Be friendly, professional, and enthusiastic about fashion

Keep your responses concise, engaging, and helpful. Focus on creating a premium shopping experience.`
      },
      ...history,
      { role: 'user', content: message }
    ];

    console.log('Sending request to OpenAI...');

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // You can change to 'gpt-4' or 'gpt-4-turbo' for better quality
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const aiResponse = completion.choices[0].message.content;

    console.log('OpenAI response received');

    // Flush Galileo logs to ensure they're sent
    await flush();

    // Show Galileo log information (helpful for viewing traces)
    try {
      const galileoLogger = getLogger();
      const galileoConsoleUrl = (process.env.GALILEO_CONSOLE_URL ?? 'https://app.galileo.ai').replace(/\/+$/, '');
      const projectUrl = `${galileoConsoleUrl}/project/${galileoLogger.client.projectId}`;
      const logStreamUrl = `${projectUrl}/log-streams/${galileoLogger.client.logStreamId}`;
      
      console.log();
      console.log('🚀 GALILEO LOG INFORMATION:');
      console.log(`🔗 Project   : ${projectUrl}`);
      console.log(`📝 Log Stream: ${logStreamUrl}`);
    } catch (err) {
      // Silently fail if Galileo logger info is not available
      console.debug('Galileo logger info not available:', err.message);
    }

    res.json({ response: aiResponse });

  } catch (error) {
    console.error('Error in chat endpoint:', error);

    if (error.code === 'insufficient_quota') {
      return res.status(402).json({
        error: 'OpenAI API quota exceeded. Please check your billing.'
      });
    }

    if (error.status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded. Please try again in a moment.'
      });
    }

    res.status(500).json({
      error: 'An error occurred while processing your request.'
    });
  }
});

// Start server (accessible from all network interfaces)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Style Scout AI Backend running on http://0.0.0.0:${PORT}`);
  console.log(`📡 Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`💬 Chat endpoint: http://0.0.0.0:${PORT}/api/chat`);
  console.log(`🌐 Accessible from external networks`);
});
