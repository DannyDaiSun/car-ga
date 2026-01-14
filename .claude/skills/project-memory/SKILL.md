---
name: project-memory
description: "Maintains hierarchical CLAUDE.md files that capture project knowledge to reduce token costs in new conversations. Auto-updates memory files after successful git pushes by analyzing changed files and extracting relevant learnings. Use when working on Claude Code projects where: (1) New conversations need to bootstrap quickly, (2) Project structure, conventions, or domain logic should be preserved, (3) Code changes should automatically update relevant documentation, (4) Token costs from repeated codebase analysis should be minimized."
---

# Project Memory Management

Automatically maintain CLAUDE.md files throughout your codebase to help future Claude conversations bootstrap faster and reduce token costs.

## Core Workflow

### 1. After Successful Git Push - Auto-Update Memory

When you execute `git push` and it completes successfully, **automatically** follow this workflow:

#### Step 1: Detect Push Success

Watch for successful git push completion (exit code 0 with "Writing objects" or similar success messages).

#### Step 2: Analyze Changed Files

```bash
# Get files changed in the last commit
git show --name-only --format="" HEAD

# Get the commit message for context
git log -1 --pretty=%B HEAD
```

#### Step 3: Determine Which CLAUDE.md Files to Update

Map changed files to relevant CLAUDE.md locations:

- **Root CLAUDE.md** (`/CLAUDE.md`): Update if changes affect:
  - Project-wide architecture
  - New major dependencies
  - Testing approach changes
  - Global conventions or standards
  
- **Module CLAUDE.md** (`module/CLAUDE.md`): Update if changes affect files within that module:
  - New features or functionality
  - Domain logic changes
  - Module-specific patterns
  - Testing approach for that module

**Example mapping:**
- Changes to `src/api/users.py` → Update `src/api/CLAUDE.md`
- Changes to `tests/test_utils.py` → Update `tests/CLAUDE.md`
- Added new library in `requirements.txt` → Update root `/CLAUDE.md`
- Changes to `game/physics/collision.py` → Update `game/physics/CLAUDE.md`

#### Step 4: Update Each Relevant CLAUDE.md

For each CLAUDE.md that needs updating:

1. **Check if it exists:**
   ```bash
   test -f path/to/CLAUDE.md && echo "exists" || echo "create new"
   ```

2. **If it doesn't exist, create from template:**
   - For root: Use `assets/CLAUDE.root.template.md`
   - For modules: Use `assets/CLAUDE.module.template.md`

3. **If it exists, read current content:**
   ```bash
   cat path/to/CLAUDE.md
   ```

4. **Determine what to add/update:**
   - Review the changed files in that area
   - Extract key learnings:
     - New patterns or conventions introduced
     - Domain logic that's not obvious from code
     - Tool or command usage
     - Dependencies added
     - Testing patterns
     - Known constraints or gotchas discovered
   - Consult `references/content-guidelines.md` for what makes good content

5. **Update the file:**
   - Preserve existing structure
   - Add new information to appropriate sections
   - Update "Recent Changes" section with date and summary
   - Update "Last updated" footer
   - Keep concise (root <500 lines, module <300 lines)

6. **Example update pattern:**
   ```markdown
   ## Recent Changes
   
   - [2025-01-15] Added pagination support to user API endpoints using `page` and `limit` query params
   - [2025-01-10] Introduced custom authentication middleware
   ```

#### Step 5: Commit Memory Updates

After updating all relevant CLAUDE.md files:

```bash
git add */CLAUDE.md CLAUDE.md
git commit -m "docs: update project memory after [brief feature description]"
git push
```

## When to Create New CLAUDE.md Files

Create a new CLAUDE.md in a directory when:
- The directory represents a distinct module with its own purpose
- There's module-specific knowledge (commands, patterns, domain logic)
- Tests for that module have their own patterns or setup

**Typical locations:**
- `/CLAUDE.md` - Always (project root)
- `/src/CLAUDE.md` - If src has multiple unrelated modules
- `/src/api/CLAUDE.md` - For API-specific patterns
- `/src/models/CLAUDE.md` - For data model conventions
- `/tests/CLAUDE.md` - For testing setup and patterns
- `/game/physics/CLAUDE.md` - For domain-specific logic

**Don't create for:**
- Small utility directories
- Directories with only 1-2 files
- Temporary or experimental code

## Initial Setup

If this is the first time using this skill on a project:

1. Create root CLAUDE.md from template:
   ```bash
   cp assets/CLAUDE.root.template.md /path/to/project/CLAUDE.md
   ```

2. Fill in the template sections with current project knowledge

3. Create module CLAUDE.md files for major modules:
   ```bash
   cp assets/CLAUDE.module.template.md /path/to/module/CLAUDE.md
   ```

4. Commit initial memory files:
   ```bash
   git add CLAUDE.md */CLAUDE.md
   git commit -m "docs: initialize project memory"
   git push
   ```

## Content Guidelines

See `references/content-guidelines.md` for comprehensive guidance on:
- What information to include vs exclude
- Writing style and organization
- Update triggers
- How to keep content concise and actionable

**Quick principles:**
- Focus on "why" and patterns, not "what" (code shows "what")
- Include non-obvious domain logic and constraints
- Provide commands and code patterns
- Keep it current - remove outdated info
- Be concise - use bullets and examples

## Integration with PR Workflow

When you issue a PR, the updated CLAUDE.md files are included automatically:

1. Feature implementation → git push → CLAUDE.md auto-updated
2. You issue PR (includes code + updated memory)
3. Future conversations benefit from the updated knowledge

## Benefits

**Token savings:** New conversations read CLAUDE.md files instead of analyzing entire codebase

**Faster bootstrap:** Agent understands project conventions and structure immediately

**Knowledge preservation:** Important decisions and patterns are captured as they're made

**PR documentation:** Memory updates serve as high-level documentation in PRs

## Bundled Resources

### Assets

- `assets/CLAUDE.root.template.md`: Template for project root CLAUDE.md with project-wide guidelines
- `assets/CLAUDE.module.template.md`: Template for module-level CLAUDE.md files

### References

- `references/content-guidelines.md`: Comprehensive guide on writing effective CLAUDE.md content
