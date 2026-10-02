# Verification — October 2, 2026

## Board cards

These statuses describe the completed implementation in the feature branch. Trello cards should only be moved after checking the linked branch/PR; main may not yet contain the changes.

| Card | Evidence | Implementation status |
| --- | --- | --- |
| Create app scaffold | Python app, HTML/CSS/JS, local startup | Ready |
| Create automated build workflow | GitHub Actions tests and packages a ZIP on push | See actual run history |
| Create the backend and connect to frontend | Real browser create/read/edit/delete calls | Ready |
| Saved expenses table | Test expense rendered and persisted after browser reload | Ready |
| Expenses Categories | Category selection, validation, list labels and category totals | Ready |
| Test cases | 16 backend tests, including upstream API failure and malformed rates | Ready |
| Edit and Delete expenses function | Browser changed $12.50 to $20.25, then deleted the test expense | Ready |
| Expense filtering | Bills filter hid the Food expense; September view showed an empty month | Ready |
| Monthly totals | Browser total updated from $12.50 to $20.25 and then $0 after deletion | Ready |
| Category spending | Food meter and amount matched the test expense | Ready |
| Monthly budget | $100 budget minus $20.25 displayed $79.75; survived reload | Ready |
| Layout and Application states | Desktop and 390px mobile inspected; no page horizontal overflow; empty/loading/success states observed | Ready |
| External information access (new card) | Real API call and browser conversion: 100 EUR → $112.92 USD using rate dated 2026-10-02 | Ready |

## Validation

- `python3 -m unittest discover -s tests -v`: 16 tests.
- JavaScript module syntax checks.
- `python3 scripts/build.py`: packaged app ZIP, excluding databases and caches.
- Live HTTPS request to Frankfurter and local HTTP route verified.
- Browser test used a separate temporary SQLite database, not the user's expense data.
- API failure behavior covered by isolated tests; CI does not depend on the external provider's uptime.

## Remaining submission work

- Merge the reviewed implementation into main.
- Requirement met: ten successful automatic push builds verified; evidence is recorded below.
- Move verified Trello cards to Review / Finished when authenticated board access is available.
- Deploy Penny itself remotely if the instructor requires a public app in addition to external API access.

## Successful automated builds

Each row below was triggered by a separate push containing one task commit. These are actual successful runs, not estimated counts.

| Commit | Task | Build |
| --- | --- | --- |
| `c43727d` | Create app scaffold and automated build workflow | [Passed](https://github.com/Astarosa-MM/expense-tracker/actions/runs/37042017918) |
| `e24c34c` | Add SQLite backend and connect the frontend health check | [Passed](https://github.com/Astarosa-MM/expense-tracker/actions/runs/37042017979) |
| `b7652e8` | Add saved expenses table and categorized expense entry | [Passed](https://github.com/Astarosa-MM/expense-tracker/actions/runs/37042019074) |
| `a313de4` | Add regression tests for expense validation and persistence | [Passed](https://github.com/Astarosa-MM/expense-tracker/actions/runs/37042018758) |
| `42180e8` | Add expense editing and deletion controls | [Passed](https://github.com/Astarosa-MM/expense-tracker/actions/runs/37042023228) |
| `ec101e5` | Add month and category expense filters | [Passed](https://github.com/Astarosa-MM/expense-tracker/actions/runs/37042034651) |
| `31a4655` | Add monthly totals and category spending breakdown | [Passed](https://github.com/Astarosa-MM/expense-tracker/actions/runs/37042038600) |
| `2b16758` | Add monthly budget editing and remaining balance | [Passed](https://github.com/Astarosa-MM/expense-tracker/actions/runs/37042047362) |
| `e23720c` | Polish responsive layout and application states | [Passed](https://github.com/Astarosa-MM/expense-tracker/actions/runs/37042049202) |
| `609c657` | Fetch external exchange rates and verify assignment features | [Passed](https://github.com/Astarosa-MM/expense-tracker/actions/runs/37042056436) |
