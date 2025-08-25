
# First Principle

## Learn from wealthfolio
wealthfolio is a wonderful project and a good teacher. whenever you want to implement some function, you should always look for implementation in the wealthfolio.
It's code located `references/wealthfolio`.

## Write PRD first
Always write prd about new feature in prd/ first, then implement the feature code.

# Development Guidelines


- **Incremental progress over big bangs** - Small changes that compile and pass tests
- **Learning from existing code** - Study and plan before implementing
- **Pragmatic over dogmatic** - Adapt to project reality
- **Don't repeat yourself** Write reusable functions or components
- **Clear intent over clever code** - Be boring and obvious

### Simplicity Means

- Single responsibility per function/class
- Avoid premature abstractions
- No clever tricks - choose the boring solution
- If you need to explain it, it's too complex

## Important Reminders

**NEVER**:
- Use `--no-verify` to bypass commit hooks
- Disable tests instead of fixing them
- Make assumptions - verify with existing code

**ALWAYS**:
- Commit working code incrementally
- Update plan documentation as you go
- Learn from existing implementations
- Record changes to CHANGELOG.md