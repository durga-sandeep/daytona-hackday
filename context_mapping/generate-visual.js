import ContextGenerator from './context-generator.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Visual Graph Generator
 * 
 * Generates visual representations of the website graph in various formats:
 * - Mermaid diagram syntax
 * - DOT/Graphviz format
 * - Simple text tree
 */

class VisualGraphGenerator {
  constructor() {
    this.generator = new ContextGenerator();
  }

  /**
   * Generate Mermaid diagram syntax
   * @returns {string} Mermaid diagram code
   */
  generateMermaidDiagram() {
    const graph = this.generator.getGraph();
    let mermaid = 'graph TD\n';
    mermaid += '    %% Style Scout AI Website Graph\n\n';

    // Add nodes
    graph.nodes.forEach(node => {
      if (node.type === 'page') {
        const shape = node.requiresAuth ? '[/' : '[(';
        const shapeEnd = node.requiresAuth ? '/]' : ')]';
        const label = `${node.name}\\n${node.route}`;
        mermaid += `    ${node.id}${shape}${label}${shapeEnd}\n`;
      } else if (node.type === 'component') {
        mermaid += `    ${node.id}[${node.name}]:::component\n`;
      }
    });

    // Add edges
    graph.edges.forEach(edge => {
      const style = edge.type === 'navigation' ? '-->' : '-.->';
      mermaid += `    ${edge.from} ${style} ${edge.to}\n`;
    });

    // Add styling
    mermaid += '\n    classDef component fill:#e1f5ff,stroke:#01579b,stroke-width:2px\n';
    mermaid += '    classDef publicPage fill:#c8e6c9,stroke:#2e7d32,stroke-width:2px\n';
    mermaid += '    classDef protectedPage fill:#fff3e0,stroke:#e65100,stroke-width:2px\n';

    // Apply styles
    graph.nodes.forEach(node => {
      if (node.type === 'page') {
        if (node.requiresAuth) {
          mermaid += `    class ${node.id} protectedPage\n`;
        } else {
          mermaid += `    class ${node.id} publicPage\n`;
        }
      }
    });

    return mermaid;
  }

  /**
   * Generate Graphviz DOT format
   * @returns {string} DOT format code
   */
  generateDotFormat() {
    const graph = this.generator.getGraph();
    let dot = 'digraph StyleScoutAI {\n';
    dot += '    rankdir=LR;\n';
    dot += '    node [shape=box, style=rounded];\n\n';

    // Add nodes
    graph.nodes.forEach(node => {
      if (node.type === 'page') {
        const color = node.requiresAuth ? 'orange' : 'lightgreen';
        const label = `${node.name}\\n${node.route}`;
        dot += `    "${node.id}" [label="${label}", fillcolor="${color}", style="filled,rounded"];\n`;
      } else if (node.type === 'component') {
        dot += `    "${node.id}" [label="${node.name}", fillcolor="lightblue", style="filled,rounded"];\n`;
      }
    });

    dot += '\n';

    // Add edges
    graph.edges.forEach(edge => {
      const style = edge.type === 'navigation' ? 'solid' : 'dashed';
      dot += `    "${edge.from}" -> "${edge.to}" [style="${style}", label="${edge.trigger}"];\n`;
    });

    dot += '}\n';
    return dot;
  }

  /**
   * Generate text tree representation
   * @returns {string} Text tree
   */
  generateTextTree() {
    const graph = this.generator.getGraph();
    let tree = 'Style Scout AI Website Structure\n';
    tree += '='.repeat(60) + '\n\n';

    // Start from entry point
    const entryPoint = graph.nodes.find(node => 
      node.userFlow && node.userFlow.entryPoint
    ) || graph.nodes.find(node => !node.requiresAuth);

    if (entryPoint) {
      this.buildTreeRecursive(tree, entryPoint.id, graph, new Set(), 0);
    } else {
      // Fallback: show all pages
      graph.nodes.forEach(node => {
        if (node.type === 'page') {
          tree += `${node.name} (${node.route})\n`;
          if (node.requiresAuth) {
            tree += '  [Auth Required]\n';
          }
          tree += '\n';
        }
      });
    }

    return tree;
  }

  buildTreeRecursive(tree, nodeId, graph, visited, depth) {
    if (visited.has(nodeId)) {
      return;
    }
    visited.add(nodeId);

    const node = graph.nodes.find(n => n.id === nodeId);
    if (!node || node.type !== 'page') {
      return;
    }

    const indent = '  '.repeat(depth);
    tree += `${indent}${node.name} (${node.route})\n`;
    if (node.requiresAuth) {
      tree += `${indent}  [Auth Required]\n`;
    }

    // Find children
    const children = graph.edges
      .filter(edge => edge.from === nodeId && edge.type === 'navigation')
      .map(edge => edge.to);

    children.forEach(childId => {
      this.buildTreeRecursive(tree, childId, graph, visited, depth + 1);
    });
  }

  /**
   * Save all visual formats to files
   */
  saveAllFormats() {
    const outputDir = __dirname;

    // Mermaid
    const mermaid = this.generateMermaidDiagram();
    const mermaidPath = path.join(outputDir, 'graph.mermaid');
    fs.writeFileSync(mermaidPath, mermaid, 'utf-8');
    console.log(`✅ Mermaid diagram saved to: ${mermaidPath}`);

    // DOT
    const dot = this.generateDotFormat();
    const dotPath = path.join(outputDir, 'graph.dot');
    fs.writeFileSync(dotPath, dot, 'utf-8');
    console.log(`✅ DOT format saved to: ${dotPath}`);

    // Text tree
    const tree = this.generateTextTree();
    const treePath = path.join(outputDir, 'graph-tree.txt');
    fs.writeFileSync(treePath, tree, 'utf-8');
    console.log(`✅ Text tree saved to: ${treePath}`);

    console.log('\n💡 Tips:');
    console.log('  - View Mermaid diagram: https://mermaid.live/');
    console.log('  - View DOT graph: https://dreampuf.github.io/GraphvizOnline/');
    console.log('  - Or use: dot -Tpng graph.dot -o graph.png\n');
  }
}

// CLI interface
const args = process.argv.slice(2);
const generator = new VisualGraphGenerator();

if (args.length === 0 || args[0] === 'all') {
  generator.saveAllFormats();
} else if (args[0] === 'mermaid') {
  console.log(generator.generateMermaidDiagram());
} else if (args[0] === 'dot') {
  console.log(generator.generateDotFormat());
} else if (args[0] === 'tree') {
  console.log(generator.generateTextTree());
} else {
  console.log(`
Visual Graph Generator

Usage:
  node generate-visual.js [format]

Formats:
  all      Generate all formats and save to files (default)
  mermaid  Output Mermaid diagram syntax
  dot      Output Graphviz DOT format
  tree     Output text tree representation

Examples:
  node generate-visual.js all
  node generate-visual.js mermaid
  `);
}

export default VisualGraphGenerator;

