# Agent Rules

## Read Order

Read only what the task needs.

1. `CONTEXT.md` - product and domain truth.
2. `DESIGN.md` - UI/design work.
3. `ARCHITECTURE.md` - system shape and cross-module changes, if present.

## Rules

- Use `ponytail` for code generation, implementation, refactoring, bug fixes, code review, and dependency choices. It is the default engineering posture: first check whether the change is needed, then reuse existing code, standard library, platform features, and installed dependencies before writing new code.
- Pair `caveman` with `ponytail` when the user asks for low-token, terse, or brief responses. `ponytail` controls what gets built; `caveman` controls how compactly the result is explained.
- Do not use `caveman` when terseness would make security warnings, destructive-action confirmations, or multi-step instructions unclear.
