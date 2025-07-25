# AutoPilot with Empty Projects - Example

## Starting a Brand New Project

```bash
mkdir task-tracker-app
cd task-tracker-app
```

## Running AutoPilot Setup

```
> /autopilot-setup

🔧 Setting up Claude Code AutoPilot...
🔍 Analyzing project structure...
⚠️  No project files detected - appears to be a new project

? What type of project will this be? React Application

📋 Let's create a Product Requirements Document to guide AutoPilot...

? What is the name of your product/project? TaskFlow Pro
? Describe what you're building in 1-2 sentences: A modern task management app that helps teams collaborate on projects with real-time updates and smart prioritization
? Who are your target users? Small to medium teams (5-20 people) working on software projects
? What problem does this solve for your users? Current task tools are either too simple (missing features) or too complex (steep learning curve). Teams need something powerful but intuitive.
? List 3-5 key features (comma separated): task boards, real-time collaboration, smart prioritization, team analytics, mobile app
? What stage is this project in? MVP/Prototype
? Select any specific technical requirements:
  ◉ Real-time updates
  ◉ User authentication
  ◉ Database/persistence
  ◉ API integration
  ◉ Mobile responsive
? Any constraints or special requirements? Must integrate with Slack and GitHub

📄 Creating Product Requirements Document...
✅ Created PRD.md and prd.json
📁 PRD saved to: /Users/you/task-tracker-app/.claude/PRD.md

✅ AutoPilot setup complete!

📋 What was configured:
  • Project type: javascript
  • Testing agents: unit-test, gui-test
  • Validation timeout: 60s
  • Confidence threshold: 85%
```

## Using AutoPilot with the PRD

Now when you use `--auto`, AutoPilot has full context:

```
> create the task board component with drag and drop --auto

AutoPilot: Looking at the PRD, I see TaskFlow Pro needs real-time collaboration.
I'll create a task board component that:
- Supports drag & drop between columns
- Updates in real-time for all team members
- Works well on mobile (as specified in requirements)
- Integrates with your state management for persistence

[Creates component with all these considerations built in]
```

```
> implement user authentication --auto

AutoPilot: Based on your PRD, implementing auth for teams of 5-20 people.
I'll set up:
- Team-based authentication (not just individual users)
- Role-based permissions (admin, member, viewer)
- Slack SSO integration ready (per your constraints)
- Secure session management for real-time features

[Implements auth system tailored to your specific needs]
```

## The PRD Contents

`.claude/PRD.md` contains:

```markdown
# TaskFlow Pro - Product Requirements Document

## Project Overview
**Description**: A modern task management app that helps teams collaborate on projects with real-time updates and smart prioritization
**Project Type**: React
**Stage**: MVP/Prototype

## Target Users
Small to medium teams (5-20 people) working on software projects

## Problem Statement
Current task tools are either too simple (missing features) or too complex (steep learning curve). Teams need something powerful but intuitive.

## Key Features
1. task boards
2. real-time collaboration
3. smart prioritization
4. team analytics
5. mobile app

## Technical Requirements
- Real-time updates
- User authentication
- Database/persistence
- API integration
- Mobile responsive

## Constraints & Special Requirements
Must integrate with Slack and GitHub

## AutoPilot Configuration
This PRD will guide AutoPilot's autonomous execution...
```

## The Difference

Without PRD:
```
> create a task board --auto
# Creates generic task board with basic features
```

With PRD:
```
> create a task board --auto
# Creates task board specifically designed for 5-20 person teams
# with real-time sync, mobile optimization, and integration hooks
# for Slack/GitHub, because AutoPilot knows your requirements!
```