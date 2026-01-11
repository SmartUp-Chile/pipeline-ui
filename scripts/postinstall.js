#!/usr/bin/env node

/**
 * Postinstall script for @smartup/pipeline-ui
 * Detects project setup and shows customized installation instructions
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

const c = colors;

// Get the project root (where the package was installed)
const projectRoot = process.env.INIT_CWD || process.cwd();

/**
 * Detect project configuration
 */
function detectProject() {
  const config = {
    hasStyles: false,
    styleSystem: null,
    framework: null,
    hasEnvFile: false,
    hasCssVariables: false,
    packageManager: 'npm',
  };

  // Check for package.json
  const pkgPath = join(projectRoot, 'package.json');
  let pkg = {};
  if (existsSync(pkgPath)) {
    try {
      pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    } catch (e) {
      // ignore
    }
  }

  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

  // Detect style system
  if (allDeps['tailwindcss']) {
    config.hasStyles = true;
    config.styleSystem = 'tailwind';
  } else if (allDeps['styled-components'] || allDeps['@emotion/react']) {
    config.hasStyles = true;
    config.styleSystem = 'css-in-js';
  } else if (allDeps['sass'] || allDeps['node-sass']) {
    config.hasStyles = true;
    config.styleSystem = 'sass';
  }

  // Check for existing CSS files
  const cssPatterns = [
    'src/index.css',
    'src/styles/index.css',
    'src/styles/globals.css',
    'src/app/globals.css',
    'app/globals.css',
    'styles/globals.css',
  ];

  for (const pattern of cssPatterns) {
    if (existsSync(join(projectRoot, pattern))) {
      config.hasStyles = true;
      if (!config.styleSystem) {
        config.styleSystem = 'css';
      }

      // Check if they already have CSS variables
      try {
        const cssContent = readFileSync(join(projectRoot, pattern), 'utf-8');
        if (cssContent.includes(':root') && cssContent.includes('--')) {
          config.hasCssVariables = true;
        }
      } catch (e) {
        // ignore
      }
      break;
    }
  }

  // Detect framework
  if (allDeps['next']) {
    config.framework = 'next';
  } else if (allDeps['vite']) {
    config.framework = 'vite';
  } else if (allDeps['react-scripts']) {
    config.framework = 'cra';
  }

  // Check for env files
  const envFiles = ['.env', '.env.local', '.env.development'];
  for (const envFile of envFiles) {
    if (existsSync(join(projectRoot, envFile))) {
      config.hasEnvFile = true;
      break;
    }
  }

  // Detect package manager
  if (existsSync(join(projectRoot, 'pnpm-lock.yaml'))) {
    config.packageManager = 'pnpm';
  } else if (existsSync(join(projectRoot, 'yarn.lock'))) {
    config.packageManager = 'yarn';
  } else if (existsSync(join(projectRoot, 'bun.lockb'))) {
    config.packageManager = 'bun';
  }

  return config;
}

/**
 * Generate instructions based on detected config
 */
