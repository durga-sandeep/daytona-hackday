# Quick Start Guide

Get up and running with the Context Mapping system in 5 minutes!

## 1. Install Dependencies

```bash
cd context_mapping
npm install
```

## 2. Explore Your Website Graph

```bash
# See all pages
npm run explore:pages

# View full graph structure
npm run explore:full

# Check a specific page (e.g., login)
npm run explore:page login

# See where you can navigate from home
npm run explore:paths home
```

## 3. Generate Context Files

```bash
# Generate all context files (saved to output/ directory)
npm run context

# This creates:
# - output/full-context.md
# - output/quick-reference.md
# - output/tree-structure.txt
# - output/context.json
# - output/tree-map.html (interactive visualization)
```

## 4. Generate PNG Visualizations

```bash
# Generate PNG images (requires additional tools)
npm run png

# Or manually:
# 1. Install Puppeteer: npm install puppeteer
# 2. Run: npm run png
# 3. Or open output/tree-map.html and take a screenshot
```

## 5. Visualize the Graph

```bash
# Open the interactive HTML tree map
open output/tree-map.html

# Or generate other formats:
npm run visual:mermaid   # For Mermaid diagrams
npm run visual:dot      # For Graphviz
npm run visual:tree     # Text tree
```

## 6. Use Context Files with browser_use

Read the generated context file in your browser_use script:

```javascript
import BrowserUse from "browser-use-sdk";
import fs from 'fs';

// Read the generated context
const context = fs.readFileSync('./context_mapping/output/full-context.md', 'utf-8');

const client = new BrowserUse({ apiKey: process.env.BROWSER_USE_API_KEY });

const task = await client.tasks.create({
  task: `${context}\n\n---\n\nTASK: Navigate to men's collection and open chat`
});
```

## Key Files

- **website-graph.json** - Your website structure (edit this to update the graph)
- **context-generator.js** - Core module (use this in your code)
- **generate-context.js** - Generates all context files
- **output/** - Generated files directory

## Next Steps

1. Review `website-graph.json` to understand the structure
2. Update selectors if your website changes
3. Add new pages/components as needed
4. Use `BrowserUseWithContext` in your automation scripts

For detailed documentation, see [README.md](./README.md)

