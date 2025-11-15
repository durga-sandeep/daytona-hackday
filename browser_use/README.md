# Browser Use Automation for Style Scout AI

This directory contains automation scripts to interact with the Style Scout AI chat assistant.

**Two options available:**
- **Local version** (recommended): Uses Playwright to run locally - no cloud, no tunnel needed! ✅
- **Cloud version**: Uses Browser Use Cloud service (requires tunnel for localhost access)

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Get your Browser Use API Key:**
   - Sign up at [Browser Use Cloud](https://cloud.browser-use.com)
   - Get your API key from the dashboard

3. **Create a `.env` file:**
   ```bash
   cp .env.example .env
   ```
   
   Then add your API key:
   ```env
   BROWSER_USE_API_KEY=bu_your_api_key_here
   ```

## Usage

### 🎯 Local Version (Recommended - No Cloud, No Tunnel!)

The local version uses Playwright and can access `localhost` directly. No API keys or tunnels needed!

1. **Install Playwright browsers** (one-time setup):
   ```bash
   npx playwright install chromium
   ```

2. **Run the local automation:**
   ```bash
   npm run local
   ```
   
   Or with a custom theme:
   ```bash
   npm run local "find a luxury blazer"
   ```
   
   Or specify a custom port:
   ```bash
   node index-local.js "buy a watch" 3000
   ```

**Advantages:**
- ✅ No cloud service needed
- ✅ No API keys required
- ✅ No tunnel setup required
- ✅ Works directly with localhost
- ✅ Free and open source
- ✅ Runs in your local browser (you can watch it!)

### ☁️ Cloud Version (Browser Use Cloud)

Requires API key and tunnel setup (see below).

### Basic Usage (default theme: "buy a watch")
```bash
npm start
```

### Custom Theme
```bash
node index.js "find a luxury blazer"
```

Or:
```bash
node index.js "looking for designer sneakers"
```

### Run with Example Themes
```bash
node examples.js
```

This will randomly select a theme from predefined examples and run the automation.

### 🌐 Style Sparkle Assistant Automation

Automate the Style Sparkle Assistant website (public URL - no tunnel needed!):

```bash
npm run style-scout
```

**What it does:**
1. Navigates to https://style-sparkle-assistant.lovable.app/
2. Logs in with username "admin" and password "admin"
3. Clicks on "Men shopping" navigation
4. Opens the chat assistant (bottom right corner)
5. Sends "Hi" message to the assistant

**Prerequisites:**
- Browser Use Cloud API key (set in `.env` file)
- No tunnel needed since it's a public website!

## How It Works

1. **Creates a tunnel** to expose your local server to the internet (required for Browser Use Cloud)
2. Navigates to your site's `/men` page via the tunnel URL
3. Clicks the chat assistant button (bottom right corner)
4. Waits for the chat window to open
5. Has a natural conversation with the assistant based on the provided theme
6. Continues the conversation for multiple exchanges

## Prerequisites

- Your frontend server must be running on `http://localhost:8080` (or your custom port)
- Your backend server must be running on `http://localhost:3001`
- **For local version**: Just install Playwright (`npx playwright install chromium`)
- **For cloud version**: You need a valid Browser Use Cloud API key

## Important: Localhost Access

**Browser Use Cloud runs on remote servers and cannot access `localhost` directly!**

You need to expose your local server using a tunnel. Here's how:

### Option 1: Use Cloudflare Tunnel (Recommended - No Password!)

1. **Install cloudflared** (one-time setup):
   ```bash
   # macOS
   brew install cloudflare/cloudflare/cloudflared
   
   # Or download from: https://github.com/cloudflare/cloudflared/releases
   ```

2. **Start your tunnel** (in a separate terminal):
   ```bash
   npm run tunnel
   ```
   This will create a public URL like `https://abc123.trycloudflare.com`

3. **Copy the tunnel URL** and use it when running the automation:
   ```bash
   node index.js "buy a watch" https://abc123.trycloudflare.com
   ```

   Or set it as an environment variable:
   ```bash
   export BROWSER_USE_URL=https://abc123.trycloudflare.com
   node index.js "buy a watch"
   ```

4. **Keep the tunnel running** while the automation executes

### Option 2: Use ngrok (Alternative)

If you prefer ngrok:

1. Install ngrok: https://ngrok.com/download
2. Start tunnel: `ngrok http 8080`
3. Use the ngrok URL: `node index.js "buy a watch" https://your-ngrok-url.ngrok.io`

### Option 3: Use Environment Variable

Add to your `.env` file:
```env
BROWSER_USE_URL=https://your-tunnel-url.com
```

