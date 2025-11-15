# Context Mapping System for Style Scout AI

A graph-based context mapping system that provides structured website information to browser automation agents (like browser_use) before they perform tasks. This system helps agents understand the website structure, navigation patterns, and interactive elements.

## Overview

The context mapping system represents the Style Scout AI website as a graph structure with:
- **Nodes**: Pages and components (e.g., Login page, Home page, Chat Assistant component)
- **Edges**: Navigation paths and interactions between nodes
- **Metadata**: Authentication requirements, selectors, user flows, and common patterns

## File Structure

```
context_mapping/
├── website-graph.json          # Graph structure definition (nodes, edges, metadata)
├── context-generator.js         # Core module for generating context from graph
├── generate-context.js          # Generate and save context files
├── generate-png-visualization.js # Generate PNG visualizations
├── explore-graph.js            # CLI utility to explore and visualize the graph
├── generate-visual.js          # Visual graph generator (Mermaid, DOT, text tree)
├── example-usage.js            # Usage examples
├── package.json                # Package configuration
├── output/                     # Generated files (created when running context generation)
└── README.md                   # This file
```

## Quick Start

### 1. Install Dependencies

```bash
cd context_mapping
npm install
```

### 2. Explore the Graph

```bash
# Display full graph structure
npm run explore:full

# List all pages
npm run explore:pages

# View details of a specific page
npm run explore:page login

# See navigation paths from a page
npm run explore:paths home

# Generate all context files (saved to output/ directory)
npm run context

# Generate PNG visualizations
npm run png

# Generate visual representations
npm run visual              # Generate all visual formats
npm run visual:mermaid      # Mermaid diagram syntax
npm run visual:dot         # Graphviz DOT format
npm run visual:tree        # Text tree representation

# Run usage examples
npm run example
```

### 3. Generate Task-Specific Context

```bash
# Generate context for a specific task
npm run task "Navigate to men's collection and open chat assistant"
```

## Graph Structure

### Nodes

Nodes represent pages and components:

- **Pages**: Login, Home, Men's Collection, Women's Collection
- **Components**: Navigation Bar, Chat Assistant, Product Card

Each node includes:
- Route/path information
- Interactive elements with selectors
- User flow patterns
- Authentication requirements

### Edges

Edges represent relationships:
- **Navigation**: How users move between pages
- **Interactions**: How components interact with pages

## Usage Examples

### Example 1: Using Context Generator Directly

```javascript
import ContextGenerator from './context-generator.js';

const generator = new ContextGenerator();

// Generate full context
const fullContext = generator.generateFullContext({
  includeAuth: true,
  includeComponents: true,
  includeFlows: true
});

// Generate task-specific context
const taskContext = generator.generateTaskContext(
  "Navigate to men's collection and open chat"
);

// Get quick reference
const quickRef = generator.generateQuickReference();
```

### Example 2: Generate Context Files

```javascript
import ContextFileGenerator from './generate-context.js';

const generator = new ContextFileGenerator();
generator.generateAll();

// Files are saved to output/ directory:
// - full-context.md
// - quick-reference.md
// - tree-structure.txt
// - context.json
// - tree-map.html (interactive visualization)
```

### Example 3: Use Context Files with browser_use

Use the generated context files with your browser_use script:

```javascript
import BrowserUse from "browser-use-sdk";
import fs from 'fs';

// Read the generated context file
const context = fs.readFileSync('./context_mapping/output/full-context.md', 'utf-8');

const client = new BrowserUse({ apiKey: process.env.BROWSER_USE_API_KEY });

// Include context in your task description
const task = await client.tasks.create({
  task: `
${context}

---

TASK:
Navigate to https://style-sparkle-assistant.lovable.app/
Then perform the following steps:
1. Find and click on the login button or link
2. Enter username "admin" in the username/email field
3. Enter password "admin" in the password field
4. Click the login/submit button to log in
5. Wait for the page to load after login
6. Find the chat assistant button in the bottom right corner
7. Click on the assistant button to open the chat window
8. Type "Hi, can you show me new watch collections for men" in the chat input
9. Send the message
`
});
```

## Graph Schema

### Node Structure

```json
{
  "id": "unique-node-id",
  "type": "page|component",
  "route": "/path",
  "name": "Display Name",
  "description": "Description of the node",
  "requiresAuth": true|false,
  "elements": [
    {
      "id": "element-id",
      "type": "input|button|link|container",
      "selector": "CSS selector",
      "description": "Element description"
    }
  ],
  "userFlow": {
    "entryPoint": true|false,
    "nextSteps": ["node-id-1", "node-id-2"],
    "actions": ["action 1", "action 2"]
  }
}
```

### Edge Structure

```json
{
  "from": "source-node-id",
  "to": "target-node-id",
  "type": "navigation|interaction",
  "trigger": "action that triggers navigation",
  "description": "Description of the navigation"
}
```

## Adding New Pages/Components

