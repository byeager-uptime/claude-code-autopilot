#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Claude Code command: /autopilot-setup
 * Sets up AutoPilot for the current project from within Claude
 */

async function executeAutopilotSetup() {
  console.log('🔧 Setting up Claude Code AutoPilot...\n');
  
  try {
    // Check if AutoPilot is installed globally
    try {
      execSync('which claude-autopilot', { stdio: 'ignore' });
    } catch (error) {
      console.log('❌ AutoPilot not installed. Please install first:');
      console.log('   npm install -g claude-code-autopilot');
      return;
    }
    
    // Run the setup using the installed CLI
    const cwd = process.cwd();
    console.log(`📁 Setting up AutoPilot in: ${cwd}\n`);
    
    // Execute the setup command
    execSync('claude-autopilot setup -y', { 
      stdio: 'inherit',
      cwd: cwd 
    });
    
    console.log('\n✅ AutoPilot setup complete!');
    console.log('\n🚀 You can now use the --auto flag:');
    console.log('   fix the login bug --auto');
    console.log('   add loading spinner --auto');
    console.log('   optimize the database query --auto');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure AutoPilot is installed: npm install -g claude-code-autopilot');
    console.log('2. Check permissions for creating .claude directory');
    console.log('3. Try running setup outside Claude: claude-autopilot setup');
  }
}

// Execute the command
executeAutopilotSetup();