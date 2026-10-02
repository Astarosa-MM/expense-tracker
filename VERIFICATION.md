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
- Confirm at least 10 successful automatic workflow runs in GitHub; commits alone are not build evidence.
- Move verified Trello cards to Done when authenticated board access is available.
- Deploy Penny itself remotely if the instructor requires a public app in addition to external API access.