To add a new page or component to the graph:

1. **Add Node** to `website-graph.json`:
   ```json
   {
     "id": "new-page",
     "type": "page",
     "route": "/new-route",
     "name": "New Page",
     "description": "Description",
     "requiresAuth": true,
     "elements": [...],
     "userFlow": {...}
   }
   ```

2. **Add Edges** for navigation:
   ```json
   {
     "from": "existing-page",
     "to": "new-page",
     "type": "navigation",
     "trigger": "click_new_link",
     "description": "Navigation description"
   }
   ```

3. **Update Authentication** if needed:
   - Add to `publicPages` or `protectedPages` array

4. **Regenerate Context**:
   ```bash
   npm run context
   ```

## CLI Commands

| Command | Description |
|---------|-------------|
| `npm run explore:full` | Display complete graph structure |
| `npm run explore:pages` | List all pages |
| `npm run explore:page <id>` | Show details for a specific page |
| `npm run explore:paths <id>` | Show navigation paths from a page |
| `npm run context` | Generate all context files (saved to output/) |
| `npm run png` | Generate PNG visualizations |
| `npm run task "<description>"` | Generate task-specific context |
| `npm run visual` | Generate all visual formats (Mermaid, DOT, tree) |
| `npm run visual:mermaid` | Generate Mermaid diagram syntax |
| `npm run visual:dot` | Generate Graphviz DOT format |
| `npm run visual:tree` | Generate text tree representation |
| `npm run example` | Run usage examples |

## Generated Files

When you run `npm run context`, the following files are generated in the `output/` directory:

### full-context.md
Complete website structure documentation including:
- All pages with elements and selectors
- Global components
- Navigation flows
- Authentication details
- Common user flow patterns

### quick-reference.md
Condensed format with:
- Route list
- Key selectors
- Essential navigation paths

### tree-structure.txt
Text-based tree representation showing:
- Hierarchical page structure
- Navigation relationships
- Component locations

### context.json
Complete graph structure in JSON format for programmatic use.

### tree-map.html
Interactive HTML visualization with:
- Clickable nodes to expand details
- Color-coded pages and components
- Statistics dashboard
- Responsive design

### PNG Visualizations
Run `npm run png` to generate PNG images (requires additional tools):
- Mermaid diagram PNG (if mermaid-cli installed)
- Graphviz diagram PNG (if Graphviz installed)
- HTML screenshot PNG (if Puppeteer installed)

## Benefits

1. **Better Task Understanding**: Agents receive structured context about the website before starting
2. **Accurate Selectors**: Pre-defined selectors reduce errors
3. **Navigation Awareness**: Agents understand how pages connect
4. **Authentication Handling**: Clear auth requirements and credentials
5. **Maintainability**: Centralized website structure definition

## Best Practices

1. **Keep Graph Updated**: Update `website-graph.json` when website structure changes
2. **Use Specific Selectors**: Prefer IDs and data attributes over class names
3. **Document User Flows**: Include common patterns in `commonPatterns`
4. **Test Context**: Generate context and verify it's accurate before using
5. **Version Control**: Track changes to the graph structure

## Troubleshooting

### Context not generating
- Check that `website-graph.json` is valid JSON
- Verify file paths are correct

### Selectors not working
- Update selectors in `website-graph.json`
- Use browser DevTools to verify selectors
- Prefer stable selectors (IDs) over CSS classes

### Navigation paths incorrect
- Verify edges in `website-graph.json`
- Check that node IDs match between edges

## Visual Representations

### HTML Tree Map (Recommended)
The easiest way to visualize the graph is the interactive HTML tree map:

```bash
npm run context
# Then open output/tree-map.html in your browser
```

This provides an interactive, clickable visualization with expandable nodes.

### PNG Generation
Generate PNG images from the graph:

```bash
npm run png
```

This attempts multiple methods:
1. **Mermaid CLI**: `npm install -g @mermaid-js/mermaid-cli`
2. **Graphviz**: `brew install graphviz` (macOS) or `apt-get install graphviz` (Linux)
3. **Puppeteer**: `npm install puppeteer` (screenshots HTML tree map)

### Other Formats
```bash
npm run visual:mermaid  # Mermaid syntax (view at https://mermaid.live/)
npm run visual:dot      # Graphviz DOT (view at https://dreampuf.github.io/GraphvizOnline/)
npm run visual:tree     # Text tree representation
```

## Output Directory

All generated files are saved to the `output/` directory:
- Context files (`.md`, `.txt`, `.json`)
- HTML visualizations (`.html`)
- PNG images (`.png`) - if generation tools are installed

The `output/` directory is gitignored and created automatically when you run `npm run context`.

## Future Enhancements

- [ ] Automatic graph generation from website analysis
- [ ] Integration with other browser automation tools
- [ ] Graph validation and linting
- [ ] Version history for graph changes
- [ ] Export to PlantUML format
- [ ] Interactive web-based graph editor

## License

MIT

