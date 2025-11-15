import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Claude Code Agent that reads trace logs and fixes code issues
 * (Uses OpenAI models under the hood)
 */
class ClaudeCodeAgent {
  constructor() {
    const apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
    
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }

    // Initialize OpenAI client
    this.openai = new OpenAI({
      apiKey: apiKey,
    });
    
    // Use OpenAI models
    this.model = process.env.OPENAI_MODEL || process.env.CLAUDE_MODEL || 'gpt-4o-mini';
  }

  /**
   * Read trace log from file
   */
  readTraceLog(traceLogPath) {
    try {
      const traceData = fs.readFileSync(traceLogPath, 'utf8');
      return JSON.parse(traceData);
    } catch (error) {
      throw new Error(`Failed to read trace log: ${error.message}`);
    }
  }

  /**
   * Read code file that needs to be fixed
   */
  readCodeFile(filePath) {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      throw new Error(`Failed to read code file: ${error.message}`);
    }
  }

  /**
   * Analyze trace log and identify issues using OpenAI
   */
  async analyzeTraceLog(traceLog) {
    const prompt = `You are a code analysis expert. Analyze this trace log from a chat API endpoint and identify any issues or problems.

Trace Log:
${JSON.stringify(traceLog, null, 2)}

Please identify:
1. What issues or problems exist in the trace log?
2. What is the root cause?
3. What needs to be fixed in the code?

Respond in JSON format:
{
  "issues": ["issue1", "issue2"],
  "rootCause": "description",
  "fixesNeeded": ["fix1", "fix2"]
}`;

    try {
      console.log(`   Using model: claude sonnet`);
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const content = completion.choices[0].message.content;
      
      // Try to parse JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return {
        issues: [content],
        rootCause: content,
        fixesNeeded: [content]
      };
    } catch (error) {
      console.error('   API Error details:', {
        message: error.message,
        status: error.status,
        type: error.constructor?.name,
        cause: error.cause
      });
      throw new Error(`Failed to analyze trace log: ${error.message}${error.status ? ` (Status: ${error.status})` : ''}`);
    }
  }

  /**
   * Use OpenAI to fix the code based on identified issues
   */
  async fixCode(code, traceLog, analysis) {
    const prompt = `You are an expert code fixer. Fix the code based on the trace log analysis.

TRACE LOG:
${JSON.stringify(traceLog, null, 2)}

ANALYSIS:
${JSON.stringify(analysis, null, 2)}

CURRENT CODE:
\`\`\`javascript
${code}
\`\`\`

Please fix the code to resolve the issues identified in the trace log. 
- Fix the system message in the /api/chat endpoint
- Ensure the assistant is helpful and professional, not rude
- Make sure the code follows best practices

Return ONLY the fixed code, wrapped in \`\`\`javascript code blocks. Do not include any explanations outside the code block.`;

    try {
      console.log(`   Using model: claude sonnet`);
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const content = completion.choices[0].message.content;
      
      // Extract code from markdown code blocks
      const codeMatch = content.match(/```(?:javascript|js)?\n([\s\S]*?)```/);
      if (codeMatch) {
        return codeMatch[1].trim();
      }
      
      // If no code block found, return the content as-is
      return content.trim();
    } catch (error) {
      console.error('   API Error details:', {
        message: error.message,
        status: error.status,
        type: error.constructor?.name,
        cause: error.cause
      });
      throw new Error(`Failed to fix code: ${error.message}${error.status ? ` (Status: ${error.status})` : ''}`);
    }
  }

  /**
   * Write fixed code back to file
   */
  writeFixedCode(filePath, fixedCode) {
    try {
      // Create backup first
      const backupPath = `${filePath}.backup.${Date.now()}`;
      const originalCode = fs.readFileSync(filePath, 'utf8');
      fs.writeFileSync(backupPath, originalCode, 'utf8');
      console.log(`✅ Backup created: ${backupPath}`);
      
      // Write fixed code
      fs.writeFileSync(filePath, fixedCode, 'utf8');
      console.log(`✅ Fixed code written to: ${filePath}`);
    } catch (error) {
      throw new Error(`Failed to write fixed code: ${error.message}`);
    }
  }

  /**
   * Main execution method
   */
  async run(traceLogPath, codeFilePath) {
    console.log('🤖 Claude Code Agent Starting...\n');
    
    // Verify API key is set
    const apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    console.log(`🔑 API Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)} (${apiKey.length} chars)\n`);

    console.log(`📖 Reading trace log: ${traceLogPath}`);
    const traceLog = this.readTraceLog(traceLogPath);
    console.log('✅ Trace log loaded\n');

    console.log(`📖 Reading code file: ${codeFilePath}`);
    const code = this.readCodeFile(codeFilePath);
    console.log('✅ Code file loaded\n');

    console.log('🔍 Analyzing trace log with Claude Agent...');
    const analysis = await this.analyzeTraceLog(traceLog);
    console.log('✅ Analysis complete\n');
    console.log('Issues found:');
    analysis.issues?.forEach((issue, i) => {
      console.log(`  ${i + 1}. ${issue}`);
    });
    console.log(`\nRoot cause: ${analysis.rootCause}\n`);

    console.log('🔧 Fixing code with Claude Agent...');
    const fixedCode = await this.fixCode(code, traceLog, analysis);
    console.log('✅ Code fixed\n');

    console.log('💾 Writing fixed code to file...');
    this.writeFixedCode(codeFilePath, fixedCode);
    console.log('\n✨ Done! Code has been fixed.');
  }
}

// Main execution
async function main() {
  const traceLogPath = process.argv[2] || path.join(__dirname, '..', 'logs', 'trace-2025-11-15T21-05-48-877Z.json');
  const codeFilePath = process.argv[3] || path.join(__dirname, '..', 'style-scout-ai-main', 'backend', 'src', 'index.js');

  const agent = new ClaudeCodeAgent();
  
  try {
    await agent.run(traceLogPath, codeFilePath);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    console.error('\n💡 Troubleshooting tips:');
    console.error('   1. Check that OPENAI_API_KEY is set correctly');
    console.error('   2. Verify your API key is valid at https://platform.openai.com/api-keys');
    console.error('   3. Check your internet connection');
    console.error('   4. Try setting OPENAI_MODEL environment variable (e.g., gpt-4o-mini, gpt-4, gpt-4-turbo)');
    process.exit(1);
  }
}

main();

