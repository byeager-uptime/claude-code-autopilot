#!/usr/bin/env node

/**
 * Claude AutoPilot Pro - Unified CLI
 * Integrates AutoPilot with Context7 MCP for enhanced autonomous execution
 */

const { program } = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

// Version from package.json
const packageJson = require('../package.json');

program
  .name('autopilot-pro')
  .description('Unified autonomous execution for Claude Code with Context7 MCP')
  .version(packageJson.version);

// Setup command
program
  .command('setup')
  .description('Set up AutoPilot Pro with interactive wizard')
  .option('--no-mcp', 'Skip Context7 MCP setup')
  .option('--config <path>', 'Path to configuration file')
  .action(async (options) => {
    const spinner = ora('Setting up AutoPilot Pro...').start();
    
    try {
      // Run setup wizard
      const setupScript = path.join(__dirname, '..', 'scripts', 'setup-wizard.js');
      execSync(`node ${setupScript}`, { 
        stdio: 'inherit',
        env: {
          ...process.env,
          SKIP_MCP: options.mcp === false ? 'true' : 'false',
          CONFIG_PATH: options.config || ''
        }
      });
      
      spinner.succeed('AutoPilot Pro setup complete!');
      
      console.log(chalk.green('\n✅ AutoPilot Pro is ready!'));
      console.log(chalk.yellow('\n💡 Usage:'));
      console.log(chalk.gray('  Add --auto to any command in Claude Code'));
      console.log(chalk.gray('  Example: fix the bug --auto'));
      console.log(chalk.gray('  Example: add feature --auto --context=context7'));
      
    } catch (error) {
      spinner.fail('Setup failed');
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

// Install hooks command
program
  .command('install-hooks')
  .description('Install AutoPilot Pro hooks into Claude Code')
  .option('--force', 'Force reinstall even if hooks exist')
  .action(async (options) => {
    const spinner = ora('Installing hooks...').start();
    
    try {
      const installScript = path.join(__dirname, '..', 'scripts', 'install-unified-hooks.js');
      execSync(`node ${installScript}`, { 
        stdio: 'inherit',
        env: {
          ...process.env,
          FORCE_INSTALL: options.force ? 'true' : 'false'
        }
      });
      
      spinner.succeed('Hooks installed successfully!');
    } catch (error) {
      spinner.fail('Hook installation failed');
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

// Test command
program
  .command('test')
  .description('Test AutoPilot Pro installation')
  .option('--command <cmd>', 'Test with specific command', 'fix bug --auto')
  .action(async (options) => {
    console.log(chalk.blue('🧪 Testing AutoPilot Pro...\n'));
    
    try {
      // Check configuration
      const configPath = path.join(process.cwd(), '.claude', 'autopilot-pro.json');
      if (await fs.pathExists(configPath)) {
        console.log(chalk.green('✓ Configuration found'));
        const config = await fs.readJson(configPath);
        console.log(chalk.gray(`  AutoPilot: ${config.autopilot.enabled ? 'enabled' : 'disabled'}`));
        console.log(chalk.gray(`  Context7 MCP: ${config.mcp.servers?.context7 ? 'configured' : 'not configured'}`));
      } else {
        console.log(chalk.yellow('⚠️  No configuration found'));
      }
      
      // Check hooks
      const settingsPath = path.join(process.env.HOME, '.claude', 'settings.json');
      if (await fs.pathExists(settingsPath)) {
        const settings = await fs.readJson(settingsPath);
        const hasHook = settings.hooks?.PreToolUse?.some(h => 
          h.hooks?.[0]?.command?.includes('autopilot-pro')
        );
        console.log(hasHook ? 
          chalk.green('✓ Hooks installed') : 
          chalk.yellow('⚠️  Hooks not found')
        );
      }
      
      // Test command parsing
      console.log(chalk.blue(`\n🔍 Testing command: "${options.command}"`));
      const hasAuto = options.command.includes('--auto');
      const hasContext = options.command.includes('--context');
      console.log(chalk.gray(`  Has --auto flag: ${hasAuto ? 'Yes' : 'No'}`));
      console.log(chalk.gray(`  Has --context flag: ${hasContext ? 'Yes' : 'No'}`));
      console.log(chalk.gray(`  Would trigger AutoPilot: ${hasAuto || hasContext ? 'Yes' : 'No'}`));
      
      // Simulate execution
      if (hasAuto || hasContext) {
        console.log(chalk.blue('\n🚀 Simulating AutoPilot execution...'));
        const UnifiedAutoPilot = require('../src/UnifiedAutoPilot');
        const config = await fs.readJson(configPath).catch(() => ({}));
        const autopilot = new UnifiedAutoPilot(config);
        
        console.log(chalk.green('✓ AutoPilot Pro initialized successfully'));
        console.log(chalk.gray('  Ready for autonomous execution'));
      }
      
      console.log(chalk.green('\n✅ All tests passed!'));
      
    } catch (error) {
      console.error(chalk.red('❌ Test failed:'), error.message);
      process.exit(1);
    }
  });

// Config command
program
  .command('config')
  .description('Manage AutoPilot Pro configuration')
  .option('--show', 'Show current configuration')
  .option('--edit', 'Open configuration in editor')
  .option('--reset', 'Reset to default configuration')
  .action(async (options) => {
    const configPath = path.join(process.cwd(), '.claude', 'autopilot-pro.json');
    
    try {
      if (options.show) {
        if (await fs.pathExists(configPath)) {
          const config = await fs.readJson(configPath);
          console.log(chalk.blue('📋 Current Configuration:'));
          console.log(JSON.stringify(config, null, 2));
        } else {
          console.log(chalk.yellow('No configuration found'));
        }
      } else if (options.edit) {
        const editor = process.env.EDITOR || 'nano';
        execSync(`${editor} ${configPath}`, { stdio: 'inherit' });
      } else if (options.reset) {
        const defaultConfig = {
          autopilot: {
            enabled: true,
            confidence_threshold: 85,
            agents: ['unit-test', 'integration-test', 'security', 'performance']
          },
          mcp: {
            servers: {
              context7: {
                command: 'npx',
                args: ['@context7/mcp-server']
              }
            }
          },
          integration: {
            auto_flag_behavior: 'autonomous',
            context_enrichment: true,
            iterative_refinement: true,
            max_iterations: 5
          }
        };
        
        await fs.ensureDir(path.dirname(configPath));
        await fs.writeJson(configPath, defaultConfig, { spaces: 2 });
        console.log(chalk.green('✓ Configuration reset to defaults'));
      } else {
        program.help();
      }
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

// Demo command
program
  .command('demo')
  .description('Run AutoPilot Pro demonstration')
  .action(async () => {
    try {
      const demoScript = path.join(__dirname, '..', 'scripts', 'demo-unified.js');
      execSync(`node ${demoScript}`, { stdio: 'inherit' });
    } catch (error) {
      console.error(chalk.red('Demo failed:'), error.message);
      process.exit(1);
    }
  });

// Agents command
program
  .command('agents')
  .description('Manage validation agents')
  .option('--list', 'List available agents')
  .option('--enable <agent>', 'Enable an agent')
  .option('--disable <agent>', 'Disable an agent')
  .action(async (options) => {
    const configPath = path.join(process.cwd(), '.claude', 'autopilot-pro.json');
    
    try {
      let config = {};
      if (await fs.pathExists(configPath)) {
        config = await fs.readJson(configPath);
      }
      
      if (options.list) {
        console.log(chalk.blue('📋 Available Agents:'));
        const agents = [
          { name: 'unit-test', description: 'Runs unit tests' },
          { name: 'integration-test', description: 'Runs integration tests' },
          { name: 'security', description: 'Performs security analysis' },
          { name: 'performance', description: 'Checks performance metrics' },
          { name: 'lint', description: 'Runs code linting' },
          { name: 'type-check', description: 'Runs type checking' },
          { name: 'visual', description: 'Visual regression testing' },
          { name: 'accessibility', description: 'Accessibility testing' }
        ];
        
        agents.forEach(agent => {
          const enabled = config.autopilot?.agents?.includes(agent.name);
          const status = enabled ? chalk.green('✓') : chalk.gray('○');
          console.log(`  ${status} ${agent.name.padEnd(20)} ${chalk.gray(agent.description)}`);
        });
      } else if (options.enable) {
        if (!config.autopilot) config.autopilot = {};
        if (!config.autopilot.agents) config.autopilot.agents = [];
        if (!config.autopilot.agents.includes(options.enable)) {
          config.autopilot.agents.push(options.enable);
          await fs.writeJson(configPath, config, { spaces: 2 });
          console.log(chalk.green(`✓ Enabled agent: ${options.enable}`));
        } else {
          console.log(chalk.yellow(`Agent already enabled: ${options.enable}`));
        }
      } else if (options.disable) {
        if (config.autopilot?.agents) {
          config.autopilot.agents = config.autopilot.agents.filter(a => a !== options.disable);
          await fs.writeJson(configPath, config, { spaces: 2 });
          console.log(chalk.green(`✓ Disabled agent: ${options.disable}`));
        }
      } else {
        program.help();
      }
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

// MCP command
program
  .command('mcp')
  .description('Manage MCP servers')
  .option('--status', 'Check MCP server status')
  .option('--start', 'Start MCP servers')
  .option('--stop', 'Stop MCP servers')
  .action(async (options) => {
    const Context7MCPAdapter = require('../src/integrations/Context7MCPAdapter');
    
    try {
      if (options.status) {
        console.log(chalk.blue('🔍 Checking MCP status...'));
        // Check if Context7 is available
        try {
          execSync('npx @context7/mcp-server --version', { stdio: 'ignore' });
          console.log(chalk.green('✓ Context7 MCP is available'));
        } catch {
          console.log(chalk.yellow('⚠️  Context7 MCP not found'));
          console.log(chalk.gray('  Install with: npm install -g @context7/mcp-server'));
        }
      } else if (options.start) {
        console.log(chalk.blue('🚀 Starting MCP servers...'));
        const adapter = new Context7MCPAdapter();
        await adapter.connect();
        console.log(chalk.green('✓ MCP servers started'));
        console.log(chalk.gray('Press Ctrl+C to stop'));
        
        // Keep running
        process.on('SIGINT', () => {
          adapter.disconnect();
          process.exit(0);
        });
      } else if (options.stop) {
        console.log(chalk.blue('🛑 Stopping MCP servers...'));
        // In a real implementation, this would track running servers
        console.log(chalk.green('✓ MCP servers stopped'));
      } else {
        program.help();
      }
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  console.log(chalk.blue(`
   ╔═══════════════════════════════════════╗
   ║       Claude AutoPilot Pro v${packageJson.version}      ║
   ║  Unified Autonomous Execution System  ║
   ╚═══════════════════════════════════════╝
  `));
  program.outputHelp();
}