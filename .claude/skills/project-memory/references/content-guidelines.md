# CLAUDE.md Content Guidelines

This reference explains what information belongs in CLAUDE.md files and how to maintain them effectively.

## Goals

CLAUDE.md files serve two purposes:
1. **Speed up agent bootstrap**: Help new conversations quickly understand the project without re-discovering everything
2. **Reduce token costs**: Provide condensed, curated knowledge instead of reading entire codebases

## What to Include

### Project-Wide Information (Root CLAUDE.md)

**Architecture & Structure:**
- High-level architecture (microservices, monolith, layers)
- Key directories and their purposes
- How modules interact
- External dependencies and integrations

**Development Standards:**
- Testing approach (TDD, BDD, test-after)
- Code style and linting rules
- Git workflow and branching strategy
- CI/CD pipeline overview

**Project Conventions:**
- Naming conventions for files, classes, functions
- Folder organization principles
- Error handling patterns
- Logging approach

**Setup Knowledge:**
- Required tools and versions
- Environment variables needed
- Build and run commands
- Database setup or migrations

### Module-Specific Information (Module CLAUDE.md)

**Module Behavior:**
- What the module does
- Key functions and classes
- Common usage patterns
- Typical workflows for this module

**Domain Logic:**
- Business rules specific to this module
- Algorithms or calculations used
- Domain concepts that aren't obvious from code
- Edge cases and constraints

**Testing Details:**
- How to run tests for this module
- Test fixtures or factories used
- Mocking patterns
- Test data setup

**Tools & Commands:**
- Module-specific CLI commands
- Build or compile steps
- Debugging commands
- Common troubleshooting

## What NOT to Include

**Avoid:**
- Information already in code comments (DRY principle)
- Basic language/framework documentation (Claude already knows)
- Temporary implementation notes (use code comments instead)
- Overly detailed API docs (keep high-level)
- Step-by-step tutorials (focus on patterns and principles)

**Example of too much detail:**
```markdown
# Bad: Too detailed
The `calculate_tax()` function takes a subtotal as a float and a tax_rate as a 
float between 0 and 1. It multiplies subtotal by (1 + tax_rate) and returns the 
result rounded to 2 decimal places using Python's round() function.
```

**Better approach:**
```markdown
# Good: High-level pattern
Tax calculations use the `calculate_tax()` utility. All monetary values are 
handled as floats and rounded to 2 decimals. Tax rates are stored as decimals 
(0.08 for 8%).
```

## Update Triggers

Update CLAUDE.md files when:

**Project-wide changes:**
- New major dependency added
- Architecture changes
- Testing approach evolves
- New conventions adopted

**Module changes:**
- New feature added with non-obvious behavior
- Domain logic changes
- New testing patterns introduced
- API surface changes significantly

**Don't update for:**
- Minor bug fixes
- Refactoring without behavior change
- Cosmetic code changes
- Small dependency version bumps

## Writing Style

**Be concise:**
- Use bullet points over paragraphs
- Focus on "why" not "what" (code shows "what")
- Include examples for complex concepts
- Link to external docs instead of duplicating

**Be actionable:**
- Include commands that can be copy-pasted
- Show code patterns that can be adapted
- Provide clear steps for common tasks

**Be current:**
- Date your updates
- Remove outdated information
- Mark deprecated patterns clearly

## Organization Principles

**Hierarchical:**
- Root CLAUDE.md for project-wide knowledge
- Module CLAUDE.md for module-specific knowledge
- Don't duplicate between levels

**Discoverable:**
- New conversations should find relevant CLAUDE.md files
- Place CLAUDE.md at the root of each significant module
- Use clear naming: always `CLAUDE.md`

**Maintainable:**
- Keep root CLAUDE.md under 500 lines
- Keep module CLAUDE.md under 300 lines
- Split into multiple files if growing too large
