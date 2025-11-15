import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Context Generator for Style Scout AI Website
 * 
 * Converts the website graph structure into browser_use readable context
 * that can be provided to the agent before performing tasks.
 */
class ContextGenerator {
  constructor(graphPath = null) {
    const graphFilePath = graphPath || path.join(__dirname, 'website-graph.json');
    this.graph = JSON.parse(fs.readFileSync(graphFilePath, 'utf-8'));
  }

  /**
   * Generate full context description for browser_use agent
   * @param {Object} options - Options for context generation
   * @param {boolean} options.includeAuth - Include authentication details
   * @param {boolean} options.includeComponents - Include component details
   * @param {boolean} options.includeFlows - Include user flow patterns
   * @returns {string} Formatted context string
   */
  generateFullContext(options = {}) {
    const {
      includeAuth = true,
      includeComponents = true,
      includeFlows = true
    } = options;

    let context = `# Website Context Map: ${this.graph.metadata.name}\n\n`;
    context += `Base URL: ${this.graph.metadata.baseUrl}\n`;
    context += `Version: ${this.graph.metadata.version}\n\n`;

    // Pages overview
    context += `## Pages Structure\n\n`;
    const pages = this.graph.nodes.filter(node => node.type === 'page');
    pages.forEach(page => {
      context += `### ${page.name} (${page.route})\n`;
      context += `- **Description**: ${page.description}\n`;
      context += `- **Requires Auth**: ${page.requiresAuth ? 'Yes' : 'No'}\n`;
      
      if (page.elements && page.elements.length > 0) {
        context += `- **Key Elements**:\n`;
        page.elements.forEach(element => {
          context += `  - ${element.description} (${element.type})\n`;
          if (element.selector) {
            context += `    - Selector: \`${element.selector}\`\n`;
          }
        });
      }

      if (page.products && page.products.length > 0) {
        context += `- **Products Available**: ${page.products.length} items\n`;
        context += `  - Categories: ${[...new Set(page.products.map(p => p.category))].join(', ')}\n`;
      }

      if (page.userFlow && page.userFlow.nextSteps) {
        context += `- **Navigation Options**: ${page.userFlow.nextSteps.join(', ')}\n`;
      }
      context += `\n`;
    });

    // Components overview
    if (includeComponents) {
      context += `## Global Components\n\n`;
      const components = this.graph.nodes.filter(node => node.type === 'component');
      components.forEach(component => {
        context += `### ${component.name}\n`;
        context += `- **Description**: ${component.description}\n`;
        if (component.appearsOn) {
          context += `- **Appears On**: ${component.appearsOn.join(', ')}\n`;
        }
        if (component.position) {
          context += `- **Position**: ${component.position}\n`;
        }
        if (component.elements && component.elements.length > 0) {
          context += `- **Key Elements**:\n`;
          component.elements.forEach(element => {
            context += `  - ${element.description}\n`;
            if (element.selector) {
              context += `    - Selector: \`${element.selector}\`\n`;
            }
          });
        }
        context += `\n`;
      });
    }

    // Navigation graph
    context += `## Navigation Flow\n\n`;
    const navigationEdges = this.graph.edges.filter(edge => edge.type === 'navigation');
    const navigationMap = {};
    navigationEdges.forEach(edge => {
      if (!navigationMap[edge.from]) {
        navigationMap[edge.from] = [];
      }
      navigationMap[edge.from].push({
        to: edge.to,
        trigger: edge.trigger,
        description: edge.description
      });
    });

    Object.keys(navigationMap).forEach(from => {
      const page = this.graph.nodes.find(n => n.id === from);
      context += `**From ${page.name}**:\n`;
      navigationMap[from].forEach(nav => {
        const toPage = this.graph.nodes.find(n => n.id === nav.to);
        context += `- ${nav.description}\n`;
        context += `  - Route: ${toPage.route}\n`;
      });
      context += `\n`;
    });

    // Authentication
    if (includeAuth && this.graph.authentication) {
      context += `## Authentication\n\n`;
      context += `- **Required**: ${this.graph.authentication.required ? 'Yes' : 'No'}\n`;
      context += `- **Public Pages**: ${this.graph.authentication.publicPages.join(', ')}\n`;
      context += `- **Protected Pages**: ${this.graph.authentication.protectedPages.join(', ')}\n`;
      if (this.graph.authentication.defaultCredentials) {
        context += `- **Default Credentials**:\n`;
        context += `  - Username: ${this.graph.authentication.defaultCredentials.username}\n`;
        context += `  - Password: ${this.graph.authentication.defaultCredentials.password}\n`;
      }
      context += `\n`;
    }

    // Common patterns/flows
    if (includeFlows && this.graph.commonPatterns) {
      context += `## Common User Flows\n\n`;
      this.graph.commonPatterns.forEach(pattern => {
        context += `### ${pattern.name}\n`;
        pattern.steps.forEach((step, index) => {
          context += `${index + 1}. ${step}\n`;
        });
        context += `\n`;
      });
    }

    return context;
  }

