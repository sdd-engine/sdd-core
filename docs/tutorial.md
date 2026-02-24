# Tutorial: Build a Restaurant Management System

This tutorial walks you through building a restaurant management system using the SDD plugin. You'll learn the complete SDD workflow from project initialization to a running application.

> **Note:** This tutorial uses the [fullstack-typescript tech pack](https://github.com/sdd-engine/sdd-fullstack-typescript-techpack) for concrete examples. The SDD core workflow (spec → plan → implement → verify) is the same regardless of tech pack. Parts 6 and some implementation details are tech-pack-specific.

---

## What You'll Build

A restaurant management system with:
- **Menu Management**: Create, update, and organize menu items by category
- **Order Processing**: Take orders, track status, calculate totals
- **Customer Interface**: Browse menu and place orders

---

## Prerequisites

1. **Claude Code CLI** installed and authenticated
2. **SDD Plugin** installed:
   ```bash
   claude mcp add-plugin "https://raw.githubusercontent.com/sdd-engine/sdd-core/main/.claude-plugin/marketplace.json"
   ```
3. **Node.js 20+** and **npm**
4. **A tech pack** installed (this tutorial uses the fullstack-typescript tech pack)
5. Any tech-pack-specific prerequisites (e.g., Docker for database components)

---

## Part 1: Initialize the Project

### Step 1.1: Create and Enter Project Directory

```bash
mkdir restaurant-app
cd restaurant-app
claude
```

### Step 1.2: Run SDD Init

```
/sdd I want to initialize a new project
```

SDD verifies your environment, detects the project name from the directory, and creates a minimal project structure with just a config component.

Components are scaffolded on-demand when you create your first change.

### Step 1.3: Install Dependencies

```bash
npm install
```

---

## Part 2: Create the Menu Feature

### Step 2.1: Create a Feature Branch

```bash
git checkout -b feature/menu-management
```

### Step 2.2: Create the Feature Spec

```
/sdd I want to create a new feature
```

SDD guides you through a solicitation workflow with questions about:

| Step | Questions |
|------|-----------|
| Context | What problem does this solve? |
| Functional Requirements | What should it do? |
| Non-Functional Requirements | Performance, security needs? |
| User Stories | Who uses this and how? |
| Acceptance Criteria | How do we verify it works? |

SDD creates a spec file in `changes/2026/02/01/menu-management/`:

- **SPEC.md** - Complete technical specification with Domain Model, Specs Directory Changes, user stories, API design, data model, and acceptance criteria

### Step 2.3: Review the Spec

Open `SPEC.md` and review what SDD generated:

- **User Stories**: What users can do
- **API Endpoints**: REST API design for categories and menu items
- **Data Model**: Database tables and relationships
- **Acceptance Criteria**: Testable requirements in Given/When/Then format
- **Testing Strategy**: Unit, integration, and E2E test approach

Edit the spec if you need changes. The spec is the source of truth for implementation.

### Step 2.4: Commit the Spec

```
/commit
```

---

## Part 3: Approve and Implement the Menu Feature

### Step 3.1: Approve the Spec

Review the spec, then approve it to create the plan:

```
/sdd I want to approve the spec
```

### Step 3.2: Approve the Plan

Review the plan, then approve it to enable implementation:

```
/sdd I want to approve the plan
```

### Step 3.3: Run Implementation

```
/sdd I want to start implementing
```

SDD reads your spec and executes implementation phases using specialized agents provided by your tech pack. Each agent handles a different domain (API contracts, server logic, UI, testing, verification) and works autonomously based on the spec. You'll see progress as files are created and tests pass.

### Step 3.4: Commit the Implementation

```
/commit
```

---

## Part 4: Add Order Management

### Step 4.1: Create the Order Feature

```
/sdd I want to create a new feature
```

**Describe it**: Process customer orders with status tracking and total calculation

### Step 4.2: Review, Approve, and Implement

```
/sdd I want to approve the spec
/sdd I want to approve the plan
/sdd I want to start implementing
/commit
```

---

## Part 5: Verify Everything Works

### Step 5.1: Verify Each Feature

```
/sdd I want to verify the implementation
```

SDD checks that:
- All acceptance criteria have corresponding tests
- All tests pass
- Implementation matches the spec

---

## Part 6: Run the Application

> **Tech-pack-specific:** The commands below depend on your installed tech pack. See your tech pack's documentation for details.

### Step 6.1: Set Up Infrastructure

Use `/sdd` to set up any infrastructure components (databases, caches, etc.) that your tech pack manages.

### Step 6.2: Generate Local Config

```
/sdd I want to generate config for local
```

### Step 6.3: Start the Services

Follow your tech pack's instructions for starting development servers.

---

## Part 7: Merge and Continue

### Step 7.1: Merge Your Branch

```bash
git checkout main
git merge feature/menu-management
```

### Step 7.2: Add More Features

Each new feature follows the same pattern:

```
git checkout -b feature/your-feature
/sdd I want to create a new feature
# Review SPEC.md
/sdd I want to approve the spec
/sdd I want to approve the plan
/sdd I want to start implementing
/commit
/sdd I want to verify the implementation
git checkout main && git merge feature/your-feature
```

---

## Summary

| Step | Command |
|------|---------|
| Initialize project | `/sdd I want to initialize a new project` |
| Create feature spec | `/sdd I want to create a new feature` |
| Approve spec | `/sdd I want to approve the spec` |
| Approve plan | `/sdd I want to approve the plan` |
| Implement feature | `/sdd I want to start implementing` |
| Verify feature | `/sdd I want to verify the implementation` |
| Check status | `/sdd` |
| Manage config | `/sdd I want to generate config for local` |

**The SDD workflow:**

1. **Spec first** - Define what you're building before writing code
2. **Two-stage approval** - Review spec, then review plan before implementation
3. **Specialized agents** - Tech pack agents handle their respective domains
4. **TDD built-in** - Tests are written during implementation
5. **Verification** - Ensure implementation matches spec

---

## Troubleshooting

### "Command not found"

Install the SDD plugin:
```bash
claude mcp add-plugin "https://raw.githubusercontent.com/sdd-engine/sdd-core/main/.claude-plugin/marketplace.json"
```

### "Tests failing"

Check test output:
```bash
npm test -- --reporter verbose
```

---

## Next Steps

Ideas for extending your restaurant app:

- `/sdd I want to create a new feature` - user authentication
- `/sdd I want to create a new feature` - payment processing
- `/sdd I want to create a new feature` - table reservations

---

## Further Reading

- [Commands Reference](commands.md)
- [Workflows](workflows.md)
- [Getting Started](getting-started.md)
