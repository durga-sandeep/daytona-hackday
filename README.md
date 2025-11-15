# AutoHeal

**Test production sites like a human, fix issues like an AI.** Automate the entire QA lifecycle of production sites end-to-end. UI/AI testing → root-cause analysis → automated fixing → re-testing

## Inspiration

Our original vision was to automate the entire QA lifecycle end-to-end—testing → root-cause analysis → automated fixing → re-testing. This continuous self-healing loop, which we call AutoHeal, aims to eliminate the traditional dependence on manual debugging and human-in-the-loop intervention. At scale—across many websites and thousands of eval cases—manual RCA and fixing simply doesn't hold up.

But while building toward this vision, we ran into a critical limitation of traditional browser automation agents: they start blind. When an agent lands on a homepage, login screen, or dashboard, it has no understanding of the site’s structure—no knowledge of where pages live, what components exist, where the AI assistant appears, or which paths lead to which actions. This lack of context forces agents to wander, waste steps, and make uninformed decisions, compromising every part of the testing process.

This led to a key insight: before any testing can begin, agents need context—just like a human QA tester who first explores the product to understand its layout and behavior. So we built Website Exploration, an automated system that maps the entire site structure upfront. It creates a rich, agent-friendly blueprint that describes pages, navigation paths, UI components, and the location of dynamic elements like AI assistants.

## What it does

AutoHeal automates comprehensive QA testing and fixing for production websites. It tests production sites like a human would, but fixes issues like an AI—all in a single command.

**Key Capabilities:**
- **Website Exploration**: Maps entire website structures before testing begins, providing agents with context about pages, components, and navigation paths
- **Comprehensive Testing**: Tests both UI elements (buttons, layouts) and functional components (AI assistants, guardrails, user flows) using browser-use agents
- **Root Cause Analysis**: Analyzes trace logs to identify the underlying causes of issues, not just symptoms
- **Automated Fixing**: Generates and applies code fixes automatically using AI-powered analysis
- **Continuous Validation**: Retests after fixes to verify issues are resolved

**The Complete Flow:**
```
Launch Website → Explore & Map Website → Run Browser Agent Tests → Detect Issues → RCA Analysis → Auto-Fix Code → Retest → Verify Fix
```

## How we built it

AutoHeal combines three powerful components:

**1. Website Exploration (Context Mapping)**
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
- OpenAI/Claude SDK for code analysis and fixing
- Graph-based context mapping system
- Trace log analysis and RCA

## Challenges we ran into

1. **Context Format for Agents**: Creating context representations that agents can actually use for decision-making, not just human-readable documentation. We solved this by generating structured, selector-rich context files optimized for agent consumption.

2. **Balancing Exploration vs. Testing**: Ensuring the exploration phase doesn't waste time while still providing comprehensive context. We optimized the exploration agent to be goal-agnostic but efficient.

3. **Integration Complexity**: Connecting multiple systems (browser automation, context mapping, code analysis) into a seamless workflow required careful orchestration and error handling.


## Accomplishments that we're proud of

- **Built a working end-to-end system** that goes from website exploration to automated fixing in a single workflow
- **Created agent-friendly context mapping** that dramatically improves browser agent navigation efficiency and consistency
- **Demonstrated the full cycle** working on real production websites, proving the concept is viable
- **Reduced testing time** by providing agents with context upfront, eliminating wasted exploration steps

## What we learned

- **Context is King**: Providing structured context upfront dramatically improves agent performance and reduces wasted steps
- **Agent-Friendly Formats Matter**: The format of context information significantly impacts how well agents can use it
- **End-to-End Automation Works**: The full cycle from testing to fixing can be automated, creating a self-healing testing system

## What's next for AutoHeal

- **Expand Evaluation Themes**: Support more comprehensive evaluation types (accessibility, performance, security)
- **Multi-Agent Orchestration**: Coordinate multiple testing agents running different evaluation themes in parallel
- **Enhanced Context Mapping**: Automatically generate context maps from website analysis instead of manual definition/static generation
- **Fix Verification Pipeline**: More sophisticated retesting and validation to ensure fixes don't introduce regressions
- **Integration with CI/CD**: Embed AutoHeal into deployment pipelines for continuous quality assurance
- **Support for Complex Websites**: Handle dynamic SPAs, multi-step forms, and complex user flows more effectively