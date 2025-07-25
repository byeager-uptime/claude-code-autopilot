#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const { setupAutopilot } = require('../dist/setup');
const { runDemo } = require('../dist/demo');
const { validateInstallation } = require('../dist/validation');

program
  .name('claude-autopilot')
  .description('Claude Code AutoPilot - Autonomous execution with multi-agent validation')
  .version(require('../package.json').version);

program
  .command('setup')
  .description('One-command setup for Claude Code AutoPilot')
  .option('-y, --yes', 'Skip confirmation prompts')
  .option('--demo', 'Run demo after setup')
  .action(async (options) => {
    const spinner = ora('Setting up Claude Code AutoPilot...').start();
    
    try {
      await setupAutopilot(options);
      spinner.succeed(chalk.green('✅ AutoPilot setup complete!'));
      
      console.log(chalk.blue('\n🚀 Quick Start:'));
      console.log(chalk.white('  claude "fix the login bug" --auto'));
      console.log(chalk.white('  claude "add loading spinner" --auto'));
      console.log(chalk.white('  claude --autopilot-on  # Enable for all commands'));
      
      if (options.demo) {
        console.log(chalk.blue('\n🎬 Running demo...'));
        await runDemo();
      }
      
    } catch (error) {
      spinner.fail(chalk.red('❌ Setup failed: ' + error.message));
      process.exit(1);
    }
  });

program
  .command('demo')
  .description('Run AutoPilot demo with sample project')
  .action(async () => {
    console.log(chalk.blue('🎬 Starting AutoPilot demo...'));
    await runDemo();
  });

program
  .command('validate')
  .description('Validate AutoPilot installation and Claude Code integration')
  .action(async () => {
    const spinner = ora('Validating installation...').start();
    
    try {
      const result = await validateInstallation();
      
      if (result.success) {
        spinner.succeed(chalk.green('✅ Installation validated successfully'));
        console.log(chalk.blue('\nValidation Results:'));
        result.checks.forEach(check => {
          const status = check.passed ? '✅' : '❌';
          console.log(`  ${status} ${check.name}: ${check.message}`);
        });
      } else {
        spinner.fail(chalk.red('❌ Validation failed'));
        console.log(chalk.red('\nIssues found:'));
        result.checks.filter(c => !c.passed).forEach(check => {
          console.log(`  ❌ ${check.name}: ${check.message}`);
        });
      }
      
    } catch (error) {
      spinner.fail(chalk.red('❌ Validation error: ' + error.message));
      process.exit(1);
    }
  });

program
  .command('uninstall')
  .description('Remove AutoPilot from Claude Code')
  .option('-y, --yes', 'Skip confirmation')
  .action(async (options) => {
    const { uninstallAutopilot } = require('../dist/setup');
    await uninstallAutopilot(options);
  });

program
  .command('update')
  .description('Update AutoPilot to latest version')
  .action(async () => {
    const { updateAutopilot } = require('../dist/setup');
    await updateAutopilot();
  });

program
  .command('config')
  .description('Configure AutoPilot settings')
  .option('--confidence <threshold>', 'Set confidence threshold (0-100)')
  .option('--timeout <seconds>', 'Set validation timeout')
  .option('--agents <list>', 'Enable/disable specific agents')
  .action(async (options) => {
    const { configureAutopilot } = require('../dist/config');
    await configureAutopilot(options);
  });

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.help();
}

program.parse();