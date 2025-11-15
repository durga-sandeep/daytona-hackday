# AutoHeal

**Test production sites like a human, fix issues like an AI. All in single command.**

## Inspiration

Traditional browser automation agents face a critical limitation: they lack context about the websites they're testing. When an agent encounters a login page or homepage, it doesn't know where the AI assistant is located, what pages exist, or how to navigate efficiently. This leads to wasted steps, inefficient testing, and agents making uninformed decisions at every click.

We realized that before any testing can begin, agents need to understand the website structure—like a human QA tester would after exploring the site. This insight led us to build a **website exploration agent** that maps the entire site structure first, creating agent-friendly context that guides subsequent testing agents to make informed navigation decisions.

Additionally, after launching a website or app, comprehensive testing is crucial—not just for UI elements like buttons and layouts, but also for functional components like AI chat assistants, guardrails, and complex user flows. Currently, this requires human-in-the-loop testing, which is time-consuming and doesn't scale. We envisioned automating the entire workflow: from testing to root cause analysis to fixing issues automatically.

## What it does

AutoHeal automates comprehensive QA testing and fixing for production websites. It tests production sites like a human would, but fixes issues like an AI—all in a single command.

**Key Capabilities:**
- **Website Exploration**: Maps entire website structures before testing begins, providing agents with context about pages, components, and navigation paths
- **Comprehensive Testing**: Tests both UI elements (buttons, layouts) and functional components (AI assistants, guardrails, user flows)
- **Root Cause Analysis**: Analyzes trace logs to identify the underlying causes of issues, not just symptoms
- **Automated Fixing**: Generates and applies code fixes automatically using AI-powered analysis
- **Continuous Validation**: Retests after fixes to verify issues are resolved

**The Complete Flow:**
```
Launch Website → Explore & Map Structure → Run Browser Agent Tests → 
Detect Issues → RCA Analysis → Auto-Fix Code → Retest → Verify Fix
```

## How we built it

AutoHeal combines three powerful components:

**1. Website Exploration Agent (Context Mapping)**
- Explores websites without any specific goal, mapping the entire structure
- Creates a graph-based representation of pages, components, and navigation paths
- Generates agent-friendly context files that guide testing agents
- Provides "future awareness"—agents know what's 2-3 clicks ahead, not just the current page

**2. Browser-Use Testing Agents**
- Execute comprehensive QA tests on production websites
- Test both UI elements and functional components (like AI assistants)
- Use context maps to navigate efficiently and make informed decisions
- Generate detailed trace logs of all interactions and issues

**3. Claude Code Agent (RCA & Auto-Fix)**
- Analyzes trace logs to perform root cause analysis
- Identifies issues in code using AI-powered analysis
- Automatically generates fixes for detected problems
- Applies fixes and creates backups before modifying code

**Tech Stack:**
- Browser-Use SDK for browser automation
- OpenAI/Claude API for code analysis and fixing
- Graph-based context mapping system
- Trace log analysis and RCA

## Challenges we ran into

1. **Context Format for Agents**: Creating context representations that agents can actually use for decision-making, not just human-readable documentation. We solved this by generating structured, selector-rich context files optimized for agent consumption.

2. **Trace Log Analysis**: Converting browser interaction traces into actionable code fixes required sophisticated prompt engineering and understanding the relationship between UI behavior and underlying code.

3. **Balancing Exploration vs. Testing**: Ensuring the exploration phase doesn't waste time while still providing comprehensive context. We optimized the exploration agent to be goal-agnostic but efficient.

4. **Integration Complexity**: Connecting multiple systems (browser automation, context mapping, code analysis) into a seamless workflow required careful orchestration and error handling.

5. **Production Testing Safety**: Testing live production websites requires careful handling to avoid disrupting real users. We implemented safeguards and focused on read-only testing where possible.

## Accomplishments that we're proud of

- **Built a working end-to-end system** that goes from website exploration to automated fixing in a single workflow
- **Created agent-friendly context mapping** that dramatically improves browser agent navigation efficiency
- **Achieved automated root cause analysis** that identifies underlying code issues from browser interaction traces
- **Implemented automated code fixing** that generates and applies fixes without human intervention
- **Demonstrated the full cycle** working on real production websites, proving the concept is viable
- **Reduced testing time** by providing agents with context upfront, eliminating wasted exploration steps

## What we learned

- **Context is King**: Providing structured context upfront dramatically improves agent performance and reduces wasted steps
- **Agent-Friendly Formats Matter**: The format of context information significantly impacts how well agents can use it
- **Automated RCA is Possible**: AI can effectively analyze traces and identify root causes, not just symptoms
- **End-to-End Automation Works**: The full cycle from testing to fixing can be automated, creating a self-healing testing system
- **Production Testing Requires Care**: Testing live websites needs careful safeguards to avoid disrupting real users

## What's next for AutoHeal

- **Expand Evaluation Themes**: Support more comprehensive evaluation types (accessibility, performance, security)
- **Multi-Agent Orchestration**: Coordinate multiple testing agents running different evaluation themes in parallel
- **Enhanced Context Mapping**: Automatically generate context maps from website analysis instead of manual definition
- **Fix Verification Pipeline**: More sophisticated retesting and validation to ensure fixes don't introduce regressions
- **Integration with CI/CD**: Embed AutoHeal into deployment pipelines for continuous quality assurance
- **Support for Complex Websites**: Handle dynamic SPAs, multi-step forms, and complex user flows more effectively
- **Real-time Monitoring**: Continuous monitoring mode that watches for issues and auto-fixes them as they appear
