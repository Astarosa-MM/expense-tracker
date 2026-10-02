# Penny — sample expense tracker

A small full-stack classroom project using HTML/CSS/JavaScript, a Python HTTP API, and SQLite. No npm installation is needed. Core expense tracking runs locally; the currency converter needs internet access to Frankfurter. Requires Python 3.10 or later.

## Run locally

Open a terminal in this folder:

```sh
python3 server.py
```

Visit http://localhost:8000. Stop with Ctrl+C. Add fictional expenses using the form; the database starts empty. SQLite saves expenses and monthly budgets in `data/expenses.sqlite3`, including after restart. Dollar values are stored as integer cents. One currency: USD.

## Included

- Create, list, edit, and delete expenses.
- Required fields and backend validation.
- Monthly and category filters.
- Monthly total, category breakdown, and a separate budget for each month.
- Responsive layout, empty states, and error messages.
- Currency converter retrieving actual reference rates from Frankfurter, with the rate date and source shown.
- Behavioral API tests and a CI workflow that produces a downloadable application ZIP.

## Understand the code

| File | Responsibility |
| --- | --- |
| `public/index.html` | Page layout and forms |
| `public/styles.css` | Responsive visual design |
| `public/app.js` | UI events, filtering, and rendering |
| `public/api.js` | HTTP requests to the server — link this file for the assignment |
| `exchange_rates.py` | Fetches reference rates from the external Frankfurter API — link this for external information access |
| `server.py` | API routes, validation, SQLite persistence, static assets |
| `tests/test_server.py` | API and persistence regression tests |
| `scripts/build.py` | Compile-check and package a release ZIP |
| `.github/workflows/build.yml` | Automated tests, JavaScript syntax checks, and build artifact |
| `TASKS.md` | Public task-list candidate and 12 future build milestones |

## Tests and build

```sh
python3 -m unittest discover -s tests -v
python3 scripts/build.py
```

If Node.js is installed, also check frontend syntax:

```sh
node --input-type=module --check < public/api.js
node --input-type=module --check < public/app.js
```

The build writes `dist/expense-tracker.zip`. This is a packaged Python web app, not a standalone executable: the extracted app still requires Python. The ZIP includes source, assets, instructions, tests, and workflow, but excludes user data. CI does not deploy the server.

## GitHub and the assignment

Repository: [Astarosa-MM/expense-tracker](https://github.com/Astarosa-MM/expense-tracker).
Public task board: [Expense Tracker on Trello](https://trello.com/b/zghz0CFp/expense-tracker).
Build history: [GitHub Actions](https://github.com/Astarosa-MM/expense-tracker/actions).

Changes are developed on a feature branch and proposed in a pull request. Check the branch or PR when viewing new files until merged. Each push triggers a test and package build; multiple commits pushed together normally produce a single run. Record at least 10 successful runs for meaningful changes. See `VERIFICATION.md` for local checks and the board mapping.

The new external information feature works even when Penny runs locally:

1. Enter an amount and select EUR, GBP, CAD, JPY, AUD, or MXN.
2. Click **Get exchange rate**.
3. `public/api.js` calls `/api/exchange-rates/EUR` (or the selected currency).
4. `server.py` calls `exchange_rates.py`, which makes an HTTPS request to Frankfurter.
5. The browser shows the USD estimate, actual source rate, and rate date.

Only the currency pair is sent to the external API. No expense descriptions or amounts are sent to Frankfurter. There is an eight-second request timeout; provider errors produce a retry message without breaking expense tracking. Rates are reference estimates; expenses stay in USD.

Suggested assignment server description:

> Penny retrieves current reference exchange rates from the remote Frankfurter API through its Python backend and displays USD conversion estimates with the source date. The external HTTPS request is implemented in exchange_rates.py, while public/api.js connects the browser to the backend.

Link to `exchange_rates.py` in the GitHub branch containing these changes. After merging, its URL is `https://github.com/Astarosa-MM/expense-tracker/blob/main/exchange_rates.py`.

This demonstrates accessing information from a remote service. Hosting Penny itself on a remote server is a separate step if your instructor also requires a publicly deployed app. Confirm the rubric's exact expectation.

## Remote hosting

The included Dockerfile starts Gunicorn and serves both the UI and API from the same origin. On a Docker host:

```sh
docker build -t penny .
docker run --rm -p 8000:8000 -v penny-data:/data penny
```

For a remote container service, configure its port to match `PORT` (default 8000), attach persistent storage at `/data`, and use one application instance with this SQLite setup. Without a persistent volume, data may disappear on redeploy. `DATABASE_PATH` can point to another persistent directory. Use the host's HTTPS app URL; `public/api.js` uses relative requests, so it needs no hardcoded server address. Verify create, refresh, edit, delete, and persistence after restarting the remote service before submitting.

This is a shared, unauthenticated demo. Anyone with access can view or modify the same records. Use fictional data; user accounts and private financial records are outside this sample's scope. Python's built-in local server is for development; the container uses Gunicorn for hosting.

CI reference: [GitHub's Python build and test documentation](https://docs.github.com/en/actions/tutorials/build-and-test-code/python).

External API documentation: [Frankfurter](https://frankfurter.dev/).
