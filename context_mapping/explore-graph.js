import ContextGenerator from './context-generator.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Graph Explorer Utility
 * 
 * Provides CLI tools to explore and visualize the website graph structure
 */
class GraphExplorer {
  constructor() {
    this.generator = new ContextGenerator();
  }

  /**
   * Display full graph structure
   */
  displayFullGraph() {
    console.log('\n' + '='.repeat(80));
    console.log('FULL WEBSITE GRAPH STRUCTURE');
    console.log('='.repeat(80) + '\n');
    
    const graph = this.generator.getGraph();
    
    console.log(`Website: ${graph.metadata.name}`);
    console.log(`Base URL: ${graph.metadata.baseUrl}`);
    console.log(`Version: ${graph.metadata.version}\n`);

    // Display nodes
    console.log('NODES:');
    console.log('-'.repeat(80));
    graph.nodes.forEach((node, index) => {
      console.log(`\n${index + 1}. [${node.type.toUpperCase()}] ${node.name} (ID: ${node.id})`);
      if (node.route) {
        console.log(`   Route: ${node.route}`);
      }
      console.log(`   Description: ${node.description}`);
      
      if (node.requiresAuth !== undefined) {
        console.log(`   Requires Auth: ${node.requiresAuth}`);
      }
      
      if (node.elements && node.elements.length > 0) {
        console.log(`   Elements: ${node.elements.length}`);
        node.elements.forEach((el, i) => {
          console.log(`     ${i + 1}. ${el.description} (${el.type})`);
          if (el.selector) {
            console.log(`        Selector: ${el.selector}`);
          }
        });
      }
    });

    // Display edges
    console.log('\n\nEDGES (Navigation & Interactions):');
    console.log('-'.repeat(80));
    graph.edges.forEach((edge, index) => {
      const fromNode = graph.nodes.find(n => n.id === edge.from);
      const toNode = graph.nodes.find(n => n.id === edge.to);
      console.log(`\n${index + 1}. ${fromNode.name} → ${toNode.name}`);
      console.log(`   Type: ${edge.type}`);
      console.log(`   Trigger: ${edge.trigger}`);
      console.log(`   Description: ${edge.description}`);
    });

    // Display authentication
    console.log('\n\nAUTHENTICATION:');
    console.log('-'.repeat(80));
    const auth = graph.authentication;
    console.log(`Required: ${auth.required}`);
    console.log(`Public Pages: ${auth.publicPages.join(', ')}`);
    console.log(`Protected Pages: ${auth.protectedPages.join(', ')}`);
    if (auth.defaultCredentials) {
      console.log(`Default Credentials:`);
      console.log(`  Username: ${auth.defaultCredentials.username}`);
      console.log(`  Password: ${auth.defaultCredentials.password}`);
    }
  }

  /**
   * Display navigation paths from a specific page
   */
  displayNavigationPaths(pageId) {
    const node = this.generator.findNode(pageId);
    if (!node) {
      console.log(`\n❌ Page with ID "${pageId}" not found`);
      return;
    }

    console.log(`\n${'='.repeat(80)}`);
    console.log(`NAVIGATION PATHS FROM: ${node.name}`);
    console.log('='.repeat(80) + '\n');

    const paths = this.generator.getNavigationPaths(pageId);
    if (paths.length === 0) {
      console.log('No navigation paths found from this page.');
      return;
    }

    paths.forEach((path, index) => {
      const toNode = this.generator.findNode(path.to);
      console.log(`${index + 1}. ${path.description}`);
      console.log(`   → Navigate to: ${toNode.name} (${toNode.route})`);
      console.log(`   Trigger: ${path.trigger}\n`);
    });
  }

