const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const chalk = require('chalk');
const inquirer = require('inquirer');
const { execSync } = require('child_process');

/**
 * One-command setup for Claude Code AutoPilot
 * This script:
 * 1. Detects Claude Code installation
 * 2. Installs AutoPilot hooks
 * 3. Configures project-specific settings
 * 4. Sets up testing agents
 * 5. Validates installation
 */

async function setupAutopilot(options = {}) {
  console.log(chalk.blue('🔧 Claude Code AutoPilot Setup\n'));
  
  // Step 1: Detect Claude Code
  await detectClaudeCode();
  
  // Step 2: Detect project type and frameworks
  const projectConfig = await detectProjectConfiguration();
  
  // Step 3: Install AutoPilot hooks
  await installClaudeHooks();
  
  // Step 4: Configure agents based on project
  await configureAgents(projectConfig);
  
  // Step 5: Create project configuration
  await createProjectConfiguration(projectConfig);
  
  // Step 6: Install testing dependencies
  await installTestingDependencies(projectConfig);
  
  // Step 7: Validate installation
  await validateSetup();
  
  console.log(chalk.green('\n✅ AutoPilot setup complete!'));
  console.log(chalk.blue('\n📋 What was configured:'));
  console.log(`  • Project type: ${projectConfig.type}`);
  console.log(`  • Testing agents: ${projectConfig.agents.join(', ')}`);
  console.log(`  • Validation timeout: ${projectConfig.timeout}s`);
  console.log(`  • Confidence threshold: ${projectConfig.confidence}%`);
}

async function detectClaudeCode() {
  console.log(chalk.yellow('🔍 Detecting Claude Code installation...'));
  
  try {
    // Check if claude command exists
    execSync('which claude', { stdio: 'ignore' });
    console.log(chalk.green('  ✅ Claude Code found'));
    
    // Check version
    const version = execSync('claude --version', { encoding: 'utf8' }).trim();
    console.log(chalk.gray(`  📦 Version: ${version}`));
    
  } catch (error) {
    throw new Error('Claude Code not found. Please install Claude Code first: https://claude.ai/code');
  }
}

async function detectProjectConfiguration() {
  console.log(chalk.yellow('🔍 Analyzing project structure...'));
  
  const config = {
    type: 'unknown',
    frameworks: [],
    testFramework: null,
    buildTool: null,
    agents: ['unit-test'],
    timeout: 60,
    confidence: 85
  };
  
  // Detect project type
  if (await fs.pathExists('package.json')) {
    const pkg = await fs.readJson('package.json');
    config.type = 'javascript';
    
    // Detect frameworks
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    
    if (deps.react) {
      config.frameworks.push('react');
      config.agents.push('gui-test');
    }
    if (deps.vue) {
      config.frameworks.push('vue');
      config.agents.push('gui-test');
    }
    if (deps.express || deps.fastify || deps.koa) {
      config.frameworks.push('node-backend');
      config.agents.push('integration-test');
    }
    if (deps.jest) config.testFramework = 'jest';
    if (deps.vitest) config.testFramework = 'vitest';
    if (deps.playwright) config.agents.push('gui-test');
    if (deps.cypress) config.agents.push('gui-test');
    
  } else if (await fs.pathExists('requirements.txt') || await fs.pathExists('pyproject.toml')) {
    config.type = 'python';
    config.testFramework = 'pytest';
    
    if (await fs.pathExists('manage.py')) {
      config.frameworks.push('django');
      config.agents.push('integration-test');
    }
    
  } else if (await fs.pathExists('Cargo.toml')) {
    config.type = 'rust';
    config.testFramework = 'cargo';
    
  } else if (await fs.pathExists('go.mod')) {
    config.type = 'go';
    config.testFramework = 'go-test';
  }
  
  // Always add performance and security agents for non-trivial projects
  if (config.frameworks.length > 0) {
    config.agents.push('performance-test', 'security-test');
  }
  
  console.log(chalk.green(`  ✅ Detected: ${config.type} project`));
  if (config.frameworks.length > 0) {
    console.log(chalk.gray(`  📚 Frameworks: ${config.frameworks.join(', ')}`));
  }
  
  return config;
}

async function installClaudeHooks() {
  console.log(chalk.yellow('🔗 Installing Claude Code hooks...'));
  
  const claudeDir = path.join(os.homedir(), '.claude');
  const hooksDir = path.join(claudeDir, 'hooks');
  
  // Ensure directories exist
  await fs.ensureDir(hooksDir);
  
  // Install AutoPilot hook
  const hookContent = `#!/usr/bin/env node
// Claude Code AutoPilot Hook
const { AutoPilotHook } = require('claude-code-autopilot');

module.exports = {
  name: 'autopilot',
  version: '1.0.0',
  
  // Intercept commands with --auto flag
  beforeCommand: async (command, args, options) => {
    if (options.auto || options.autopilot) {
      const autopilot = new AutoPilotHook();
      return await autopilot.execute(command, args, options);
    }
  },
  
  // Add AutoPilot context to all commands
  beforeExecute: async (context) => {
    context.autopilot = {
      available: true,
      agents: await getAvailableAgents(),
      confidence_threshold: getConfidenceThreshold()
    };
  }
};

async function getAvailableAgents() {
  const config = await loadAutoPilotConfig();
  return config.agents || [];
}

function getConfidenceThreshold() {
  const config = loadAutoPilotConfig();
  return config.confidence_threshold || 85;
}`;

  await fs.writeFile(path.join(hooksDir, 'autopilot.js'), hookContent);
  
  // Make hook executable
  await fs.chmod(path.join(hooksDir, 'autopilot.js'), '755');
  
  console.log(chalk.green('  ✅ Claude Code hooks installed'));
}

