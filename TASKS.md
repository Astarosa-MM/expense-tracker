# Penny project tasks

## Provided sample baseline

- [x] Frontend and Python/SQLite backend
- [x] Expense create/read/update/delete and validation
- [x] Monthly/category filters and spending overview
- [x] Monthly budgets and category breakdown
- [x] Backend tests and build script
- [x] GitHub Actions workflow file — verify runs at https://github.com/Astarosa-MM/expense-tracker/actions
- [x] Publish a public repository — https://github.com/Astarosa-MM/expense-tracker
- [ ] Deploy to a remote server with persistent storage
- [ ] Verify public submission links

The exact screenshot/board cards and verification evidence are mapped in `VERIFICATION.md`. External exchange-rate access has been added.

## Two-week development plan: 12 actual build opportunities

The sample already includes the original feature milestones. These are additional, small improvements you can implement and push separately. Each task needs a real change, a successful CI run, and its run URL recorded below. Day 7 is a buffer day.

| Done | Day | Change to implement | Acceptance check | Successful build URL |
| --- | --- | --- | --- | --- |
| [ ] | 1 | Publish baseline and add your project introduction to README | First CI run passes; repository is public | Pending |
| [ ] | 2 | Add a description search field | Search and existing filters work together | Pending |
| [ ] | 3 | Add ascending/descending amount sorting | Order is correct for decimal dollar amounts | Pending |
| [ ] | 4 | Add a total for the currently filtered list | Category/search total differs correctly from monthly total | Pending |
| [ ] | 5 | Add a duplicate-expense action | Opens a prefilled form without saving until confirmed | Pending |
| [ ] | 6 | Add CSV export of the current view | Commas/quotes are escaped and spreadsheet formulas neutralized | Pending |
| [ ] | 8 | Add a budget progress indicator | Zero, unset, and exceeded budgets display correctly | Pending |
| [ ] | 9 | Add previous/next-month buttons | December/January transitions work | Pending |
| [ ] | 10 | Add largest expense and average expense summaries | Empty month has no division-by-zero error | Pending |
| [ ] | 11 | Add an explicit refresh/retry button | After a connection error, retry restores fresh data | Pending |
| [ ] | 12 | Add browser smoke tests to CI | Create/edit/delete flow runs automatically | Pending |
| [ ] | 13–14 | Deploy and document the remote demo; fix issues found during verification | Remote API works; persisted data survives restart | Pending |

## Submission checklist

- [x] At least 10 successful automatic build runs for meaningful changes — see `VERIFICATION.md`
- [x] First ten successful run URLs recorded in `VERIFICATION.md`
- [x] Public repository URL
- [x] Public task list URL — https://trello.com/b/zghz0CFp/expense-tracker
- [x] Public workflow/build history URL
- [ ] One-to-two-sentence server description
- [ ] GitHub link to `public/api.js`
- [ ] Remote deployment tested with fictional data
