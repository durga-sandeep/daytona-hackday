import ContextGenerator from './context-generator.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Context File Generator
 * 
 * Generates and saves context files in various formats
 */
class ContextFileGenerator {
  constructor() {
    this.generator = new ContextGenerator();
    this.outputDir = path.join(__dirname, 'output');
    
    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Generate and save all context files
   */
  generateAll() {
    console.log('📝 Generating context files...\n');

    // Generate full context
    const fullContext = this.generator.generateFullContext({
      includeAuth: true,
      includeComponents: true,
      includeFlows: true
    });
    
    const fullContextPath = path.join(this.outputDir, 'full-context.md');
    fs.writeFileSync(fullContextPath, fullContext, 'utf-8');
    console.log(`✅ Full context saved: ${fullContextPath}`);

    // Generate quick reference
    const quickRef = this.generator.generateQuickReference();
    const quickRefPath = path.join(this.outputDir, 'quick-reference.md');
    fs.writeFileSync(quickRefPath, quickRef, 'utf-8');
    console.log(`✅ Quick reference saved: ${quickRefPath}`);

    // Generate tree structure
    const treeStructure = this.generateTreeStructure();
    const treePath = path.join(this.outputDir, 'tree-structure.txt');
    fs.writeFileSync(treePath, treeStructure, 'utf-8');
    console.log(`✅ Tree structure saved: ${treePath}`);

    // Generate JSON context
    const jsonContext = JSON.stringify(this.generator.getGraph(), null, 2);
    const jsonPath = path.join(this.outputDir, 'context.json');
    fs.writeFileSync(jsonPath, jsonContext, 'utf-8');
    console.log(`✅ JSON context saved: ${jsonPath}`);

    // Generate HTML tree map
    const htmlTreeMap = this.generateHTMLTreeMap();
    const htmlPath = path.join(this.outputDir, 'tree-map.html');
    fs.writeFileSync(htmlPath, htmlTreeMap, 'utf-8');
    console.log(`✅ HTML tree map saved: ${htmlPath}`);

    console.log(`\n📁 All files saved to: ${this.outputDir}\n`);
  }

  /**
   * Generate tree structure text
   */
  generateTreeStructure() {
    const graph = this.generator.getGraph();
    let tree = '='.repeat(80) + '\n';
    tree += `Website Context Tree: ${graph.metadata.name}\n`;
    tree += '='.repeat(80) + '\n\n';
    tree += `Base URL: ${graph.metadata.baseUrl}\n`;
    tree += `Version: ${graph.metadata.version}\n\n`;

    // Find entry point
    const entryPoint = graph.nodes.find(node => 
      node.userFlow && node.userFlow.entryPoint
    ) || graph.nodes.find(node => !node.requiresAuth);

    if (entryPoint) {
      tree += 'Website Structure Tree:\n';
      tree += '-'.repeat(80) + '\n\n';
      this.buildTreeText(tree, entryPoint.id, graph, new Set(), 0, '');
    }

    // Add all pages
    tree += '\n\nAll Pages:\n';
    tree += '-'.repeat(80) + '\n';
    const pages = graph.nodes.filter(node => node.type === 'page');
    pages.forEach(page => {
      tree += `\n📄 ${page.name}\n`;
      tree += `   Route: ${page.route}\n`;
      tree += `   Auth Required: ${page.requiresAuth ? 'Yes' : 'No'}\n`;
      if (page.elements && page.elements.length > 0) {
        tree += `   Elements: ${page.elements.length}\n`;
      }
      if (page.products && page.products.length > 0) {
        tree += `   Products: ${page.products.length}\n`;
      }
    });

    // Add components
    tree += '\n\nGlobal Components:\n';
    tree += '-'.repeat(80) + '\n';
    const components = graph.nodes.filter(node => node.type === 'component');
    components.forEach(component => {
      tree += `\n🧩 ${component.name}\n`;
      tree += `   Description: ${component.description}\n`;
      if (component.appearsOn) {
        tree += `   Appears On: ${component.appearsOn.join(', ')}\n`;
      }
    });

    return tree;
  }

  buildTreeText(tree, nodeId, graph, visited, depth, prefix) {
    if (visited.has(nodeId)) {
      return;
    }
    visited.add(nodeId);

    const node = graph.nodes.find(n => n.id === nodeId);
    if (!node || node.type !== 'page') {
      return;
    }

    const isLast = depth === 0;
    const connector = depth === 0 ? '' : (isLast ? '└── ' : '├── ');
    tree += prefix + connector + `${node.name} (${node.route})\n`;

    // Find children
    const children = graph.edges
      .filter(edge => edge.from === nodeId && edge.type === 'navigation')
      .map(edge => {
        const toNode = graph.nodes.find(n => n.id === edge.to);
        return { id: edge.to, trigger: edge.trigger, node: toNode };
      });

    children.forEach((child, index) => {
      const isLastChild = index === children.length - 1;
      const newPrefix = prefix + (depth === 0 ? '' : (isLast ? '    ' : '│   '));
      this.buildTreeText(tree, child.id, graph, visited, depth + 1, newPrefix);
    });
  }

  /**
   * Generate HTML tree map with interactive visualization
   */
  generateHTMLTreeMap() {
    const graph = this.generator.getGraph();
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${graph.metadata.name} - Context Tree Map</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            padding: 30px;
        }
        
        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 2.5em;
        }
        
        .metadata {
            color: #666;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #eee;
        }
        
