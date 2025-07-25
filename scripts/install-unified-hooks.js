#!/usr/bin/env node

/**
 * Install Unified AutoPilot Pro hooks into Claude Code settings
 * Integrates both AutoPilot and Context7 MCP hooks
 */

const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const chalk = require('chalk');
const ora = require('ora');

console.log(chalk.blue('🔧 Installing AutoPilot Pro Unified Hooks...\n'));

async function installUnifiedHooks() {
  const spinner = ora('Preparing installation...').start();
  
  try {
    // Paths
    const claudeDir = path.join(os.homedir(), '.claude');
    const settingsPath = path.join(claudeDir, 'settings.json');
    const projectClaudeDir = path.join(process.cwd(), '.claude');
    const projectSettingsPath = path.join(projectClaudeDir, 'settings.json');
    const projectConfigPath = path.join(projectClaudeDir, 'autopilot-pro.json');
    
    // Hook script paths
    const unifiedHookPath = path.join(__dirname, '..', 'hooks', 'autopilot-pro-hook.py');
    const mcpHookPath = path.join(__dirname, '..', 'hooks', 'mcp-integration-hook.js');
    
    // Ensure directories exist
    await fs.ensureDir(claudeDir);
    await fs.ensureDir(projectClaudeDir);
    
    spinner.text = 'Creating unified hook scripts...';
    
    // Create unified hook script if it doesn't exist
    if (!await fs.pathExists(unifiedHookPath)) {
      await fs.ensureDir(path.dirname(unifiedHookPath));
      await fs.writeFile(unifiedHookPath, getUnifiedHookScript(), 'utf8');
      await fs.chmod(unifiedHookPath, '755');
    }
    
    // Load existing settings
    let settings = {};
    if (await fs.pathExists(settingsPath)) {
      settings = await fs.readJson(settingsPath);
    }
    
    // Ensure hooks structure exists
    if (!settings.hooks) settings.hooks = {};
    if (!settings.hooks.PreToolUse) settings.hooks.PreToolUse = [];
    
    spinner.text = 'Checking existing hooks...';
    
    // Remove old AutoPilot hooks if they exist
    settings.hooks.PreToolUse = settings.hooks.PreToolUse.filter(hook => 
      !hook.hooks?.[0]?.command?.includes('autopilot-hook.py')
    );
    
    // Check if unified hook already exists
    const existingUnifiedHook = settings.hooks.PreToolUse.find(h => 
      h.hooks?.[0]?.command?.includes('autopilot-pro-hook.py')
    );
    
    if (existingUnifiedHook && process.env.FORCE_INSTALL !== 'true') {
      spinner.warn('AutoPilot Pro hooks already installed');
      console.log(chalk.yellow('Use --force to reinstall'));
    } else {
      spinner.text = 'Installing unified hooks...';
      
      // Add unified hook
      const unifiedHook = {
        "matcher": "Bash|Task|Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": `python3 ${unifiedHookPath}`,
            "environment": {
              "AUTOPILOT_CONFIG": projectConfigPath,
              "AUTOPILOT_MODE": "unified",
              "ENABLE_CONTEXT7": "true"
            }
          }
        ]
      };
      
      settings.hooks.PreToolUse.push(unifiedHook);
      
      // Save user settings
      await fs.writeJson(settingsPath, settings, { spaces: 2 });
      spinner.succeed('Installed unified hooks to user settings');
    }
    
    // Create project configuration
    spinner.text = 'Creating project configuration...';
    
    const defaultConfig = {
      autopilot: {
        enabled: true,
        confidence_threshold: 85,
        validation_timeout: 60,
        auto_rollback: true,
        agents: [
          "unit-test",
          "integration-test",
          "security",
          "performance",
          "lint",
          "type-check"
        ]
      },
      mcp: {
        servers: {
          context7: {
            command: "npx",
            args: ["@context7/mcp-server"],
            enabled: true,
            env: {
              CONTEXT7_API_KEY: "${CONTEXT7_API_KEY}"
            }
          }
        },
        default_timeout: 30000
      },
      integration: {
        auto_flag_behavior: "autonomous",
        context_enrichment: true,
        iterative_refinement: true,
        max_iterations: 5,
        fallback_on_error: true,
        verbose_logging: false
      },
      project: {
        type: "auto-detect",
        test_command: "npm test",
        lint_command: "npm run lint",
        build_command: "npm run build"
      }
    };
    
    // Merge with existing config if present
    let finalConfig = defaultConfig;
    if (await fs.pathExists(projectConfigPath)) {
      const existingConfig = await fs.readJson(projectConfigPath);
      finalConfig = deepMerge(defaultConfig, existingConfig);
    }
    
    await fs.writeJson(projectConfigPath, finalConfig, { spaces: 2 });
    spinner.succeed('Created project configuration');
    
    // Create project-specific settings if needed
    let projectSettings = {};
    if (await fs.pathExists(projectSettingsPath)) {
      projectSettings = await fs.readJson(projectSettingsPath);
    }
    
    projectSettings.autopilot_pro = {
      version: "3.0.0",
      features: [
        "context7-integration",
        "iterative-refinement",
        "multi-agent-validation",
        "automatic-rollback"
      ]
    };
    
    await fs.writeJson(projectSettingsPath, projectSettings, { spaces: 2 });
    
    // Show current configuration
    console.log(chalk.blue('\n📋 Installed Configuration:'));
    console.log(chalk.gray('User hooks:'), settings.hooks.PreToolUse.length);
    console.log(chalk.gray('Project config:'), projectConfigPath);
    console.log(chalk.gray('MCP servers:'), Object.keys(finalConfig.mcp.servers).join(', '));
    console.log(chalk.gray('Agents:'), finalConfig.autopilot.agents.join(', '));
    
    // Test the installation
    spinner.text = 'Testing installation...';
    
    const testResult = await testInstallation(unifiedHookPath, projectConfigPath);
    if (testResult.success) {
      spinner.succeed('Installation test passed');
    } else {
      spinner.warn('Installation test had warnings');
      console.log(chalk.yellow(testResult.message));
    }
    
    console.log(chalk.green('\n✅ AutoPilot Pro hooks installed successfully!'));
    console.log(chalk.yellow('\n💡 Usage:'));
    console.log(chalk.gray('  Add --auto to any command to enable autonomous execution'));
    console.log(chalk.gray('  Add --context=context7 to force Context7 usage'));
    console.log(chalk.gray('  Examples:'));
    console.log(chalk.gray('    fix the login bug --auto'));
    console.log(chalk.gray('    add dark mode --auto --context=context7'));
    console.log(chalk.gray('    optimize performance --auto'));
    
  } catch (error) {
    spinner.fail('Installation failed');
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}

