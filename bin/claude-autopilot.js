#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const { setupAutopilot } = require('../scripts/setup');
const { runDemo } = require('../scripts/demo');

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
    console.log(chalk.blue('🔍 Validating Claude Code AutoPilot installation...'));
    
    // Basic validation checks
    const checks = [
      { name: 'Node.js', test: () => process.version },
      { name: 'Claude CLI', test: () => require('child_process').execSync('which claude', { encoding: 'utf8' }) },
      { name: 'AutoPilot package', test: () => require('../package.json').version }
    ];
    
    let allPassed = true;
    
    for (const check of checks) {
      try {
        const result = check.test();
        console.log(chalk.green(`  ✅ ${check.name}: ${result.toString().trim()}`));
      } catch (error) {
        console.log(chalk.red(`  ❌ ${check.name}: Not found`));
        allPassed = false;
      }
    }
    
    if (allPassed) {
      console.log(chalk.green('\n✅ Installation validated successfully!'));
    } else {
      console.log(chalk.red('\n❌ Some checks failed. Please install missing dependencies.'));
    }
  });

program
  .command('uninstall')
  .description('Remove AutoPilot from Claude Code')
  .option('-y, --yes', 'Skip confirmation')
  .action(async (options) => {
    console.log(chalk.blue('🗑️  Uninstalling AutoPilot...'));
    console.log(chalk.gray('This would remove AutoPilot hooks and configuration.'));
    console.log(chalk.yellow('⚠️  Uninstall functionality not yet implemented.'));
  });

program
  .command('update')
  .description('Update AutoPilot to latest version')
  .action(async () => {
    console.log(chalk.blue('📦 Updating AutoPilot...'));
    console.log(chalk.gray('This would update to the latest version.'));
    console.log(chalk.yellow('⚠️  Update functionality not yet implemented.'));
  });

program
  .command('config')
  .description('Configure AutoPilot settings')
  .option('--confidence <threshold>', 'Set confidence threshold (0-100)')
  .option('--timeout <seconds>', 'Set validation timeout')
  .option('--agents <list>', 'Enable/disable specific agents')
  .action(async (options) => {
    console.log(chalk.blue('⚙️  Configuring AutoPilot...'));
    console.log(chalk.gray('Options provided:'), options);
    console.log(chalk.yellow('⚠️  Configuration functionality not yet implemented.'));
  });

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.help();
}

program.parse();