        .tree-container {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        
        .tree-section {
            margin-bottom: 30px;
        }
        
        .tree-section h2 {
            color: #667eea;
            margin-bottom: 15px;
            font-size: 1.5em;
        }
        
        .tree {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .node {
            background: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 15px 20px;
            border-radius: 8px;
            transition: all 0.3s ease;
            cursor: pointer;
        }
        
        .node:hover {
            background: #e9ecef;
            transform: translateX(5px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .node.page {
            border-left-color: #28a745;
        }
        
        .node.component {
            border-left-color: #ffc107;
        }
        
        .node.protected {
            border-left-color: #dc3545;
        }
        
        .node-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 8px;
        }
        
        .node-title {
            font-weight: 600;
            color: #333;
            font-size: 1.1em;
        }
        
        .node-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.75em;
            font-weight: 600;
        }
        
        .badge-page {
            background: #d4edda;
            color: #155724;
        }
        
        .badge-component {
            background: #fff3cd;
            color: #856404;
        }
        
        .badge-auth {
            background: #f8d7da;
            color: #721c24;
        }
        
        .node-details {
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid #dee2e6;
            display: none;
        }
        
        .node.expanded .node-details {
            display: block;
        }
        
        .node-detail-item {
            margin: 5px 0;
            color: #666;
            font-size: 0.9em;
        }
        
        .node-detail-item strong {
            color: #333;
        }
        
        .connection {
            margin-left: 20px;
            padding-left: 20px;
            border-left: 2px dashed #ccc;
            margin-top: 10px;
        }
        
        .connection-item {
            color: #666;
            font-size: 0.9em;
            margin: 5px 0;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        
        .stat-value {
            font-size: 2em;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .stat-label {
            font-size: 0.9em;
            opacity: 0.9;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>${graph.metadata.name}</h1>
        <div class="metadata">
            <strong>Base URL:</strong> ${graph.metadata.baseUrl}<br>
            <strong>Version:</strong> ${graph.metadata.version}
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-value">${graph.nodes.filter(n => n.type === 'page').length}</div>
                <div class="stat-label">Pages</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${graph.nodes.filter(n => n.type === 'component').length}</div>
                <div class="stat-label">Components</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${graph.edges.length}</div>
                <div class="stat-label">Connections</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${graph.nodes.filter(n => n.requiresAuth).length}</div>
                <div class="stat-label">Protected Pages</div>
            </div>
        </div>
        
        <div class="tree-section">
            <h2>📄 Pages</h2>
            <div class="tree">
                ${this.generateNodeHTML(graph.nodes.filter(n => n.type === 'page'), graph)}
            </div>
        </div>
        
        <div class="tree-section">
            <h2>🧩 Components</h2>
            <div class="tree">
                ${this.generateNodeHTML(graph.nodes.filter(n => n.type === 'component'), graph)}
            </div>
        </div>
    </div>
    
    <script>
        document.querySelectorAll('.node').forEach(node => {
            node.addEventListener('click', function() {
                this.classList.toggle('expanded');
            });
        });
    </script>
</body>
</html>`;

    return html;
  }

  generateNodeHTML(nodes, graph) {
    return nodes.map(node => {
      const isProtected = node.requiresAuth;
      const nodeClass = `node ${node.type}${isProtected ? ' protected' : ''}`;
      
      let html = `<div class="${nodeClass}">`;
      html += `<div class="node-header">`;
      html += `<span class="node-title">${node.name}</span>`;
      html += `<span class="node-badge badge-${node.type}">${node.type.toUpperCase()}</span>`;
      if (isProtected) {
        html += `<span class="node-badge badge-auth">AUTH REQUIRED</span>`;
      }
      html += `</div>`;
      
      if (node.route) {
        html += `<div class="node-detail-item"><strong>Route:</strong> ${node.route}</div>`;
      }
      
      html += `<div class="node-details">`;
      html += `<div class="node-detail-item"><strong>Description:</strong> ${node.description}</div>`;
      
      if (node.elements && node.elements.length > 0) {
        html += `<div class="node-detail-item"><strong>Elements:</strong> ${node.elements.length}</div>`;
        node.elements.forEach(el => {
          html += `<div class="connection-item">• ${el.description} (${el.type})</div>`;
        });
      }
      
      if (node.products && node.products.length > 0) {
        html += `<div class="node-detail-item"><strong>Products:</strong> ${node.products.length}</div>`;
      }
      
      // Show connections
      const connections = graph.edges.filter(e => e.from === node.id);
      if (connections.length > 0) {
        html += `<div class="connection">`;
        html += `<div class="node-detail-item"><strong>Connections:</strong></div>`;
        connections.forEach(conn => {
          const toNode = graph.nodes.find(n => n.id === conn.to);
          html += `<div class="connection-item">→ ${toNode.name} (${conn.trigger})</div>`;
        });
        html += `</div>`;
      }
      
      html += `</div></div>`;
      return html;
    }).join('');
  }
}

// CLI interface
const generator = new ContextFileGenerator();

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Context File Generator

Usage:
  node generate-context.js

Generates:
  - full-context.md        Complete context documentation
  - quick-reference.md     Quick reference guide
  - tree-structure.txt     Text tree representation
  - context.json          JSON format
  - tree-map.html         Interactive HTML tree map

All files are saved to the 'output' directory.
  `);
  process.exit(0);
}

try {
  generator.generateAll();
  console.log('✨ Context generation complete!\n');
  console.log('💡 Open tree-map.html in your browser for interactive visualization');
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

export default ContextFileGenerator;

