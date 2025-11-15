import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * PNG Visualization Generator
 * 
 * Generates PNG images from the graph structure using various methods
 */
class PNGVisualizationGenerator {
  constructor() {
    this.outputDir = path.join(__dirname, 'output');
    
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Generate PNG using Mermaid CLI (if available)
   */
  generateFromMermaid() {
    try {
      // Check if mermaid-cli is available
      execSync('which mmdc', { stdio: 'ignore' });
      
      const mermaidFile = path.join(__dirname, 'graph.mermaid');
      const pngFile = path.join(this.outputDir, 'graph-mermaid.png');
      
      if (fs.existsSync(mermaidFile)) {
        execSync(`mmdc -i ${mermaidFile} -o ${pngFile} -w 2000 -H 1500`, { stdio: 'inherit' });
        console.log(`✅ Mermaid PNG saved: ${pngFile}`);
        return true;
      }
    } catch (error) {
      console.log('⚠️  Mermaid CLI not available. Install with: npm install -g @mermaid-js/mermaid-cli');
      return false;
    }
  }

  /**
   * Generate PNG using Graphviz (if available)
   */
  generateFromDot() {
    try {
      // Check if dot (Graphviz) is available
      execSync('which dot', { stdio: 'ignore' });
      
      const dotFile = path.join(__dirname, 'graph.dot');
      const pngFile = path.join(this.outputDir, 'graph-dot.png');
      
      if (fs.existsSync(dotFile)) {
        execSync(`dot -Tpng ${dotFile} -o ${pngFile}`, { stdio: 'inherit' });
        console.log(`✅ Graphviz PNG saved: ${pngFile}`);
        return true;
      }
    } catch (error) {
      console.log('⚠️  Graphviz not available. Install with: brew install graphviz (macOS) or apt-get install graphviz (Linux)');
      return false;
    }
  }

  /**
   * Generate PNG from HTML using Puppeteer (headless browser)
   */
  async generateFromHTML() {
    try {
      const puppeteer = await import('puppeteer');
      const htmlFile = path.join(this.outputDir, 'tree-map.html');
      const pngFile = path.join(this.outputDir, 'tree-map.png');
      
      if (!fs.existsSync(htmlFile)) {
        console.log('⚠️  HTML file not found. Run generate-context.js first.');
        return false;
      }

      const browser = await puppeteer.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.goto(`file://${htmlFile}`, { waitUntil: 'networkidle0' });
      
      // Wait for any animations
      await page.waitForTimeout(1000);
      
      await page.screenshot({
        path: pngFile,
        fullPage: true,
        type: 'png'
      });
      
      await browser.close();
      console.log(`✅ HTML screenshot saved: ${pngFile}`);
      return true;
    } catch (error) {
      if (error.message.includes('Cannot find module')) {
        console.log('⚠️  Puppeteer not installed. Install with: npm install puppeteer');
      } else {
        console.log(`⚠️  Error generating PNG from HTML: ${error.message}`);
      }
      return false;
    }
  }

  /**
   * Generate instructions for manual PNG creation
   */
  generateInstructions() {
    const instructions = `
PNG Visualization Generation Instructions
========================================

The context mapping system can generate PNG visualizations using several methods:

1. FROM MERMAID DIAGRAM:
   - Install: npm install -g @mermaid-js/mermaid-cli
   - Generate: npm run visual:mermaid > graph.mermaid
   - Convert: mmdc -i graph.mermaid -o output/graph-mermaid.png -w 2000 -H 1500
   - Or view online: https://mermaid.live/ (paste graph.mermaid content)

2. FROM GRAPHVIZ DOT:
   - Install: brew install graphviz (macOS) or apt-get install graphviz (Linux)
   - Generate: npm run visual:dot > graph.dot
   - Convert: dot -Tpng graph.dot -o output/graph-dot.png
   - Or view online: https://dreampuf.github.io/GraphvizOnline/

3. FROM HTML TREE MAP:
   - Generate HTML: node generate-context.js
   - Open output/tree-map.html in browser
   - Use browser's print/screenshot feature
   - Or install Puppeteer: npm install puppeteer
   - Then run: node generate-png-visualization.js

4. MANUAL SCREENSHOT:
   - Open output/tree-map.html in your browser
   - Use browser DevTools or screenshot extension
   - Save as PNG

All generated files will be in the 'output' directory.
`;
    
    const instructionsPath = path.join(this.outputDir, 'PNG-GENERATION-INSTRUCTIONS.txt');
    fs.writeFileSync(instructionsPath, instructions, 'utf-8');
    console.log(`\n📄 Instructions saved: ${instructionsPath}\n`);
  }

  /**
   * Try all methods to generate PNG
   */
  async generateAll() {
    console.log('🎨 Generating PNG visualizations...\n');
    
    let successCount = 0;
    
    // Try Mermaid
    if (this.generateFromMermaid()) {
      successCount++;
    }
    
    // Try Graphviz
    if (this.generateFromDot()) {
      successCount++;
    }
    
    // Try HTML screenshot
    if (await this.generateFromHTML()) {
      successCount++;
    }
    
    if (successCount === 0) {
      console.log('\n⚠️  No PNG generation methods available.');
      console.log('Generating instructions file...\n');
      this.generateInstructions();
      console.log('💡 You can manually create PNGs using the methods above.');
    } else {
      console.log(`\n✅ Generated ${successCount} PNG file(s) in output directory`);
    }
  }
}

// CLI interface
const generator = new PNGVisualizationGenerator();

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
PNG Visualization Generator

Usage:
  node generate-png-visualization.js

This script attempts to generate PNG images from the graph structure.
It tries multiple methods:
  1. Mermaid CLI (if installed)
  2. Graphviz DOT (if installed)
  3. Puppeteer screenshot from HTML (if installed)

Installation:
  - Mermaid: npm install -g @mermaid-js/mermaid-cli
  - Graphviz: brew install graphviz (macOS)
  - Puppeteer: npm install puppeteer

Note: Make sure to run 'node generate-context.js' first to generate the HTML file.
  `);
  process.exit(0);
}

generator.generateAll().catch(console.error);

export default PNGVisualizationGenerator;