  /**
   * Generate context for a specific task
   * @param {string} taskDescription - Description of the task to perform
   * @returns {string} Task-specific context
   */
  generateTaskContext(taskDescription) {
    let context = `# Task Context\n\n`;
    context += `**Task**: ${taskDescription}\n\n`;

    // Identify relevant pages based on task keywords
    const taskLower = taskDescription.toLowerCase();
    const relevantPages = this.graph.nodes.filter(node => {
      if (node.type !== 'page') return false;
      const pageText = `${node.name} ${node.description} ${node.route}`.toLowerCase();
      return taskLower.split(' ').some(keyword => pageText.includes(keyword));
    });

    if (relevantPages.length > 0) {
      context += `## Relevant Pages\n\n`;
      relevantPages.forEach(page => {
        context += `### ${page.name}\n`;
        context += `- Route: ${page.route}\n`;
        context += `- ${page.description}\n`;
        
        if (page.userFlow && page.userFlow.actions) {
          context += `- **Actions Available**:\n`;
          page.userFlow.actions.forEach(action => {
            context += `  - ${action}\n`;
          });
        }

        if (page.elements && page.elements.length > 0) {
          context += `- **Interactive Elements**:\n`;
          page.elements.forEach(element => {
            context += `  - ${element.description}`;
            if (element.selector) {
              context += ` (\`${element.selector}\`)`;
            }
            context += `\n`;
          });
        }
        context += `\n`;
      });
    }

    // Add authentication requirements if needed
    const needsAuth = relevantPages.some(page => page.requiresAuth);
    if (needsAuth) {
      context += `## Authentication Required\n\n`;
      context += `This task requires authentication. Use the following credentials:\n`;
      context += `- Username: ${this.graph.authentication.defaultCredentials.username}\n`;
      context += `- Password: ${this.graph.authentication.defaultCredentials.password}\n`;
      context += `- Login page: ${this.graph.metadata.baseUrl}/login\n\n`;
    }

    return context;
  }

  /**
   * Generate simplified context for quick reference
   * @returns {string} Simplified context
   */
  generateQuickReference() {
    let context = `# Quick Reference: ${this.graph.metadata.name}\n\n`;
    
    context += `## Routes\n`;
    const pages = this.graph.nodes.filter(node => node.type === 'page');
    pages.forEach(page => {
      context += `- \`${page.route}\` - ${page.name}${page.requiresAuth ? ' (Auth Required)' : ''}\n`;
    });

    context += `\n## Key Selectors\n\n`;
    pages.forEach(page => {
      if (page.elements && page.elements.length > 0) {
        context += `### ${page.name}\n`;
        page.elements.forEach(element => {
          if (element.selector) {
            context += `- ${element.description}: \`${element.selector}\`\n`;
          }
        });
        context += `\n`;
      }
    });

    const components = this.graph.nodes.filter(node => node.type === 'component');
    components.forEach(component => {
      if (component.elements && component.elements.length > 0) {
        context += `### ${component.name}\n`;
        component.elements.forEach(element => {
          if (element.selector) {
            context += `- ${element.description}: \`${element.selector}\`\n`;
          }
        });
        context += `\n`;
      }
    });

    return context;
  }

  /**
   * Get graph structure as JSON
   * @returns {Object} Graph structure
   */
  getGraph() {
    return this.graph;
  }

  /**
   * Find node by ID
   * @param {string} nodeId - Node ID to find
   * @returns {Object|null} Node object or null
   */
  findNode(nodeId) {
    return this.graph.nodes.find(node => node.id === nodeId) || null;
  }

  /**
   * Get all navigation paths from a node
   * @param {string} nodeId - Starting node ID
   * @returns {Array} Array of navigation paths
   */
  getNavigationPaths(nodeId) {
    return this.graph.edges.filter(edge => 
      edge.from === nodeId && edge.type === 'navigation'
    );
  }
}

export default ContextGenerator;

