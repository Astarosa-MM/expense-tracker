"""Small expense tracker: WSGI API, SQLite storage, and a same-origin frontend."""
import json
import mimetypes
import os
from datetime import date
from pathlib import Path
import re
import sqlite3
from wsgiref.simple_server import make_server

ROOT = Path(__file__).resolve().parent
CATEGORIES = ('Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Other')


def create_app(db_path=None):
    database = Path(db_path or os.environ.get('DATABASE_PATH', ROOT / 'data' / 'expenses.sqlite3'))
    database.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(database) as db:
        db.executescript('''
            CREATE TABLE IF NOT EXISTS expenses (
                id INTEGER PRIMARY KEY, description TEXT NOT NULL,
                amount_cents INTEGER NOT NULL CHECK(amount_cents > 0),
                category TEXT NOT NULL, date TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS budgets (
                month TEXT PRIMARY KEY, amount_cents INTEGER NOT NULL);
        ''')

    def app(environ, start_response):
        def respond(status, body, content_type='application/json'):
            data = json.dumps(body).encode() if content_type == 'application/json' else body
            start_response(status, [('Content-Type', content_type), ('Content-Length', str(len(data))),
                                    ('X-Content-Type-Options', 'nosniff'), ('Cache-Control', 'no-store')])
            return [data]

        def body():
            if environ.get('CONTENT_TYPE', '').split(';')[0] != 'application/json':
                raise ValueError('Send JSON data.')
            length = int(environ.get('CONTENT_LENGTH') or 0)
            if not 0 < length <= 10000:
                raise ValueError('Request body is missing or too large.')
            data = json.loads(environ['wsgi.input'].read(length))
            if not isinstance(data, dict):
                raise ValueError('Expected a JSON object.')
            return data

        def cents(value, allow_zero=False):
            if type(value) is not int or not (0 if allow_zero else 1) <= value <= 100000000:
                raise ValueError('Amount must be whole cents between %s and 100000000.' % (0 if allow_zero else 1))
            return value

        def expense(data):
            description = data.get('description')
            category = data.get('category')
            day = data.get('date')
            if not isinstance(description, str) or not 1 <= len(description.strip()) <= 120:
                raise ValueError('Description must contain 1–120 characters.')
            if category not in CATEGORIES:
                raise ValueError('Choose a valid category.')
            if not isinstance(day, str) or not re.fullmatch(r'\d{4}-\d{2}-\d{2}', day):
                raise ValueError('Use a date in YYYY-MM-DD format.')
            date.fromisoformat(day)
            return description.strip(), cents(data.get('amount_cents')), category, day

        path = environ.get('PATH_INFO', '/')
        method = environ['REQUEST_METHOD']
        try:
            with sqlite3.connect(database) as db:
                db.row_factory = sqlite3.Row
                if path == '/api/health' and method == 'GET':
                    return respond('200 OK', {'status': 'ok'})
                if path == '/api/expenses':
                    if method == 'GET':
                        return respond('200 OK', [dict(row) for row in db.execute('SELECT * FROM expenses ORDER BY date DESC, id DESC')])
                    if method == 'POST':
                        values = expense(body())
                        cursor = db.execute('INSERT INTO expenses(description,amount_cents,category,date) VALUES(?,?,?,?)', values)
                        return respond('201 Created', dict(db.execute('SELECT * FROM expenses WHERE id=?', (cursor.lastrowid,)).fetchone()))
                match = re.fullmatch(r'/api/expenses/(\d+)', path)
                if match and method in ('PUT', 'DELETE'):
                    expense_id = int(match[1])
                    if not db.execute('SELECT id FROM expenses WHERE id=?', (expense_id,)).fetchone():
                        return respond('404 Not Found', {'error': 'Expense not found.'})
                    if method == 'DELETE':
                        db.execute('DELETE FROM expenses WHERE id=?', (expense_id,))
                        return respond('200 OK', {'deleted': expense_id})
                    values = expense(body())
                    db.execute('UPDATE expenses SET description=?,amount_cents=?,category=?,date=? WHERE id=?', (*values, expense_id))
                    return respond('200 OK', dict(db.execute('SELECT * FROM expenses WHERE id=?', (expense_id,)).fetchone()))
                match = re.fullmatch(r'/api/budgets/(\d{4}-\d{2})', path)
                if match and method in ('GET', 'PUT'):
                    month = match[1]
                    date.fromisoformat(month + '-01')
                    if method == 'PUT':
                        amount = cents(body().get('amount_cents'), allow_zero=True)
                        db.execute('INSERT INTO budgets VALUES(?,?) ON CONFLICT(month) DO UPDATE SET amount_cents=excluded.amount_cents', (month, amount))
                    row = db.execute('SELECT amount_cents FROM budgets WHERE month=?', (month,)).fetchone()
                    return respond('200 OK', {'month': month, 'amount_cents': row[0] if row else None})
                if path.startswith('/api/'):
                    return respond('404 Not Found', {'error': 'API route or method not found.'})
                # Explicit allowlist prevents database/source downloads and path traversal.
                assets = {'/': 'index.html', '/styles.css': 'styles.css', '/app.js': 'app.js', '/api.js': 'api.js'}
                if method == 'GET' and path in assets:
                    asset = ROOT / 'public' / assets[path]
                    return respond('200 OK', asset.read_bytes(), mimetypes.guess_type(asset.name)[0] or 'application/octet-stream')
                return respond('404 Not Found', {'error': 'Not found.'})
        except (ValueError, TypeError, UnicodeDecodeError) as error:
            return respond('400 Bad Request', {'error': str(error)})
        except sqlite3.Error:
            return respond('503 Service Unavailable', {'error': 'Storage unavailable. Please try again.'})
    return app


if __name__ == '__main__':
    port = int(os.environ.get('PORT', '8000'))
    host = os.environ.get('HOST', '127.0.0.1')
    with make_server(host, port, create_app()) as server:
        print(f'Expense tracker running at http://{host}:{port}', flush=True)
        server.serve_forever()
