#!/usr/bin/env node

/**
 * Install AutoPilot hooks into Claude Code settings
 */

const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const chalk = require('chalk');

console.log(chalk.blue('🔧 Installing AutoPilot Hooks...\n'));

async function installHooks() {
  // Paths
  const claudeDir = path.join(os.homedir(), '.claude');
  const settingsPath = path.join(claudeDir, 'settings.json');
  const projectSettingsPath = path.join(process.cwd(), '.claude', 'settings.json');
  const hookScriptPath = path.join(__dirname, '..', 'hooks', 'autopilot-hook.py');
  
  // Ensure directories exist
  await fs.ensureDir(claudeDir);
  await fs.ensureDir(path.join(process.cwd(), '.claude'));
  
  // Make hook script executable
  await fs.chmod(hookScriptPath, '755');
  
  // Load existing settings
  let settings = {};
  if (await fs.pathExists(settingsPath)) {
    settings = await fs.readJson(settingsPath);
  }
  
  // Ensure hooks structure exists
  if (!settings.hooks) {
    settings.hooks = {};
  }
  if (!settings.hooks.PreToolUse) {
    settings.hooks.PreToolUse = [];
  }
  
  // Check if AutoPilot hook already exists
  const existingHook = settings.hooks.PreToolUse.find(
    h => h.hooks && h.hooks[0] && h.hooks[0].command && h.hooks[0].command.includes('autopilot-hook.py')
  );
  
  if (existingHook) {
    console.log(chalk.yellow('⚠️  AutoPilot hook already installed in user settings'));
  } else {
    // Add AutoPilot hook
    const autoPilotHook = {
      "matcher": "Bash|Task",
      "hooks": [
        {
          "type": "command",
          "command": `python3 ${hookScriptPath}`
        }
      ]
    };
    
    settings.hooks.PreToolUse.push(autoPilotHook);
    
    // Save settings
    await fs.writeJson(settingsPath, settings, { spaces: 2 });
    console.log(chalk.green('✓ Installed AutoPilot hook to user settings'));
  }
  
  // Also create project-specific settings
  let projectSettings = {};
  if (await fs.pathExists(projectSettingsPath)) {
    projectSettings = await fs.readJson(projectSettingsPath);
  }
  
  // Add project-specific configuration
  projectSettings.autopilot = {
    "enabled": true,
    "confidence_threshold": 85,
    "agents": [
      "unit-test",
      "integration-test",
      "lint",
      "build"
    ]
  };
  
  await fs.writeJson(projectSettingsPath, projectSettings, { spaces: 2 });
  console.log(chalk.green('✓ Created project-specific AutoPilot settings'));
  
  // Show current configuration
  console.log(chalk.blue('\n📋 Current Hook Configuration:'));
  console.log(chalk.gray(JSON.stringify(settings.hooks.PreToolUse, null, 2)));
  
  console.log(chalk.green('\n✅ AutoPilot hooks installed successfully!'));
  console.log(chalk.yellow('\n💡 Usage:'));
  console.log(chalk.gray('  Add --auto to any command to enable autonomous execution'));
  console.log(chalk.gray('  Example: fix the login bug --auto'));
  console.log(chalk.gray('  Example: add dark mode --auto'));
  
  // Test the hook
  console.log(chalk.blue('\n🧪 Testing hook installation...'));
  const testCommand = {
    tool_name: 'Bash',
    tool_input: {
      command: 'echo "test" --auto'
    }
  };
  
  try {
    const { execSync } = require('child_process');
    const result = execSync(`echo '${JSON.stringify(testCommand)}' | python3 ${hookScriptPath}`, 
      { encoding: 'utf8' });
    
    if (result.includes('AutoPilot Mode Activated')) {
      console.log(chalk.green('✓ Hook is working correctly!'));
    } else {
      console.log(chalk.yellow('⚠️  Hook test produced unexpected output'));
    }
  } catch (error) {
    console.log(chalk.red('❌ Hook test failed:'), error.message);
  }
}

// Run installation
installHooks().catch(error => {
  console.error(chalk.red('❌ Installation failed:'), error);
  process.exit(1);
});
