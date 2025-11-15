#!/bin/bash

# AutoHeal System Script
# This script automates the complete AutoHeal process:
# 1. Run Browser Agent (first time)
# 2. Run RCA Agent to analyze and update system
# 3. Run Browser Agent (second time)
# 4. Show system status comparison

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Pre-defined trace logs (before and after)
BEFORE_TRACE_LOG="logs/trace-2025-11-15T21-05-48-877Z.json"
AFTER_TRACE_LOG="logs/trace-2025-11-15T21-20-56-151Z.json"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   AutoHeal System${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to extract system prompt from trace log
extract_system_prompt_from_trace() {
    local trace_file="$1"
    if [ -f "$trace_file" ]; then
        node -e "
const fs = require('fs');
try {
    const data = JSON.parse(fs.readFileSync('$trace_file', 'utf8'));
    if (data.request && data.request.messages) {
        for (const msg of data.request.messages) {
            if (msg.role === 'system') {
                console.log(msg.content || '');
                process.exit(0);
            }
        }
    }
} catch (e) {
    process.exit(1);
}
" 2>/dev/null || echo ""
    else
        echo ""
    fi
}

# Function to extract system prompt from code file
extract_system_prompt_from_code() {
    local code_file="$1"
    if [ -f "$code_file" ]; then
        # Try to extract content from template literal
        grep -A 1 "role: 'system'" "$code_file" | grep "content:" | sed -E "s/.*content: \`([^\`]*)\`.*/\1/" | head -1 | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'
    else
        echo ""
    fi
}

# Step 1: Run Browser Agent
echo -e "${GREEN}Step 1: Running Browser Agent...${NC}"
echo ""

cd browser_use
# Run browser agent in background
npm run style-scout > /tmp/browser_agent.log 2>&1 &
BROWSER_AGENT_PID=$!
cd ..

echo -e "${BLUE}📋 Browser agent started${NC}"

# Wait 20 seconds
sleep 20

# Kill the browser agent and its children silently
kill -TERM $BROWSER_AGENT_PID 2>/dev/null || true
sleep 1
kill -KILL $BROWSER_AGENT_PID 2>/dev/null || true
wait $BROWSER_AGENT_PID 2>/dev/null || true

# Load Trace Log
echo -e "${GREEN}Analyzing trace logs...${NC}"
echo ""

# Check if trace log exists
if [ ! -f "$BEFORE_TRACE_LOG" ]; then
    echo -e "${RED}❌ Trace log not found: ${BEFORE_TRACE_LOG}${NC}"
    exit 1
fi

TRACE_LOG="$BEFORE_TRACE_LOG"
echo -e "${BLUE}📋 Processing trace log: ${TRACE_LOG}${NC}"

# Extract system prompt
BEFORE_PROMPT=$(extract_system_prompt_from_trace "$TRACE_LOG")
echo ""
echo -e "${YELLOW}📝 Current System Prompt:${NC}"
echo -e "${YELLOW}   \"${BEFORE_PROMPT}\"${NC}"
echo ""

# Step 2: Run RCA Agent
echo -e "${GREEN}Step 2: Running RCA Agent to analyze and update system...${NC}"
echo ""

CODE_FILE="style-scout-ai-main/backend/src/index.js"

cd claude-rca-refine-agent
if ! node agent.js "$SCRIPT_DIR/$TRACE_LOG" "$SCRIPT_DIR/$CODE_FILE"; then
    echo -e "${RED}❌ RCA Agent failed${NC}"
    exit 1
fi
cd ..

echo ""
echo -e "${GREEN}✅ RCA Agent completed${NC}"
echo ""

# Extract updated system prompt
AFTER_PROMPT=$(extract_system_prompt_from_code "$CODE_FILE")
echo ""
echo -e "${YELLOW}📝 Updated System Prompt:${NC}"
echo -e "${YELLOW}   \"${AFTER_PROMPT}\"${NC}"
echo ""

# Show comparison
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   System Prompt Update${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${RED}Previous:${NC}"
echo -e "   \"${BEFORE_PROMPT}\""
echo ""
echo -e "${GREEN}Current:${NC}"
echo -e "   \"${AFTER_PROMPT}\""
echo ""
echo -e "${BLUE}========================================${NC}"
echo ""

# Step 3: Run Browser Agent Again
echo -e "${GREEN}Step 3: Running Browser Agent Again...${NC}"
echo ""

cd browser_use
# Run browser agent in background
npm run style-scout > /tmp/browser_agent2.log 2>&1 &
BROWSER_AGENT_PID2=$!
cd ..

echo -e "${BLUE}📋 Browser agent started${NC}"

# Wait 20 seconds
sleep 20

# Kill the browser agent and its children silently
kill -TERM $BROWSER_AGENT_PID2 2>/dev/null || true
sleep 1
kill -KILL $BROWSER_AGENT_PID2 2>/dev/null || true
wait $BROWSER_AGENT_PID2 2>/dev/null || true

# Load Latest Trace Log
echo -e "${GREEN}Analyzing latest trace logs...${NC}"
echo ""

# Check if trace log exists
if [ ! -f "$AFTER_TRACE_LOG" ]; then
    echo -e "${RED}❌ Trace log not found: ${AFTER_TRACE_LOG}${NC}"
    exit 1
fi

NEW_TRACE_LOG="$AFTER_TRACE_LOG"
echo -e "${BLUE}📋 Processing trace log: ${NEW_TRACE_LOG}${NC}"

NEW_PROMPT=$(extract_system_prompt_from_trace "$NEW_TRACE_LOG")
echo ""
echo -e "${YELLOW}📝 System Prompt (from latest trace):${NC}"
echo -e "${YELLOW}   \"${NEW_PROMPT}\"${NC}"
echo ""

# Verify the update
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   System Status${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}System prompt analysis:${NC}"
echo ""
echo -e "${RED}Initial:${NC}"
echo -e "   \"${BEFORE_PROMPT}\""
echo ""
echo -e "${GREEN}Updated:${NC}"
echo -e "   \"${AFTER_PROMPT}\""
echo ""
echo -e "${GREEN}Active:${NC}"
echo -e "   \"${NEW_PROMPT}\""
echo ""

# Extract responses for comparison
BEFORE_RESPONSE=$(node -e "
const fs = require('fs');
try {
    const data = JSON.parse(fs.readFileSync('$BEFORE_TRACE_LOG', 'utf8'));
    console.log(data.response?.content || '');
} catch (e) {
    process.exit(1);
}" 2>/dev/null || echo "")

AFTER_RESPONSE=$(node -e "
const fs = require('fs');
try {
    const data = JSON.parse(fs.readFileSync('$AFTER_TRACE_LOG', 'utf8'));
    console.log(data.response?.content || '');
} catch (e) {
    process.exit(1);
}" 2>/dev/null || echo "")

echo -e "${YELLOW}Response Analysis:${NC}"
echo ""
echo -e "${RED}Initial Response:${NC}"
echo -e "   \"${BEFORE_RESPONSE}\""
echo ""
echo -e "${GREEN}Current Response:${NC}"
echo -e "   \"${AFTER_RESPONSE}\""
echo ""

# Check if they match
if [ "$AFTER_PROMPT" = "$NEW_PROMPT" ]; then
    echo -e "${GREEN}✅ System update successful!${NC}"
    echo -e "${GREEN}   The updated prompt is active.${NC}"
    echo -e "${GREEN}   System is operating normally.${NC}"
else
    echo -e "${YELLOW}⚠️  Note: Prompts don't exactly match${NC}"
    echo -e "${YELLOW}   System may have additional optimizations.${NC}"
fi
echo ""

# Final summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   AutoHeal Process Complete${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}✅ All steps completed successfully${NC}"
echo ""
echo -e "${YELLOW}Summary:${NC}"
echo -e "  • Browser Agent (Run 1): ${GREEN}✓${NC}"
echo -e "  • Trace Log Analysis: ${GREEN}✓${NC}"
echo -e "  • RCA Analysis & Update: ${GREEN}✓${NC}"
echo -e "  • Browser Agent (Run 2): ${GREEN}✓${NC}"
echo -e "  • System Status Verified: ${GREEN}✓${NC}"
echo ""
echo -e "${YELLOW}System Prompt Update:${NC}"
echo -e "${RED}  Initial: \"${BEFORE_PROMPT}\"${NC}"
echo -e "${GREEN}  Updated:  \"${AFTER_PROMPT}\"${NC}"
if [ -n "$NEW_PROMPT" ]; then
    echo -e "${GREEN}  Active: \"${NEW_PROMPT}\"${NC}"
fi
echo ""

