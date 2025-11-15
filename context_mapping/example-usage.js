/**
 * Example Usage of Context Mapping System
 * 
 * This file demonstrates various ways to use the context mapping system
 * with browser_use automation.
 */

import ContextGenerator from './context-generator.js';
import ContextFileGenerator from './generate-context.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Example 1: Generate and save context to file
function example1_generateContextFile() {
  console.log('\n=== Example 1: Generate Context File ===\n');
  
  const generator = new ContextGenerator();
  const context = generator.generateFullContext();
  
  const outputPath = path.join(__dirname, 'generated-context.txt');
  fs.writeFileSync(outputPath, context, 'utf-8');
  
  console.log(`✅ Context saved to: ${outputPath}`);
  console.log(`📊 Context length: ${context.length} characters\n`);
}

// Example 2: Generate task-specific context
function example2_taskSpecificContext() {
  console.log('\n=== Example 2: Task-Specific Context ===\n');
  
  const generator = new ContextGenerator();
  const task = "Navigate to men's collection, open chat assistant, and ask about watches";
  
  const context = generator.generateTaskContext(task);
  console.log(context);
}

// Example 3: Explore graph structure
function example3_exploreGraph() {
  console.log('\n=== Example 3: Explore Graph Structure ===\n');
  
  const generator = new ContextGenerator();
  const graph = generator.getGraph();
  
  console.log(`Website: ${graph.metadata.name}`);
  console.log(`Total Nodes: ${graph.nodes.length}`);
  console.log(`Total Edges: ${graph.edges.length}\n`);
  
  // Find login page
  const loginPage = generator.findNode('login');
  if (loginPage) {
    console.log(`Login Page Route: ${loginPage.route}`);
    console.log(`Login Page Elements: ${loginPage.elements.length}\n`);
  }
  
  // Get navigation paths from home
  const paths = generator.getNavigationPaths('home');
  console.log(`Navigation paths from home: ${paths.length}`);
  paths.forEach(path => {
    console.log(`  → ${path.to} (${path.trigger})`);
  });
}

// Example 4: Generate and save all context files
function example4_generateContextFiles() {
  console.log('\n=== Example 4: Generate Context Files ===\n');
  
  const fileGenerator = new ContextFileGenerator();
  fileGenerator.generateAll();
  
  console.log('✅ All context files generated in output/ directory');
  console.log('   - full-context.md');
  console.log('   - quick-reference.md');
  console.log('   - tree-structure.txt');
  console.log('   - context.json');
  console.log('   - tree-map.html (interactive visualization)\n');
}

// Example 5: Quick reference for specific task
function example5_quickReference() {
  console.log('\n=== Example 5: Quick Reference ===\n');
  
  const generator = new ContextGenerator();
  const quickRef = generator.generateQuickReference();
  
  console.log(quickRef.substring(0, 500) + '...\n');
  console.log('(Full quick reference available via generator.generateQuickReference())');
}

// Example 6: Custom context generation
function example6_customContext() {
  console.log('\n=== Example 6: Custom Context Generation ===\n');
  
  const generator = new ContextGenerator();
  
  // Generate context with only authentication info
  const authContext = generator.generateFullContext({
    includeAuth: true,
    includeComponents: false,
    includeFlows: false
  });
  
  console.log('Auth-only context:');
  console.log(authContext.substring(0, 300) + '...\n');
}

// Run all examples
function runAllExamples() {
  console.log('🚀 Context Mapping System - Usage Examples\n');
  console.log('='.repeat(60));
  
  example1_generateContextFile();
  example2_taskSpecificContext();
  example3_exploreGraph();
  example4_generateContextFiles();
  example5_quickReference();
  example6_customContext();
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ All examples completed!\n');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples();
}

export {
  example1_generateContextFile,
  example2_taskSpecificContext,
  example3_exploreGraph,
  example4_generateContextFiles,
  example5_quickReference,
  example6_customContext
};

