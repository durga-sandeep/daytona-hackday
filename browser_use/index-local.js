import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { resolve } from 'path';

/**
 * Local Browser Use automation using Playwright
 * This version can access localhost directly without needing a tunnel
 * @param {string} theme - The shopping theme (e.g., "buy a watch", "find a blazer")
 * @param {number} port - The local port where your app is running (default: 8080)
 */
export async function chatWithAssistantLocal(theme = "buy a watch", port = 8080) {
  const url = `http://localhost:${port}/men`;
  
  console.log(`🤖 Starting LOCAL Browser Use automation with theme: "${theme}"`);
  console.log(`🌐 Navigating to ${url}...`);
  console.log(`💻 Using local Playwright browser (no cloud/tunnel needed!)\n`);

  // Launch browser
  const browser = await chromium.launch({ 
    headless: false, // Set to true if you want headless mode
    slowMo: 500 // Slow down actions for better visibility
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();

  try {
    // Navigate to the page
    console.log(`📱 Loading page...`);
    await page.goto(url, { waitUntil: 'networkidle' });
    console.log(`✅ Page loaded\n`);

    // STEP 1: Find and click the chat assistant button
    console.log(`🔍 Looking for chat assistant button...`);
    
    // The button is fixed at bottom-6 right-6 with MessageCircle icon
    // Look for button in bottom right corner (fixed position)
    const chatButtonSelectors = [
      'button:has(svg)', // Button with SVG icon (MessageCircle)
      'button.fixed', // Fixed positioned button
      'button[class*="bottom"]', // Button with bottom positioning
    ];

    let chatButton = null;
    
    // First, try to find button by position (bottom right corner)
    const allButtons = await page.locator('button').all();
    for (const btn of allButtons) {
      try {
        const box = await btn.boundingBox();
        if (box) {
          // Check if button is in bottom right area (roughly)
          const viewport = page.viewportSize();
          if (viewport && box.y > viewport.height * 0.7 && box.x > viewport.width * 0.7) {
            chatButton = btn;
            console.log(`✅ Found chat button in bottom right corner`);
            break;
          }
        }
      } catch (e) {
        // Continue searching
      }
    }

    // If not found by position, try selectors
    if (!chatButton) {
      for (const selector of chatButtonSelectors) {
        try {
          const buttons = await page.locator(selector).all();
          for (const btn of buttons) {
            const box = await btn.boundingBox();
            if (box && box.y > 500) { // Bottom area
              chatButton = btn;
              console.log(`✅ Found chat button with selector: ${selector}`);
              break;
            }
          }
          if (chatButton) break;
        } catch (e) {
          // Try next selector
        }
      }
    }

    if (!chatButton) {
      throw new Error('Could not find chat assistant button. Make sure your app has a chat button visible.');
    }

    await chatButton.click();
    console.log(`✅ Clicked chat assistant button\n`);

    // STEP 2: Wait for chat window to open
    console.log(`⏳ Waiting for chat window to open...`);
    
    // Wait for the chat card/window to appear (it has "Shopping Assistant" title)
    try {
      await page.waitForSelector('text=Shopping Assistant', { timeout: 5000 });
      console.log(`✅ Chat window opened`);
    } catch (e) {
      console.log(`⚠️  Could not find "Shopping Assistant" title, but continuing...`);
    }
    
    await page.waitForTimeout(1000); // Give it a moment to fully render
    
    // Look for chat input field - it has placeholder "Ask me anything..."
    const chatInputSelectors = [
      'input[placeholder*="Ask me anything" i]',
      'input[placeholder*="Ask" i]',
      'input[type="text"]',
      'input',
    ];

    let chatInput = null;
    for (const selector of chatInputSelectors) {
      try {
        const inputs = await page.locator(selector).all();
        // Find the input that's visible and in the chat area
        for (const input of inputs) {
          if (await input.isVisible({ timeout: 1000 })) {
            const box = await input.boundingBox();
            if (box && box.y > 400) { // Input should be in bottom area
              chatInput = input;
              console.log(`✅ Found chat input with selector: ${selector}`);
              break;
            }
          }
        }
        if (chatInput) break;
      } catch (e) {
        // Try next selector
      }
    }

    if (!chatInput || !(await chatInput.isVisible().catch(() => false))) {
      throw new Error('Could not find chat input field. Make sure the chat window opened.');
    }

    console.log(`✅ Chat window is ready\n`);

    // STEP 3: Start conversation
    console.log(`💬 Starting conversation about: "${theme}"\n`);
    
    const conversationMessages = generateConversationMessages(theme);
    
    for (let i = 0; i < conversationMessages.length; i++) {
      const message = conversationMessages[i];
      console.log(`📤 Sending: "${message}"`);
      
      // Type the message
      await chatInput.fill(message);
      await page.waitForTimeout(500);
      
      // Find and click send button or press Enter
      // The send button has a Send icon (SVG)
      const sendButtonSelectors = [
        'button:has(svg)', // Button with Send icon
        'button[type="submit"]',
        'button:has-text("Send")',
      ];

      let sent = false;
      // Look for button near the input (should be in same container)
      const inputBox = await chatInput.boundingBox();
      if (inputBox) {
        const nearbyButtons = await page.locator('button').all();
        for (const btn of nearbyButtons) {
          try {
            const btnBox = await btn.boundingBox();
            if (btnBox && Math.abs(btnBox.y - inputBox.y) < 50) { // Same row
              const isVisible = await btn.isVisible({ timeout: 500 });
              if (isVisible && !(await btn.isDisabled().catch(() => false))) {
                await btn.click();
                sent = true;
                console.log(`✅ Clicked send button`);
                break;
              }
            }
          } catch (e) {
            // Continue
          }
        }
      }

      if (!sent) {
        // Fallback: press Enter
        await chatInput.press('Enter');
        console.log(`✅ Pressed Enter to send`);
      }

      console.log(`✅ Message sent\n`);

      // Wait for response (look for "Typing..." to disappear and response to appear)
      console.log(`⏳ Waiting for response...`);
      
      // Wait for "Typing..." indicator to disappear (means response is ready)
      try {
        await page.waitForSelector('text=Typing...', { state: 'hidden', timeout: 10000 });
      } catch (e) {
        // "Typing..." might not appear, that's okay
      }
      
      // Wait a bit more for response to fully render
      await page.waitForTimeout(2000);
      
      console.log(`📥 Response received\n`);
      
      // Wait a bit before next message
      await page.waitForTimeout(1500);
    }

    console.log(`\n✅ Conversation completed!`);
    console.log(`🎉 Automation finished successfully\n`);

    // Keep browser open for a few seconds so you can see the result
    console.log(`👀 Keeping browser open for 10 seconds so you can see the result...`);
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error(`\n❌ Error during automation:`, error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

/**
 * Generate conversation messages based on theme
 */
function generateConversationMessages(theme) {
  const lowerTheme = theme.toLowerCase();
  
  // Generate initial message
  let initialMessage = `I'm looking to ${theme}`;
  if (!theme.includes('looking') && !theme.includes('want') && !theme.includes('need')) {
    initialMessage = `I want to ${theme}`;
  }

  // Generate follow-up messages based on theme
  const followUps = [
    "What are your recommendations?",
    "Can you tell me more about the options?",
    "What's the price range?",
    "Do you have different styles available?",
    "What colors are available?",
  ];

  return [initialMessage, ...followUps.slice(0, 4)];
}

// Run if executed directly
const __filename = fileURLToPath(import.meta.url);
const isMainModule = process.argv[1] && resolve(process.argv[1]) === __filename;

if (isMainModule) {
  const theme = process.argv[2] || "buy a watch";
  const port = parseInt(process.argv[3]) || 8080;
  
  chatWithAssistantLocal(theme, port)
    .then(() => {
      console.log("\n✨ Local automation completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Error:", error.message);
      process.exit(1);
    });
}

