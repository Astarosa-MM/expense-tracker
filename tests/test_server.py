import io
import json
from pathlib import Path
import tempfile
import unittest
from server import create_app


class ExpenseTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.path = Path(self.temp.name) / 'test.sqlite3'
        self.app = create_app(self.path)
        self.expense = {'description': 'Lunch', 'amount_cents': 1250, 'category': 'Food', 'date': '2026-10-01'}

    def request(self, method, path, data=None):
        raw = json.dumps(data).encode() if data is not None else b''
        env = {'REQUEST_METHOD': method, 'PATH_INFO': path, 'CONTENT_TYPE': 'application/json',
               'CONTENT_LENGTH': str(len(raw)), 'wsgi.input': io.BytesIO(raw)}
        result = {}
        def start(status, headers):
            result['status'] = int(status.split()[0])
            result['headers'] = dict(headers)
        response = b''.join(self.app(env, start))
        return result['status'], json.loads(response) if result['headers']['Content-Type'] == 'application/json' else response

    def test_create_read_update_delete(self):
        status, row = self.request('POST', '/api/expenses', self.expense)
        self.assertEqual(status, 201)
        self.assertEqual(self.request('GET', '/api/expenses')[1], [row])
        updated = {**self.expense, 'amount_cents': 990}
        self.assertEqual(self.request('PUT', f'/api/expenses/{row["id"]}', updated)[1]['amount_cents'], 990)
        self.assertEqual(self.request('DELETE', f'/api/expenses/{row["id"]}')[0], 200)
        self.assertEqual(self.request('GET', '/api/expenses')[1], [])

    def test_persists_after_app_restart(self):
        self.request('POST', '/api/expenses', self.expense)
        self.app = create_app(self.path)
        self.assertEqual(len(self.request('GET', '/api/expenses')[1]), 1)

    def test_invalid_amounts_are_rejected(self):
        for amount in [0, -1, 12.5, True, '1250', None, 100000001]:
            with self.subTest(amount=amount):
                self.assertEqual(self.request('POST', '/api/expenses', {**self.expense, 'amount_cents': amount})[0], 400)
        self.assertEqual(self.request('GET', '/api/expenses')[1], [])

    def test_invalid_fields_are_rejected(self):
        for patch in [{'description': ' '}, {'description': 'a' * 121}, {'category': 'Unknown'}, {'date': '2026-02-30'}, {'date': '20261001'}]:
            with self.subTest(patch=patch):
                self.assertEqual(self.request('POST', '/api/expenses', {**self.expense, **patch})[0], 400)

    def test_missing_expense(self):
        self.assertEqual(self.request('DELETE', '/api/expenses/123')[0], 404)
        self.assertEqual(self.request('PUT', '/api/expenses/123', self.expense)[0], 404)

    def test_monthly_budgets_and_zero_budget(self):
        self.assertIsNone(self.request('GET', '/api/budgets/2026-10')[1]['amount_cents'])
        for value in [25000, 0]:
            self.assertEqual(self.request('PUT', '/api/budgets/2026-10', {'amount_cents': value})[0], 200)
            self.assertEqual(self.request('GET', '/api/budgets/2026-10')[1]['amount_cents'], value)
        self.assertIsNone(self.request('GET', '/api/budgets/2026-11')[1]['amount_cents'])
        self.assertEqual(self.request('GET', '/api/budgets/2026-13')[0], 400)

    def test_database_and_source_not_public(self):
        for path in ['/data/expenses.sqlite3', '/server.py', '/../server.py']:
            self.assertEqual(self.request('GET', path)[0], 404)
        self.assertIn(b'Penny', self.request('GET', '/')[1])

    def test_sql_and_html_are_stored_as_plain_data(self):
        text = "<script>alert(1)</script>'; DROP TABLE expenses;--"
        self.request('POST', '/api/expenses', {**self.expense, 'description': text})
        self.assertEqual(self.request('GET', '/api/expenses')[1][0]['description'], text)

    def test_health(self):
        self.assertEqual(self.request('GET', '/api/health'), (200, {'status': 'ok'}))


if __name__ == '__main__':
    unittest.main()
