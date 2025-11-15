import BrowserUse from "browser-use-sdk";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Browser agent to automate Style Sparkle Assistant website
 * 
 * Tasks:
 * 1. Navigate to https://style-sparkle-assistant.lovable.app/
 * 2. Login with username "admin" and password "admin"
 * 3. Click on "Men shopping"
 * 4. Click on assistant at bottom right
 * 5. Say "Hi" to the assistant
 */
async function automateStyleScout() {
  console.log("🤖 Starting Browser Use automation for Style Sparkle Assistant\n");

  // Initialize Browser Use client
  const apiKey = process.env.BROWSER_USE_API_KEY;
  
  if (!apiKey) {
    console.error("❌ Error: BROWSER_USE_API_KEY not found in environment variables");
    console.error("Please set BROWSER_USE_API_KEY in your .env file");
    console.error("Get your API key at: https://cloud.browser-use.com");
    process.exit(1);
  }

  const client = new BrowserUse({
    apiKey: apiKey,
  });

  try {
    // Create a task with detailed instructions
    const taskDescription = `
Navigate to https://style-sparkle-assistant.lovable.app/

Then perform the following steps:
1. Find and click on the login button or link
2. Enter username "admin" in the username/email field
3. Enter password "admin" in the password field
4. Click the login/submit button to log in
5. Wait for the page to load after login
6. Find and click on "Men" or "Men shopping" navigation link/menu item
7. Wait for the Men shopping page to load
8. Find the chat assistant button in the bottom right corner of the page (it should be a fixed position button, typically with a message/chat icon)
9. Click on the assistant button to open the chat window
10. Wait for the chat input field to appear
11. Type "Hi" in the chat input field
12. Send the message by clicking the send button or pressing Enter
13. wait for the assistant to respond, note down the response and respond with same message back to the assistant

Make sure to wait for each page to fully load before proceeding to the next step.
`;

    console.log("📋 Creating browser automation task...");
    
    // Create the task first
    const task = await client.tasks.create({
      task: taskDescription,
    });

    console.log(`✅ Task created with ID: ${task.id}`);
    console.log("⏳ Monitoring task progress...\n");

    // Manually poll until task completes (avoiding stream/watch which has bug with 'created' status)
    let currentTask = task;
    let attempts = 0;
    const maxAttempts = 600; // 600 attempts * 1 second = 10 minutes max wait
    const pollInterval = 2000; // Poll every 2 seconds
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      currentTask = await client.tasks.retrieve(task.id);
      attempts++;
      
      const status = currentTask.status;
      console.log(`📊 Task status: ${status} (attempt ${attempts})`);
      
      // Handle all possible terminal states
      if (status === 'finished') {
        console.log("\n✅ Task completed successfully!");
        break;
      } else if (status === 'stopped' || status === 'paused') {
        console.log(`\n⚠️  Task ended with status: ${status}`);
        break;
      } else if (status === 'created' || status === 'started') {
        // Continue polling
        continue;
      } else {
        // Unknown status, log and continue
        console.log(`⚠️  Unknown status: ${status}, continuing to poll...`);
        continue;
      }
    }

    if (currentTask.status !== 'finished' && currentTask.status !== 'stopped' && currentTask.status !== 'paused') {
      throw new Error(`Task did not complete within expected time. Last status: ${currentTask.status}`);
    }

    console.log("\n📊 Task Output:");
    console.log(currentTask.doneOutput || currentTask.output || JSON.stringify(currentTask, null, 2));

    // Download logs and files locally
    await downloadTaskArtifacts(client, task.id, currentTask);

  } catch (error) {
    console.error("\n❌ Error during automation:", error.message);
    if (error.response) {
      console.error("Response:", error.response.data);
    }
    throw error;
  }
}

/**
 * Download logs and output files (screenshots, etc.) from Browser Use Cloud to local directory
 */
