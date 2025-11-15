import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { init, wrapOpenAI, flush, getLogger } from 'galileo';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Galileo info endpoint - returns project and log stream URLs
app.get('/api/galileo/info', (req, res) => {
  try {
    const galileoLogger = getLogger();
    const galileoConsoleUrl = (process.env.GALILEO_CONSOLE_URL ?? 'https://app.galileo.ai').replace(/\/+$/, '');
    const projectUrl = `${galileoConsoleUrl}/project/${galileoLogger.client.projectId}`;
    const logStreamUrl = `${projectUrl}/log-streams/${galileoLogger.client.logStreamId}`;
    
    res.json({
      projectId: galileoLogger.client.projectId,
      logStreamId: galileoLogger.client.logStreamId,
      projectUrl,
      logStreamUrl,
      consoleUrl: galileoConsoleUrl,
      note: 'View evaluation metrics and insights in the Galileo Console. Configure metrics in Settings > Integrations.'
    });
  } catch (err) {
    res.status(500).json({ 
      error: 'Galileo logger not initialized',
      message: err.message 
    });
  }
});

// Galileo insights export endpoint - fetches insights and saves to local folder
app.post('/api/galileo/export-insights', async (req, res) => {
  try {
    const galileoLogger = getLogger();
    const galileoApiKey = process.env.GALILEO_API_KEY;
    const galileoConsoleUrl = (process.env.GALILEO_CONSOLE_URL ?? 'https://app.galileo.ai').replace(/\/+$/, '');
    const apiBaseUrl = galileoConsoleUrl.replace('app.', 'api.'); // Convert console URL to API URL
    
    if (!galileoApiKey) {
      return res.status(400).json({ error: 'GALILEO_API_KEY not configured' });
    }

    const projectId = galileoLogger.client.projectId;
    const logStreamId = galileoLogger.client.logStreamId;

    // Create galileo_insights directory if it doesn't exist
    const insightsDir = path.join(__dirname, '..', 'galileo_insights');
    if (!fs.existsSync(insightsDir)) {
      fs.mkdirSync(insightsDir, { recursive: true });
    }

    // Fetch traces/spans from Galileo API
    // Note: This is a simplified version - you may need to adjust the API endpoint based on Galileo's actual API
    const tracesResponse = await fetch(
      `${apiBaseUrl}/api/v1/projects/${projectId}/log-streams/${logStreamId}/spans`,
      {
        headers: {
          'Authorization': `Bearer ${galileoApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!tracesResponse.ok) {
      // If the API endpoint doesn't work, try alternative approach
      console.warn('Direct API call failed, trying alternative method...');
      
      // Save a note about manual export
      const exportNote = {
        timestamp: new Date().toISOString(),
        projectId,
        logStreamId,
        note: 'To export insights, use the Galileo Console UI:',
        steps: [
          '1. Go to https://app.galileo.ai',
          `2. Navigate to Project: ${projectId}`,
          `3. Open Log Stream: ${logStreamId}`,
          '4. Click on "Data" tab',
          '5. Click "Export" button',
          '6. Choose CSV or JSONL format',
          '7. Download and save to galileo_insights folder'
        ],
        apiUrl: `${galileoConsoleUrl}/project/${projectId}/log-streams/${logStreamId}`,
        alternative: 'You can also use the Galileo SDK to fetch traces programmatically'
      };

      const notePath = path.join(insightsDir, `export-instructions-${Date.now()}.json`);
      fs.writeFileSync(notePath, JSON.stringify(exportNote, null, 2));

      return res.json({
        success: true,
        message: 'Export instructions saved. See galileo_insights folder.',
        file: notePath,
        note: 'Direct API access may require different endpoints. Check Galileo API docs for the correct endpoint.',
        manualSteps: exportNote.steps
      });
    }

    const tracesData = await tracesResponse.json();
    
    // Fetch insights if available (this endpoint may vary)
    let insightsData = null;
    try {
      const insightsResponse = await fetch(
        `${apiBaseUrl}/api/v1/projects/${projectId}/insights`,
        {
          headers: {
            'Authorization': `Bearer ${galileoApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (insightsResponse.ok) {
        insightsData = await insightsResponse.json();
      }
    } catch (err) {
      console.warn('Could not fetch insights:', err.message);
    }

    // Save traces to JSON file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const tracesPath = path.join(insightsDir, `traces-${timestamp}.json`);
    fs.writeFileSync(tracesPath, JSON.stringify(tracesData, null, 2));

    // Save insights if available
    let insightsPath = null;
    if (insightsData) {
      insightsPath = path.join(insightsDir, `insights-${timestamp}.json`);
      fs.writeFileSync(insightsPath, JSON.stringify(insightsData, null, 2));
    }

    res.json({
      success: true,
      message: 'Insights exported successfully',
      directory: insightsDir,
      files: {
        traces: tracesPath,
        ...(insightsPath && { insights: insightsPath })
      },
      tracesCount: tracesData?.data?.length || tracesData?.length || 0,
      insightsCount: insightsData?.data?.length || insightsData?.length || 0
    });

  } catch (error) {
    console.error('Error exporting insights:', error);
    res.status(500).json({
      error: 'Failed to export insights',
      message: error.message,
      note: 'You can manually export from the Galileo Console UI'
    });
  }
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

    // Get Galileo trace information
    let galileoInfo = null;
    try {
      const galileoLogger = getLogger();
      const galileoConsoleUrl = (process.env.GALILEO_CONSOLE_URL ?? 'https://app.galileo.ai').replace(/\/+$/, '');
      const projectUrl = `${galileoConsoleUrl}/project/${galileoLogger.client.projectId}`;
      const logStreamUrl = `${projectUrl}/log-streams/${galileoLogger.client.logStreamId}`;
      
      galileoInfo = {
        projectUrl,
        logStreamUrl,
        consoleUrl: galileoConsoleUrl
      };
      
      console.log();
      console.log('🚀 GALILEO LOG INFORMATION:');
      console.log(`🔗 Project   : ${projectUrl}`);
      console.log(`📝 Log Stream: ${logStreamUrl}`);
      console.log(`💡 Tip: Configure evaluation metrics in the Galileo Console to see insights`);
    } catch (err) {
      // Silently fail if Galileo logger info is not available
      console.debug('Galileo logger info not available:', err.message);
    }

    res.json({ 
      response: aiResponse,
      galileo: galileoInfo // Include Galileo URLs in response for frontend use
    });

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
