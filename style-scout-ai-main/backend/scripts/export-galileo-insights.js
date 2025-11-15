#!/usr/bin/env node

/**
 * Standalone script to export Galileo insights to local folder
 * Usage: node scripts/export-galileo-insights.js
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { init, getLogger } from 'galileo';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function exportInsights() {
  try {
    console.log('🚀 Starting Galileo insights export...\n');

    // Initialize Galileo
    init({
      project: process.env.GALILEO_PROJECT || 'StyleScoutAI',
      logStream: process.env.GALILEO_LOG_STREAM || 'ChatAssistant',
    });

    const galileoLogger = getLogger();
    const galileoApiKey = process.env.GALILEO_API_KEY;
    const galileoConsoleUrl = (process.env.GALILEO_CONSOLE_URL ?? 'https://app.galileo.ai').replace(/\/+$/, '');

    if (!galileoApiKey) {
      console.error('❌ Error: GALILEO_API_KEY not found in .env file');
      process.exit(1);
    }

    const projectId = galileoLogger.client.projectId;
    const logStreamId = galileoLogger.client.logStreamId;

    console.log(`📊 Project ID: ${projectId}`);
    console.log(`📝 Log Stream ID: ${logStreamId}\n`);

    // Create galileo_insights directory
    const insightsDir = path.join(__dirname, '..', 'galileo_insights');
    if (!fs.existsSync(insightsDir)) {
      fs.mkdirSync(insightsDir, { recursive: true });
      console.log(`✅ Created directory: ${insightsDir}\n`);
    }

    // Try to fetch from Galileo API
    const apiBaseUrl = galileoConsoleUrl.replace('app.', 'api.');
    console.log(`🔍 Attempting to fetch insights from Galileo API...\n`);

    // Fetch insights (adjust endpoint based on actual Galileo API)
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
        const insightsData = await insightsResponse.json();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const insightsPath = path.join(insightsDir, `insights-${timestamp}.json`);
        
        fs.writeFileSync(insightsPath, JSON.stringify(insightsData, null, 2));
        console.log(`✅ Insights exported successfully!`);
        console.log(`📁 File: ${insightsPath}`);
        console.log(`📊 Insights count: ${insightsData?.data?.length || insightsData?.length || 0}\n`);
      } else {
        throw new Error(`API returned status ${insightsResponse.status}`);
      }
    } catch (apiError) {
      console.warn(`⚠️  Direct API access failed: ${apiError.message}\n`);
      console.log('📋 Creating manual export instructions...\n');

      // Create instructions file
      const instructions = {
        timestamp: new Date().toISOString(),
        projectId,
        logStreamId,
        consoleUrl: `${galileoConsoleUrl}/project/${projectId}/log-streams/${logStreamId}`,
        instructions: {
          method1: {
            title: 'Export via Galileo Console UI',
            steps: [
              `1. Open: ${galileoConsoleUrl}/project/${projectId}/log-streams/${logStreamId}`,
              '2. Click on the "Data" tab',
              '3. Select the traces you want to export (or leave all selected)',
              '4. Click the "Export" button',
              '5. Choose format: CSV or JSONL',
              '6. Download the file',
              `7. Save it to: ${insightsDir}`
            ]
          },
          method2: {
            title: 'View Insights in Console',
            steps: [
              `1. Open: ${galileoConsoleUrl}/project/${projectId}/log-streams/${logStreamId}`,
              '2. Click on "Insights" tab',
              '3. View insights like "Ignored Bye Instruction"',
              '4. Click "View Affected Spans" to see details',
              '5. Take screenshots or copy insights manually'
            ]
          }
        },
        note: 'The Galileo API endpoints may require authentication or different endpoints. Check Galileo API documentation for programmatic access.'
      };

      const instructionsPath = path.join(insightsDir, `export-instructions-${Date.now()}.json`);
      fs.writeFileSync(instructionsPath, JSON.stringify(instructions, null, 2));

      console.log(`✅ Export instructions saved!`);
      console.log(`📁 File: ${instructionsPath}\n`);
      console.log('💡 To export insights manually:');
      console.log(`   1. Visit: ${instructions.consoleUrl}`);
      console.log('   2. Go to "Data" tab → Click "Export"');
      console.log('   3. Or view "Insights" tab for detailed insights\n');
    }

    console.log(`📂 All files saved to: ${insightsDir}`);
    console.log('✨ Done!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

exportInsights();

