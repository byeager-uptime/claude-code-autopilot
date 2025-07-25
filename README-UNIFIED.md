# Claude AutoPilot Pro - Unified Autonomous Execution with Context7 MCP

[![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)](https://github.com/yourusername/claude-autopilot-pro)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Compatible-purple.svg)](https://claude.ai/code)

## 🚀 Overview

Claude AutoPilot Pro integrates the power of autonomous code execution with Context7's Model Context Protocol (MCP) to provide intelligent, context-aware development assistance. Simply add `--auto` to any command in Claude Code to enable autonomous execution with real-time documentation lookup and iterative refinement.

## ✨ Key Features

- **🤖 Autonomous Execution**: Add `--auto` to any command for hands-free development
- **📚 Context7 Integration**: Real-time documentation and context enrichment via MCP
- **🔄 Iterative Refinement**: Automatically refines approach based on validation results
- **🧪 Multi-Agent Validation**: Unit tests, integration tests, security, and performance checks
- **⚡ Seamless Integration**: Works directly within Claude Code with simple hooks
- **🔧 Unified Configuration**: Single config file for all settings
- **🛡️ Safe Rollback**: Automatic rollback on validation failure

## 📦 Installation

### Quick Start (Recommended)

```bash
# One-command installation
npx claude-autopilot-pro setup

# This will:
# ✓ Install AutoPilot hooks into Claude Code
# ✓ Configure Context7 MCP server
# ✓ Set up unified configuration
# ✓ Run validation tests
```

### Manual Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/claude-autopilot-pro.git
cd claude-autopilot-pro

# Install dependencies
npm install

# Run setup wizard
npm run setup

# Install hooks
npm run install-hooks
```

## 🎯 Usage

### Basic Commands

```bash
# Fix bugs autonomously
fix the authentication bug --auto

# Add features with context
add user profile page --auto

# Optimize with performance analysis
optimize database queries --auto

# Force specific context provider
refactor auth system --auto --context=context7
```

### Advanced Options

```bash
# Custom confidence threshold (default: 85%)
add payment flow --auto --confidence=90

# Specify validation agents
fix memory leak --auto --agents=performance,security

# Enable verbose logging
debug api endpoints --auto --verbose
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Claude Code CLI                          │
├─────────────────────────────────────────────────────────────┤
│                  AutoPilot Controller                       │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │ Command     │  │  Execution   │  │   Validation     │ │
│  │ Interceptor │  │   Engine     │  │    Agents        │ │
│  └─────────────┘  └──────────────┘  └──────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    Context7 MCP Layer                       │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │  Resource   │  │    Tool      │  │     Prompt       │ │
│  │  Provider   │  │  Executor    │  │    Handler       │ │
│  └─────────────┘  └──────────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## ⚙️ Configuration

Configuration is stored in `.claude/autopilot-pro.json`:

```json
{
  "autopilot": {
    "enabled": true,
    "confidence_threshold": 85,
    "agents": ["unit-test", "integration-test", "security", "performance"]
  },
  "mcp": {
    "servers": {
      "context7": {
        "command": "npx",
        "args": ["@context7/mcp-server"],
        "env": {
          "CONTEXT7_API_KEY": "${CONTEXT7_API_KEY}"
        }
      }
    }
  },
  "integration": {
    "context_enrichment": true,
    "iterative_refinement": true,
    "max_iterations": 5
  }
}
```

### Environment Variables

```bash
# Optional: Set Context7 API key for enhanced features
export CONTEXT7_API_KEY=your_api_key_here
```

## 🧪 Validation Agents

AutoPilot Pro includes multiple validation agents:

| Agent | Description | Default |
|-------|-------------|---------|
| `unit-test` | Runs unit tests | ✅ Enabled |
| `integration-test` | Runs integration tests | ✅ Enabled |
| `security` | Security vulnerability scanning | ✅ Enabled |
| `performance` | Performance metrics analysis | ✅ Enabled |
| `lint` | Code style checking | ❌ Disabled |
| `type-check` | TypeScript/Flow validation | ❌ Disabled |
| `visual` | Visual regression testing | ❌ Disabled |
| `accessibility` | A11y compliance checking | ❌ Disabled |

### Managing Agents

```bash
# List all agents
autopilot-pro agents --list

# Enable an agent
autopilot-pro agents --enable lint

# Disable an agent
autopilot-pro agents --disable visual
```

## 🔄 How It Works

1. **Command Interception**: Hooks detect `--auto` flag in Claude Code commands
2. **Context Enhancement**: Context7 MCP fetches relevant documentation
3. **Plan Creation**: AutoPilot creates execution plan with context
4. **Iterative Execution**: 
   - Execute plan steps
   - Run validation agents
   - If confidence < threshold, refine and retry
   - Continue until success or max iterations
5. **Result Handling**: Commit changes or rollback on failure

## 📊 CLI Commands

```bash
# Setup and configuration
autopilot-pro setup              # Interactive setup wizard
autopilot-pro config --show       # Show current configuration
autopilot-pro config --edit       # Edit configuration
autopilot-pro config --reset      # Reset to defaults

# Testing and validation
autopilot-pro test                # Test installation
autopilot-pro demo                # Run demonstration

# Agent management
autopilot-pro agents --list       # List available agents
autopilot-pro agents --enable     # Enable an agent
autopilot-pro agents --disable    # Disable an agent

# MCP server management
autopilot-pro mcp --status        # Check MCP server status
autopilot-pro mcp --start         # Start MCP servers
autopilot-pro mcp --stop          # Stop MCP servers
```

## 🔧 Troubleshooting

### Common Issues

1. **AutoPilot not triggering**
   ```bash
   # Check hooks installation
   autopilot-pro test
   
   # Reinstall hooks
   autopilot-pro install-hooks --force
   ```

2. **Context7 connection issues**
   ```bash
   # Check MCP server status
   autopilot-pro mcp --status
   
   # Check API key
   echo $CONTEXT7_API_KEY
   ```

3. **Low confidence scores**
   ```bash
   # Enable more agents
   autopilot-pro agents --enable lint
   autopilot-pro agents --enable type-check
   
   # Adjust threshold
   autopilot-pro config --edit
   ```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

```bash
# Development setup
git clone https://github.com/yourusername/claude-autopilot-pro.git
cd claude-autopilot-pro
npm install
npm run dev
```

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Anthropic](https://anthropic.com) for Claude and Claude Code
- [Context7](https://context7.ai) for MCP integration
- The Model Context Protocol community

## 🔗 Links

- [Documentation](https://docs.claude-autopilot-pro.dev)
- [GitHub Repository](https://github.com/yourusername/claude-autopilot-pro)
- [Issue Tracker](https://github.com/yourusername/claude-autopilot-pro/issues)
- [Changelog](CHANGELOG.md)

---

Made with ❤️ by the AutoPilot Team