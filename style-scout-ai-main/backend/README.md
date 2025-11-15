# Style Scout AI - Backend API

Node.js/Express backend with OpenAI integration for the AI chat assistant, with automatic logging via Galileo.

## Overview

This backend provides a REST API for the Style Scout AI chat assistant, powered by OpenAI's GPT-4o-mini model. All OpenAI API calls are automatically logged to Galileo for monitoring, debugging, and evaluation.

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
cp .env.example .env
```

Edit the `.env` file and add your configuration:

```env
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
GALILEO_API_KEY=your-galileo-api-key-here
PORT=3001
FRONTEND_URL=http://localhost:8080

# Optional: Customize Galileo project and log stream names
# GALILEO_PROJECT=StyleScoutAI
# GALILEO_LOG_STREAM=ChatAssistant
```

**Important:**
- Get your OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)
- Get your Galileo API key from [Galileo Console](https://app.galileo.ai/settings/api-keys)
- Make sure `FRONTEND_URL` matches your frontend port (default is `8080`)
- Galileo project and log stream will be created automatically if they don't exist

### 3. Start the Backend Server

Start the server (with auto-reload):
```bash
npm run dev
```

The server will start on `http://localhost:3001`

You should see:
```
🚀 Style Scout AI Backend running on http://localhost:3001
📡 Health check: http://localhost:3001/health
💬 Chat endpoint: http://localhost:3001/api/chat
```

## API Endpoints

### Health Check
```
GET http://localhost:3001/health
```

**Response:**
```json
{
  "status": "ok",
  "message": "Style Scout AI Backend is running"
}
```

### Chat Assistant
```
POST http://localhost:3001/api/chat
Content-Type: application/json

{
  "message": "Show me some trendy winter outfits",
  "history": [
    { "role": "assistant", "content": "Hi! How can I help you today?" },
    { "role": "user", "content": "I need fashion advice" }
  ]
}
```

**Response:**
```json
{
  "response": "I'd be happy to help you with trendy winter outfits!..."
}
```

**Request Parameters:**
- `message` (required): The user's message
- `history` (optional): Array of previous conversation messages

**Error Responses:**

400 Bad Request:
```json
{
  "error": "Message is required"
}
```

402 Payment Required:
```json
{
  "error": "OpenAI API quota exceeded. Please check your billing."
}
```

429 Too Many Requests:
```json
{
  "error": "Rate limit exceeded. Please try again in a moment."
}
```

500 Internal Server Error:
```json
{
  "error": "An error occurred while processing your request."
}
```

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | Yes | - | Your OpenAI API key |
| `GALILEO_API_KEY` | Yes | - | Your Galileo API key for logging |
| `GALILEO_PROJECT` | No | `StyleScoutAI` | Galileo project name |
| `GALILEO_LOG_STREAM` | No | `ChatAssistant` | Galileo log stream name |
| `PORT` | No | `3001` | Server port |
| `FRONTEND_URL` | No | `http://localhost:5173` | Frontend URL for CORS |

### Galileo Integration

This backend automatically logs all OpenAI API calls to Galileo for:
- **Monitoring**: Track all LLM interactions in real-time
- **Debugging**: Inspect request/response details and trace issues
- **Evaluation**: Analyze response quality and performance metrics

After making a chat request, you can view the logged trace in the [Galileo Console](https://app.galileo.ai). The trace will include:
- Full conversation history
- System prompts
- Model parameters (temperature, max_tokens, etc.)
- Response content and metadata
- Latency and token usage

To view your logs:
1. Go to [app.galileo.ai](https://app.galileo.ai)
2. Navigate to your project (default: `StyleScoutAI`)
3. Open the log stream (default: `ChatAssistant`)
4. Click on any trace to see detailed information

### Change OpenAI Model

Edit [src/index.js:61](src/index.js#L61) to change the model:

```javascript
model: 'gpt-4o-mini', // Options: 'gpt-4', 'gpt-4-turbo', 'gpt-4o-mini', 'gpt-3.5-turbo'
```

**Available models:**
- `gpt-4o-mini` - Fast and cost-effective (default)
- `gpt-4-turbo` - More capable, faster than GPT-4
- `gpt-4` - Most capable, slower
- `gpt-3.5-turbo` - Fastest, least expensive

### Customize Model Parameters

Edit [src/index.js:63-64](src/index.js#L63) to adjust response behavior:

```javascript
temperature: 0.7,  // 0.0-2.0 (higher = more creative)
max_tokens: 500,   // Maximum response length
```

### Customize the AI Prompt

Edit the system message in [src/index.js:40-51](src/index.js#L40) to customize the assistant's personality and behavior.

## Running Both Frontend and Backend

You need both servers running simultaneously:

1. **Terminal 1 - Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Terminal 2 - Start Frontend (from project root):**
   ```bash
   npm run dev
   ```

3. **Access the application:**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:3001

## CORS Configuration

The backend is configured to accept requests from the frontend. CORS settings are in [src/index.js:17-20](src/index.js#L17).

If your frontend runs on a different port, update the `FRONTEND_URL` in your `.env` file:

```env
FRONTEND_URL=http://localhost:YOUR_PORT
```

Then restart the backend server.

## Troubleshooting

### Backend won't start

1. Check that port 3001 is not already in use:
   ```bash
   lsof -i :3001
   ```

2. Verify all dependencies are installed:
   ```bash
   npm install
   ```

### "OpenAI API quota exceeded" error

- Check your OpenAI account has available credits
- Verify your API key is valid at [OpenAI Platform](https://platform.openai.com/account/api-keys)

### CORS errors in browser console

- Ensure `FRONTEND_URL` in `backend/.env` matches your frontend port
- Restart the backend server after changing `.env` file
- Check that both frontend and backend are running

### Chat not responding

1. Check backend console for error messages
2. Verify the backend health endpoint is working:
   ```bash
   curl http://localhost:3001/health
   ```
3. Check browser Network tab for failed requests
4. Ensure OpenAI API key is correctly set in `backend/.env`

## Dependencies

- **express** - Web framework
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variable management
- **openai** - OpenAI API client
- **galileo** - LLM observability and logging platform
- **nodemon** - Development auto-reload (dev dependency)

## License

All rights reserved.