async function configureAgents(projectConfig) {
  console.log(chalk.yellow('🤖 Configuring testing agents...'));
  
  const agentConfigs = {
    'unit-test': {
      enabled: true,
      frameworks: [projectConfig.testFramework],
      timeout: 30
    },
    'gui-test': {
      enabled: projectConfig.agents.includes('gui-test'),
      frameworks: ['playwright', 'cypress'],
      viewport: { width: 1280, height: 720 },
      browsers: ['chromium', 'firefox'],
      timeout: 45
    },
    'integration-test': {
      enabled: projectConfig.agents.includes('integration-test'),
      timeout: 60,
      endpoints: []
    },
    'performance-test': {
      enabled: projectConfig.agents.includes('performance-test'),
      thresholds: {
        response_time: 500,
        memory_usage: 100,
        cpu_usage: 80
      },
      timeout: 90
    },
    'security-test': {
      enabled: projectConfig.agents.includes('security-test'),
      scanners: ['npm-audit', 'snyk', 'dependency-check'],
      timeout: 120
    }
  };
  
  // Save agent configuration
  const configDir = path.join(process.cwd(), '.claude');
  await fs.ensureDir(configDir);
  await fs.writeJson(path.join(configDir, 'agents.json'), agentConfigs, { spaces: 2 });
  
  console.log(chalk.green(`  ✅ Configured ${projectConfig.agents.length} agents`));
}

async function createProjectConfiguration(projectConfig) {
  console.log(chalk.yellow('⚙️  Creating project configuration...'));
  
  const config = {
    autopilot: {
      enabled: true,
      confidence_threshold: projectConfig.confidence,
      validation_timeout: projectConfig.timeout,
      auto_rollback: true,
      require_reproduction: true,
      
      agents: projectConfig.agents.reduce((acc, agent) => {
        acc[agent] = { enabled: true };
        return acc;
      }, {}),
      
      project: {
        type: projectConfig.type,
        frameworks: projectConfig.frameworks,
        test_command: getTestCommand(projectConfig),
        lint_command: getLintCommand(projectConfig),
        build_command: getBuildCommand(projectConfig)
      }
    }
  };
  
  const configPath = path.join(process.cwd(), '.claude', 'autopilot.json');
  await fs.writeJson(configPath, config, { spaces: 2 });
  
  console.log(chalk.green('  ✅ Project configuration created'));
  console.log(chalk.gray(`  📁 Config saved to: ${configPath}`));
}

function getTestCommand(config) {
  switch (config.type) {
    case 'javascript': return config.testFramework === 'jest' ? 'npm test' : 'npm run test';
    case 'python': return 'pytest';
    case 'rust': return 'cargo test';
    case 'go': return 'go test ./...';
    default: return null;
  }
}

function getLintCommand(config) {
  switch (config.type) {
    case 'javascript': return 'npm run lint';
    case 'python': return 'flake8 .';
    case 'rust': return 'cargo clippy';
    case 'go': return 'golangci-lint run';
    default: return null;
  }
}

function getBuildCommand(config) {
  switch (config.type) {
    case 'javascript': return 'npm run build';
    case 'python': return null;
    case 'rust': return 'cargo build';
    case 'go': return 'go build ./...';
    default: return null;
  }
}

async function installTestingDependencies(projectConfig) {
  console.log(chalk.yellow('📦 Installing testing dependencies...'));
  
  if (projectConfig.type === 'javascript' && projectConfig.agents.includes('gui-test')) {
    const hasPlaywright = await fs.pathExists(path.join(process.cwd(), 'node_modules', 'playwright'));
    
    if (!hasPlaywright) {
      console.log(chalk.blue('  📥 Installing Playwright for GUI testing...'));
      try {
        execSync('npm install --save-dev playwright', { stdio: 'inherit' });
        execSync('npx playwright install', { stdio: 'inherit' });
      } catch (error) {
        console.log(chalk.yellow('  ⚠️  Could not install Playwright automatically. Install manually: npm install --save-dev playwright'));
      }
    }
  }
  
  console.log(chalk.green('  ✅ Testing dependencies ready'));
}

async function validateSetup() {
  console.log(chalk.yellow('✅ Validating installation...'));
  
  const checks = [
    { name: 'Claude Code', check: () => execSync('which claude', { stdio: 'ignore' }) },
    { name: 'AutoPilot hooks', check: () => fs.pathExists(path.join(os.homedir(), '.claude', 'hooks', 'autopilot.js')) },
    { name: 'Project config', check: () => fs.pathExists(path.join(process.cwd(), '.claude', 'autopilot.json')) },
    { name: 'Agent config', check: () => fs.pathExists(path.join(process.cwd(), '.claude', 'agents.json')) }
  ];
  
  for (const check of checks) {
    try {
      await check.check();
      console.log(chalk.green(`  ✅ ${check.name}`));
    } catch (error) {
      console.log(chalk.red(`  ❌ ${check.name}`));
      throw new Error(`Validation failed: ${check.name}`);
    }
  }
}

module.exports = { setupAutopilot };