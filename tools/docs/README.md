# @dgd/docs-tools

Generators and integrity checks that keep the planning documents consistent.

| Command           | What it does                                                                                                                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm docs:gen`   | Regenerates the generated docs listed below                                                                                                                                                 |
| `pnpm docs:check` | Writes nothing. Fails if a generated doc is stale, an ID is unknown or duplicated, or an in-scope feature lacks an FR, story, task or test case. Also runs under turbo as the `check` task. |

| Module         | Output                                                                        |
| -------------- | ----------------------------------------------------------------------------- |
| `lib.js`       | Shared parsing (registry, SRS, task status) and test-case ID allocation       |
| `plan.js`      | `docs/implementation/IMPLEMENTATION_MASTER_PLAN.md`, `MASTER_TASK_TRACKER.md` |
| `test-plan.js` | `docs/qa/TEST_PLAN.md`                                                        |
| `trace.js`     | `docs/qa/TRACEABILITY_MATRIX.md` and the integrity report                     |

## Editing

- **Tasks:** edit `tasks.js`. Append new tasks at the end of their phase. Test-case IDs are allocated in order, so tasks appended after existing ones don't renumber them.
- **Status:** edit `task-status.json`. Values are `Not started`, `In progress`, `In review`, `Done` and `Verified`. Unknown task IDs fail the run.
- **Generated files:** never edit them by hand. `pnpm docs:check` catches drift.
