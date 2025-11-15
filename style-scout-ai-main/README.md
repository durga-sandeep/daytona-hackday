# Style Scout AI

A luxury fashion e-commerce platform with an AI-powered shopping assistant.

## Project Structure

```
style-scout-ai/
├── src/                    # Frontend React application
├── backend/                # Node.js/Express backend API
├── public/                 # Static assets
└── README.md
```

## Technologies Used

### Frontend
- **Vite** - Build tool and dev server
- **React** - UI library
- **TypeScript** - Type-safe JavaScript
- **shadcn-ui** - UI component library
- **Tailwind CSS** - Utility-first CSS framework

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **OpenAI API** - AI chat assistant powered by GPT-4o-mini
- **CORS** - Cross-origin resource sharing

## Getting Started

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- OpenAI API key - [get one here](https://platform.openai.com/api-keys)

### Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd style-scout-ai
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Configure backend environment**

   Create a `.env` file in the `backend/` directory:
   ```bash
   cd backend
   cp .env.example .env
   ```

   Edit `backend/.env` and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=sk-your-actual-openai-api-key-here
   PORT=3001
   FRONTEND_URL=http://localhost:8080
   ```

### Running the Application

You need to run both the frontend and backend servers:

1. **Start the backend server** (in one terminal):
   ```bash
   cd backend
   npm run dev
   ```

   Backend will run on: http://localhost:3001

2. **Start the frontend dev server** (in another terminal):
   ```bash
   npm run dev
   ```

   Frontend will run on: http://localhost:8080

3. **Access the application**

   Open your browser and navigate to: http://localhost:8080

### Verify Backend is Running

Test the backend health endpoint:
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{"status":"ok","message":"Style Scout AI Backend is running"}
```

## Features

- Browse luxury fashion items
- AI-powered chat assistant for personalized shopping recommendations
- Style advice and outfit coordination
- Fashion trend insights
- Premium shopping experience

## API Endpoints

### Backend API

- **GET** `/health` - Health check endpoint
- **POST** `/api/chat` - Chat with AI assistant
  - Request body: `{ message: string, history: Message[] }`
  - Response: `{ response: string }`

## Development

- Frontend runs on port **8080** (configured in [vite.config.ts](vite.config.ts))
- Backend runs on port **3001** (configured in [backend/.env](backend/.env))
- CORS is configured to allow requests from the frontend

## Troubleshooting

### "Failed to fetch" error in chat

1. Ensure backend server is running on port 3001
2. Check that `backend/.env` has `FRONTEND_URL=http://localhost:8080`
3. Verify OpenAI API key is set in `backend/.env`
4. Restart backend server after changing `.env` file

### Chat not responding

1. Check backend logs for errors
2. Verify OpenAI API key is valid and has credits
3. Check browser console for network errors

## License

All rights reserved.