async function downloadTaskArtifacts(client, taskId, taskResult) {
  try {
    // Create downloads directory
    const downloadsDir = path.join(__dirname, 'downloads', taskId);
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }
    console.log(`\n📥 Downloading artifacts to: ${downloadsDir}\n`);

    // Download execution logs
    try {
      console.log("📋 Fetching execution logs...");
      const logsResponse = await client.tasks.getLogs(taskId);
      
      // The API returns downloadUrl, not url
      const logUrl = logsResponse.downloadUrl || logsResponse.url;
      
      if (logUrl) {
        console.log(`   Downloading logs...`);
        const logsResponse_fetch = await fetch(logUrl);
        const logsContent = await logsResponse_fetch.text();
        const logsPath = path.join(downloadsDir, 'execution-logs.log');
        fs.writeFileSync(logsPath, logsContent);
        console.log(`   ✅ Logs saved to: ${logsPath}`);
      } else {
        console.log(`   ⚠️  Logs URL not available: ${JSON.stringify(logsResponse)}`);
      }
    } catch (error) {
      console.log(`   ⚠️  Could not download logs: ${error.message}`);
    }

    // Save full task result for inspection
    const taskResultPath = path.join(downloadsDir, 'task-result.json');
    fs.writeFileSync(taskResultPath, JSON.stringify(taskResult, null, 2));
    console.log(`📄 Full task result saved to: task-result.json`);

    // Download output files (screenshots, etc.)
    // Check if task has outputFiles property
    const outputFiles = taskResult.outputFiles || taskResult.screenshots || [];
    
    console.log(`\n📸 Checking for output files...`);
    console.log(`   outputFiles type: ${typeof outputFiles}, isArray: ${Array.isArray(outputFiles)}`);
    
    if (outputFiles && Array.isArray(outputFiles) && outputFiles.length > 0) {
      console.log(`   Found ${outputFiles.length} output file(s)...`);
      
      for (let i = 0; i < outputFiles.length; i++) {
        const file = outputFiles[i];
        const fileId = file.id || file.fileId || file.file_id;
        
        if (!fileId) {
          console.log(`   ⚠️  File ${i + 1} has no ID, skipping...`);
          continue;
        }

        try {
          console.log(`   Downloading file ${i + 1}/${outputFiles.length} (ID: ${fileId})...`);
          const fileResponse = await client.tasks.getOutputFile(fileId, { task_id: taskId });
          
          // The API returns downloadUrl, not url
          const fileUrl = fileResponse.downloadUrl || fileResponse.url;
          
          if (fileUrl) {
            const fileResponse_fetch = await fetch(fileUrl);
            const fileBuffer = await fileResponse_fetch.arrayBuffer();
            
            // Determine file extension from content type or file name
            const contentType = fileResponse.contentType || file.contentType || 'image/png';
            const extension = contentType.includes('png') ? 'png' : 
                            contentType.includes('jpg') || contentType.includes('jpeg') ? 'jpg' :
                            contentType.includes('json') ? 'json' :
                            contentType.includes('csv') ? 'csv' : 'bin';
            
            const fileName = file.name || file.fileName || `output-file-${i + 1}.${extension}`;
            const filePath = path.join(downloadsDir, fileName);
            
            fs.writeFileSync(filePath, Buffer.from(fileBuffer));
            console.log(`   ✅ Saved: ${fileName}`);
          } else {
            console.log(`   ⚠️  File URL not available for file ${fileId}`);
          }
        } catch (error) {
          console.log(`   ⚠️  Could not download file ${fileId}: ${error.message}`);
        }
      }
    } else {
      console.log("   No output files found in outputFiles array");
    }

    // Check steps for embedded screenshots (base64 or file references)
    if (taskResult.steps && Array.isArray(taskResult.steps)) {
      console.log(`\n📸 Checking ${taskResult.steps.length} steps for screenshots...`);
      let screenshotCount = 0;
      
      for (let i = 0; i < taskResult.steps.length; i++) {
        const step = taskResult.steps[i];
        
        // Check for screenshot in various possible locations
        const screenshot = step.screenshot || step.screenshotData || step.image || 
                          step.browserState?.screenshot || step.state?.screenshot;
        
        if (screenshot) {
          screenshotCount++;
          let screenshotData = null;
          let extension = 'png';
          
          // Handle base64 encoded screenshots
          if (typeof screenshot === 'string') {
            if (screenshot.startsWith('data:image')) {
              // Data URL format: data:image/png;base64,...
              const matches = screenshot.match(/data:image\/(\w+);base64,(.+)/);
              if (matches) {
                extension = matches[1];
                screenshotData = Buffer.from(matches[2], 'base64');
              } else if (screenshot.startsWith('/9j/') || screenshot.length > 1000) {
                // Likely base64 without data URL prefix
                screenshotData = Buffer.from(screenshot, 'base64');
              }
            } else if (screenshot.length > 100) {
              // Try base64 decode
              try {
                screenshotData = Buffer.from(screenshot, 'base64');
              } catch (e) {
                // Not base64, might be a URL
                console.log(`   Step ${i + 1}: Screenshot appears to be a URL or other format`);
              }
            }
          }
          
          if (screenshotData) {
            const fileName = `step_${i + 1}_screenshot.${extension}`;
            const filePath = path.join(downloadsDir, fileName);
            fs.writeFileSync(filePath, screenshotData);
            console.log(`   ✅ Saved screenshot from step ${i + 1}: ${fileName}`);
          } else if (typeof screenshot === 'object' && screenshot.id) {
            // Screenshot might be a file reference with ID
            try {
              console.log(`   Step ${i + 1}: Found screenshot file reference (ID: ${screenshot.id})`);
              const fileResponse = await client.tasks.getOutputFile(screenshot.id, { task_id: taskId });
              const fileUrl = fileResponse.downloadUrl || fileResponse.url;
              
              if (fileUrl) {
                const fileResponse_fetch = await fetch(fileUrl);
                const fileBuffer = await fileResponse_fetch.arrayBuffer();
                const fileName = `step_${i + 1}_screenshot.png`;
                const filePath = path.join(downloadsDir, fileName);
                fs.writeFileSync(filePath, Buffer.from(fileBuffer));
                console.log(`   ✅ Saved screenshot from step ${i + 1}: ${fileName}`);
              }
            } catch (error) {
              console.log(`   ⚠️  Could not download screenshot from step ${i + 1}: ${error.message}`);
            }
          }
        }
      }
      
      if (screenshotCount === 0) {
        console.log(`   No screenshots found in steps array`);
      }
    }

    console.log(`\n✅ All artifacts downloaded to: ${downloadsDir}`);
  } catch (error) {
    console.error(`\n⚠️  Error downloading artifacts: ${error.message}`);
    // Don't throw - this is optional functionality
  }
}

// Run the automation
automateStyleScout()
  .then(() => {
    console.log("\n✨ Automation completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  });