function generateInstructions(config) {
  const lines = [];

  // Header
  lines.push('');
  lines.push(`${c.green}${c.bright}✓ @smartup/pipeline-ui installed successfully!${c.reset}`);
  lines.push('');
  lines.push(`${c.dim}${'─'.repeat(50)}${c.reset}`);

  // Detected setup
  lines.push('');
  lines.push(`${c.cyan}${c.bright}Detected Setup:${c.reset}`);
  if (config.framework) {
    lines.push(`  Framework: ${c.yellow}${config.framework}${c.reset}`);
  }
  if (config.styleSystem) {
    lines.push(`  Styles: ${c.yellow}${config.styleSystem}${c.reset}${config.hasCssVariables ? ' (with CSS variables)' : ''}`);
  }
  if (!config.hasStyles) {
    lines.push(`  Styles: ${c.dim}none detected${c.reset}`);
  }

  lines.push('');
  lines.push(`${c.dim}${'─'.repeat(50)}${c.reset}`);

  // Style import instructions
  lines.push('');
  lines.push(`${c.cyan}${c.bright}1. Import Styles${c.reset}`);
  lines.push('');

  if (config.hasStyles && config.hasCssVariables) {
    // Project has CSS variables - recommend variables only
    lines.push(`   ${c.green}Recommended (you have existing CSS variables):${c.reset}`);
    lines.push('');
    lines.push(`   ${c.dim}// Import only variables, then override with your tokens${c.reset}`);
    lines.push(`   ${c.bright}import '@smartup/pipeline-ui/styles/variables.css';${c.reset}`);
    lines.push('');
    lines.push(`   ${c.dim}// In your CSS, map to your existing variables:${c.reset}`);
    lines.push(`   ${c.yellow}:root {`);
    lines.push(`     --pipeline-bg-primary: var(--your-bg-color);`);
    lines.push(`     --pipeline-text-primary: var(--your-text-color);`);
    lines.push(`     --pipeline-accent-primary: var(--your-primary-color);`);
    lines.push(`   }${c.reset}`);
  } else if (config.styleSystem === 'tailwind') {
    // Tailwind project
    lines.push(`   ${c.green}For Tailwind projects:${c.reset}`);
    lines.push('');
    lines.push(`   ${c.dim}// In your main entry file:${c.reset}`);
    lines.push(`   ${c.bright}import '@smartup/pipeline-ui/styles/variables.css';${c.reset}`);
    lines.push('');
    lines.push(`   ${c.dim}// In your CSS (e.g., globals.css):${c.reset}`);
    lines.push(`   ${c.yellow}:root {`);
    lines.push(`     --pipeline-bg-primary: theme('colors.gray.900');`);
    lines.push(`     --pipeline-accent-primary: theme('colors.indigo.500');`);
    lines.push(`   }${c.reset}`);
  } else if (config.styleSystem === 'css-in-js') {
    // styled-components / emotion
    lines.push(`   ${c.green}For CSS-in-JS projects:${c.reset}`);
    lines.push('');
    lines.push(`   ${c.bright}import '@smartup/pipeline-ui/styles';${c.reset}`);
    lines.push('');
    lines.push(`   ${c.dim}// Override in your global styles or ThemeProvider${c.reset}`);
  } else {
    // Default - full styles
    lines.push(`   ${c.green}Option A: Full styles (quick start)${c.reset}`);
    lines.push(`   ${c.bright}import '@smartup/pipeline-ui/styles';${c.reset}`);
    lines.push('');
    lines.push(`   ${c.green}Option B: Variables only (for custom theming)${c.reset}`);
    lines.push(`   ${c.bright}import '@smartup/pipeline-ui/styles/variables.css';${c.reset}`);
  }

  // Provider setup
  lines.push('');
  lines.push(`${c.dim}${'─'.repeat(50)}${c.reset}`);
  lines.push('');
  lines.push(`${c.cyan}${c.bright}2. Setup Provider${c.reset}`);
  lines.push('');

  // Env var name based on framework
  let envPrefix = 'VITE_';
  if (config.framework === 'next') {
    envPrefix = 'NEXT_PUBLIC_';
  } else if (config.framework === 'cra') {
    envPrefix = 'REACT_APP_';
  }

  lines.push(`   ${c.yellow}import { PipelineProvider, HistoryView } from '@smartup/pipeline-ui';`);
  lines.push('');
  lines.push(`   <PipelineProvider`);
  lines.push(`     config={{`);
  lines.push(`       apiBaseUrl: '${c.green}https://ai-pipeline.smartup.lat${c.reset}',`);
  lines.push(`       headers: {`);
  lines.push(`         'Authorization': \`Bearer \${${envPrefix}PIPELINE_API_KEY}\`,`);
  lines.push(`       },`);
  lines.push(`     }}`);
  lines.push(`   >`);
  lines.push(`     <HistoryView />`);
  lines.push(`   </PipelineProvider>${c.reset}`);

  // Environment variables
  lines.push('');
  lines.push(`${c.dim}${'─'.repeat(50)}${c.reset}`);
  lines.push('');
  lines.push(`${c.cyan}${c.bright}3. Environment Variables${c.reset}`);
  lines.push('');

  const envFile = config.framework === 'next' ? '.env.local' : '.env';
  lines.push(`   ${c.dim}Add to ${envFile}:${c.reset}`);
  lines.push('');
  lines.push(`   ${c.yellow}${envPrefix}PIPELINE_API_URL=https://ai-pipeline.smartup.lat`);
  lines.push(`   ${envPrefix}PIPELINE_API_KEY=your-api-key-here${c.reset}`);

  if (!config.hasEnvFile) {
    lines.push('');
    lines.push(`   ${c.magenta}⚠ No .env file detected. Create one with the above variables.${c.reset}`);
  }

  // Theming section for projects with existing styles
  if (config.hasStyles) {
    lines.push('');
    lines.push(`${c.dim}${'─'.repeat(50)}${c.reset}`);
    lines.push('');
    lines.push(`${c.cyan}${c.bright}4. Theming (Optional)${c.reset}`);
    lines.push('');
    lines.push(`   ${c.dim}Override these CSS variables to match your design:${c.reset}`);
    lines.push('');
    lines.push(`   ${c.yellow}:root {`);
    lines.push(`     --pipeline-bg-primary: #0a0a0f;`);
    lines.push(`     --pipeline-bg-secondary: #12121a;`);
    lines.push(`     --pipeline-text-primary: #f0f0f5;`);
    lines.push(`     --pipeline-accent-primary: #6366f1;`);
    lines.push(`     --pipeline-font-sans: 'Your Font', sans-serif;`);
    lines.push(`   }${c.reset}`);
    lines.push('');
    lines.push(`   ${c.dim}See all variables: ${c.blue}https://github.com/SmartUp-Chile/pipeline-ui/blob/main/docs/THEMING.md${c.reset}`);
  }

  // Footer
  lines.push('');
  lines.push(`${c.dim}${'─'.repeat(50)}${c.reset}`);
  lines.push('');
  lines.push(`${c.cyan}Documentation:${c.reset} ${c.blue}https://github.com/SmartUp-Chile/pipeline-ui${c.reset}`);
  lines.push(`${c.cyan}API Endpoint:${c.reset}  ${c.blue}https://ai-pipeline.smartup.lat${c.reset}`);
  lines.push('');

  return lines.join('\n');
}

/**
 * Main
 */
function main() {
  // Skip if running in CI or if SKIP_POSTINSTALL is set
  if (process.env.CI || process.env.SKIP_POSTINSTALL) {
    return;
  }

  try {
    const config = detectProject();
    const instructions = generateInstructions(config);
    console.log(instructions);
  } catch (error) {
    // Silently fail - don't break the install
    console.log('\n✓ @smartup/pipeline-ui installed. See README for setup instructions.\n');
  }
}

main();
