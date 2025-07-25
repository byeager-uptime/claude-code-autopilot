#!/usr/bin/env python3
"""
AutoPilot Hook for Claude Code
This hook intercepts commands with --auto flag and modifies Claude's behavior
to be more autonomous.
"""

import json
import sys
import os
import re

def main():
    # Read input from stdin
    try:
        data = json.load(sys.stdin)
    except:
        # If no JSON input, let it pass
        sys.exit(0)
    
    tool_name = data.get('tool_name', '')
    tool_input = data.get('tool_input', {})
    
    # Check for --auto flag in various tools
    command = None
    if tool_name == 'Bash':
        command = tool_input.get('command', '')
    elif tool_name == 'Task':
        command = tool_input.get('prompt', '')
    
    if not command or '--auto' not in command:
        # No --auto flag, let it pass
        sys.exit(0)
    
    # AutoPilot is activated!
    clean_command = command.replace('--auto', '').strip()
    
    # Determine the type of task
    task_type = analyze_command(clean_command)
    
    # Generate autonomous execution plan
    plan = generate_execution_plan(task_type, clean_command)
    
    # Create feedback that guides Claude to work autonomously
    feedback = create_autonomous_feedback(task_type, clean_command, plan)
    
    # Output the hook response
    response = {
        "action": "block",
        "feedback": feedback
    }
    
    print(json.dumps(response))
    sys.exit(0)

def analyze_command(command):
    """Analyze the command to determine task type"""
    command_lower = command.lower()
    
    if any(word in command_lower for word in ['fix', 'debug', 'error', 'bug']):
        return 'fix'
    elif any(word in command_lower for word in ['add', 'implement', 'create', 'build']):
        return 'feature'
    elif any(word in command_lower for word in ['test', 'verify', 'check']):
        return 'test'
    elif any(word in command_lower for word in ['refactor', 'improve', 'optimize']):
        return 'refactor'
    elif any(word in command_lower for word in ['analyze', 'review', 'audit']):
        return 'analyze'
    else:
        return 'general'

def generate_execution_plan(task_type, command):
    """Generate a detailed execution plan based on task type"""
    plans = {
        'fix': [
            "Search for files related to the issue",
            "Read and understand the problematic code",
            "Identify the root cause",
            "Implement the fix",
            "Add or update tests",
            "Run all tests to verify"
        ],
        'feature': [
            "Analyze existing code structure",
            "Design the feature architecture",
            "Create necessary files",
            "Implement the feature",
            "Add comprehensive tests",
            "Update documentation",
            "Run validation suite"
        ],
        'test': [
            "Identify what needs testing",
            "Create test files",
            "Write comprehensive test cases",
            "Run tests and verify coverage",
            "Fix any failing tests"
        ],
        'refactor': [
            "Analyze current implementation",
            "Identify improvement opportunities",
            "Create refactoring plan",
            "Implement changes incrementally",
            "Ensure tests still pass",
            "Verify no regressions"
        ],
        'analyze': [
            "Gather relevant files",
            "Perform deep analysis",
            "Create detailed report",
            "Identify issues or improvements",
            "Document findings"
        ],
        'general': [
            "Understand the request",
            "Plan the approach",
            "Execute the task",
            "Verify the results"
        ]
    }
    
    return plans.get(task_type, plans['general'])

def create_autonomous_feedback(task_type, command, plan):
    """Create feedback that guides Claude to work autonomously"""
    feedback = f"""🤖 AutoPilot Mode Activated!

Task: {command}
Type: {task_type.capitalize()}

Autonomous Execution Plan:
"""
    
    for i, step in enumerate(plan, 1):
        feedback += f"{i}. {step}\n"
    
    feedback += """
🚨 IMPORTANT: Execute this plan AUTONOMOUSLY:
- Do NOT ask for permission between steps
- Do NOT use interactive Task() calls
- Do NOT wait for user confirmation
- Execute all steps in sequence
- Only report back when complete or if truly blocked

Use these principles:
1. Read files before editing them
2. Run tests after making changes
3. Create new files when needed
4. Fix any issues that arise
5. Complete the entire task

Start executing the plan now!"""
    
    return feedback

if __name__ == '__main__':
    main()