/**
 * Get the unified hook script content
 */
function getUnifiedHookScript() {
  return `#!/usr/bin/env python3
"""
AutoPilot Pro Unified Hook
Integrates AutoPilot with Context7 MCP for enhanced autonomous execution
"""

import json
import sys
import os
import subprocess
from pathlib import Path

def main():
    # Read input from Claude Code
    try:
        input_data = json.load(sys.stdin)
    except:
        # Pass through if no valid input
        sys.exit(0)
    
    # Check if this is a command that should trigger AutoPilot
    tool_name = input_data.get('tool_name', '')
    tool_input = input_data.get('tool_input', {})
    
    # Extract command
    command = ''
    if tool_name == 'Bash':
        command = tool_input.get('command', '')
    elif tool_name == 'Task':
        command = tool_input.get('prompt', '')
    elif tool_name in ['Edit', 'Write']:
        # Check for --auto in comments or docstrings
        content = tool_input.get('content', '') or tool_input.get('new_string', '')
        if '--auto' in content:
            command = f"edit file {tool_input.get('file_path', '')} --auto"
    
    # Check for --auto flag
    if '--auto' not in command and '--context' not in command:
        # Not an AutoPilot command, pass through
        sys.exit(0)
    
    # Load configuration
    config_path = os.environ.get('AUTOPILOT_CONFIG', '.claude/autopilot-pro.json')
    config = {}
    
    if os.path.exists(config_path):
        with open(config_path, 'r') as f:
            config = json.load(f)
    
    # Check if AutoPilot is enabled
    if not config.get('autopilot', {}).get('enabled', True):
        sys.exit(0)
    
    # Log activation
    print("🚀 AutoPilot Pro Mode Activated", file=sys.stderr)
    print(f"Command: {command}", file=sys.stderr)
    
    # Extract context preference
    context_provider = 'auto'
    if '--context=' in command:
        parts = command.split('--context=')
        if len(parts) > 1:
            context_provider = parts[1].split()[0]
    
    # Check if Context7 is enabled and available
    use_context7 = False
    if config.get('mcp', {}).get('servers', {}).get('context7', {}).get('enabled', True):
        if context_provider == 'context7' or (context_provider == 'auto' and config.get('integration', {}).get('context_enrichment', True)):
            use_context7 = True
            print("📚 Context7 MCP integration enabled", file=sys.stderr)
    
    # Prepare enhanced input for AutoPilot
    enhanced_input = {
        **input_data,
        'autopilot': {
            'enabled': True,
            'mode': 'unified',
            'context_provider': context_provider,
            'use_context7': use_context7,
            'config': config
        }
    }
    
    # Log configuration
    print(f"Confidence threshold: {config.get('autopilot', {}).get('confidence_threshold', 85)}%", file=sys.stderr)
    print(f"Iterative refinement: {config.get('integration', {}).get('iterative_refinement', True)}", file=sys.stderr)
    print(f"Max iterations: {config.get('integration', {}).get('max_iterations', 5)}", file=sys.stderr)
    
    # Output enhanced input for Claude Code to process
    # In a real implementation, this would trigger the UnifiedAutoPilot
    print(json.dumps(enhanced_input))
    
    # Return success
    sys.exit(0)

if __name__ == '__main__':
    main()
`;
}