  /**
   * Display page details
   */
  displayPageDetails(pageId) {
    const node = this.generator.findNode(pageId);
    if (!node) {
      console.log(`\n❌ Page with ID "${pageId}" not found`);
      return;
    }

    console.log(`\n${'='.repeat(80)}`);
    console.log(`PAGE DETAILS: ${node.name}`);
    console.log('='.repeat(80) + '\n');

    console.log(`Type: ${node.type}`);
    console.log(`Route: ${node.route}`);
    console.log(`Description: ${node.description}`);
    console.log(`Requires Auth: ${node.requiresAuth ? 'Yes' : 'No'}`);

    if (node.components) {
      console.log(`\nComponents: ${node.components.join(', ')}`);
    }

    if (node.elements && node.elements.length > 0) {
      console.log(`\nElements (${node.elements.length}):`);
      node.elements.forEach((el, i) => {
        console.log(`\n  ${i + 1}. ${el.description}`);
        console.log(`     Type: ${el.type}`);
        if (el.selector) {
          console.log(`     Selector: ${el.selector}`);
        }
        if (el.placeholder) {
          console.log(`     Placeholder: ${el.placeholder}`);
        }
        if (el.text) {
          console.log(`     Text: ${el.text}`);
        }
      });
    }

    if (node.products && node.products.length > 0) {
      console.log(`\nProducts (${node.products.length}):`);
      node.products.forEach((product, i) => {
        console.log(`  ${i + 1}. ${product.name} - ${product.price} (${product.category})`);
      });
    }

    if (node.userFlow) {
      console.log(`\nUser Flow:`);
      if (node.userFlow.entryPoint) {
        console.log(`  Entry Point: Yes`);
      }
      if (node.userFlow.nextSteps && node.userFlow.nextSteps.length > 0) {
        console.log(`  Next Steps: ${node.userFlow.nextSteps.join(', ')}`);
      }
      if (node.userFlow.actions && node.userFlow.actions.length > 0) {
        console.log(`  Actions:`);
        node.userFlow.actions.forEach((action, i) => {
          console.log(`    ${i + 1}. ${action}`);
        });
      }
    }
  }

  /**
   * Generate context and save to file (deprecated - use generate-context.js instead)
   */
  generateBrowserUseContext(outputPath = null) {
    console.log('⚠️  This method is deprecated. Use "npm run context" instead.');
    const context = this.generator.generateFullContext({
      includeAuth: true,
      includeComponents: true,
      includeFlows: true
    });

    const outputFile = outputPath || path.join(__dirname, 'output', 'context.txt');
    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(outputFile, context, 'utf-8');
    console.log(`\n✅ Context generated and saved to: ${outputFile}`);
    console.log(`\nContext preview (first 500 chars):\n`);
    console.log(context.substring(0, 500) + '...\n');
  }

  /**
   * Generate task-specific context
   */
  generateTaskContext(taskDescription, outputPath = null) {
    const context = this.generator.generateTaskContext(taskDescription);
    
    if (outputPath) {
      fs.writeFileSync(outputPath, context, 'utf-8');
      console.log(`\n✅ Task context saved to: ${outputPath}`);
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('TASK-SPECIFIC CONTEXT');
    console.log('='.repeat(80));
    console.log(context);
  }

  /**
   * List all pages
   */
  listPages() {
    const graph = this.generator.getGraph();
    const pages = graph.nodes.filter(node => node.type === 'page');
    
    console.log('\n' + '='.repeat(80));
    console.log('AVAILABLE PAGES');
    console.log('='.repeat(80) + '\n');
    
    pages.forEach((page, index) => {
      console.log(`${index + 1}. ${page.name}`);
      console.log(`   ID: ${page.id}`);
      console.log(`   Route: ${page.route}`);
      console.log(`   Auth Required: ${page.requiresAuth ? 'Yes' : 'No'}`);
      console.log('');
    });
  }
}

// CLI interface
const args = process.argv.slice(2);
const explorer = new GraphExplorer();

if (args.length === 0) {
  console.log(`
Graph Explorer - Style Scout AI Context Mapping

Usage:
  node explore-graph.js [command] [options]

Commands:
  full              Display full graph structure
  pages             List all pages
  page <id>         Display details for a specific page
  paths <id>        Display navigation paths from a page
  context           Generate browser_use context file
  task <description> Generate task-specific context

Examples:
  node explore-graph.js full
  node explore-graph.js pages
  node explore-graph.js page login
  node explore-graph.js paths home
  node explore-graph.js context
  node explore-graph.js task "Navigate to men's collection and open chat"
  `);
  process.exit(0);
}

const command = args[0];

try {
  switch (command) {
    case 'full':
      explorer.displayFullGraph();
      break;
    
    case 'pages':
      explorer.listPages();
      break;
    
    case 'page':
      if (!args[1]) {
        console.log('❌ Please provide a page ID');
        process.exit(1);
      }
      explorer.displayPageDetails(args[1]);
      break;
    
    case 'paths':
      if (!args[1]) {
        console.log('❌ Please provide a page ID');
        process.exit(1);
      }
      explorer.displayNavigationPaths(args[1]);
      break;
    
    case 'context':
      explorer.generateBrowserUseContext();
      break;
    
    case 'task':
      if (!args[1]) {
        console.log('❌ Please provide a task description');
        process.exit(1);
      }
      const taskDescription = args.slice(1).join(' ');
      explorer.generateTaskContext(taskDescription);
      break;
    
    default:
      console.log(`❌ Unknown command: ${command}`);
      process.exit(1);
  }
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