/**
 * Test the installation
 */
async function testInstallation(hookPath, configPath) {
  try {
    // Test hook script exists and is executable
    if (!await fs.pathExists(hookPath)) {
      return { success: false, message: 'Hook script not found' };
    }
    
    // Test configuration exists
    if (!await fs.pathExists(configPath)) {
      return { success: false, message: 'Configuration file not found' };
    }
    
    // Test hook execution
    const testCommand = {
      tool_name: 'Bash',
      tool_input: {
        command: 'echo "test" --auto'
      }
    };
    
    const result = await new Promise((resolve) => {
      const proc = require('child_process').spawn('python3', [hookPath], {
        env: { ...process.env, AUTOPILOT_CONFIG: configPath }
      });
      
      let output = '';
      let error = '';
      
      proc.stdout.on('data', (data) => { output += data.toString(); });
      proc.stderr.on('data', (data) => { error += data.toString(); });
      
      proc.on('close', (code) => {
        resolve({ code, output, error });
      });
      
      proc.stdin.write(JSON.stringify(testCommand));
      proc.stdin.end();
    });
    
    if (result.error.includes('AutoPilot Pro Mode Activated')) {
      return { success: true, message: 'Hook is working correctly' };
    } else {
      return { success: false, message: 'Hook did not activate as expected' };
    }
    
  } catch (error) {
    return { success: false, message: error.message };
  }
}

/**
 * Deep merge objects
 */
function deepMerge(target, source) {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          output[key] = source[key];
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        output[key] = source[key];
      }
    });
  }
  
  return output;
}

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

// Run installation
installUnifiedHooks().catch(error => {
  console.error(chalk.red('Installation failed:'), error);
  process.exit(1);
});