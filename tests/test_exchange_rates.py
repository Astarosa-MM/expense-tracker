import json
from unittest.mock import patch, MagicMock
from urllib.error import URLError
import test_server
from exchange_rates import fetch_rate, RateUnavailable
import unittest


class RateTests(unittest.TestCase):
    def response(self, payload):
        response = MagicMock()
        response.__enter__.return_value.read.return_value = json.dumps(payload).encode()
        return response

    def test_real_request_contract(self):
        payload = {'base': 'EUR', 'quote': 'USD', 'date': '2026-10-01', 'rate': 1.17}
        with patch('exchange_rates.urlopen', return_value=self.response(payload)) as fetch:
            result = fetch_rate('EUR')
        self.assertEqual(result['rate'], 1.17)
        self.assertEqual(result['date'], '2026-10-01')
        self.assertEqual(fetch.call_args.args[0].full_url, 'https://api.frankfurter.dev/v2/rate/eur/usd')
        self.assertEqual(fetch.call_args.kwargs['timeout'], 8)

    def test_unsupported_currency_never_calls_provider(self):
        with patch('exchange_rates.urlopen') as fetch:
            with self.assertRaises(ValueError):
                fetch_rate('ZZZ')
            fetch.assert_not_called()

    def test_provider_failure(self):
        with patch('exchange_rates.urlopen', side_effect=URLError('offline')):
            with self.assertRaises(RateUnavailable):
                fetch_rate('EUR')

    def test_invalid_provider_data(self):
        for patch_data in [{'rate': -1}, {'rate': float('nan')}, {'rate': True}, {'quote': 'GBP'}, {'date': 'invalid'}]:
            payload = {'base': 'EUR', 'quote': 'USD', 'date': '2026-10-01', 'rate': 1.17, **patch_data}
            with self.subTest(payload=payload), patch('exchange_rates.urlopen', return_value=self.response(payload)):
                with self.assertRaises(RateUnavailable):
                    fetch_rate('EUR')


class RateRouteTests(unittest.TestCase):
    setUp = test_server.ExpenseTests.setUp
    request = test_server.ExpenseTests.request
    def test_rate_route(self):
        with patch('server.fetch_rate', return_value={'base': 'EUR', 'quote': 'USD', 'rate': 1.17}):
            self.assertEqual(self.request('GET', '/api/exchange-rates/EUR')[1]['rate'], 1.17)

    def test_rate_failure_preserves_expense_access(self):
        with patch('server.fetch_rate', side_effect=RateUnavailable('Please retry.')):
            self.assertEqual(self.request('GET', '/api/exchange-rates/EUR')[0], 502)
        self.assertEqual(self.request('POST', '/api/expenses', self.expense)[0], 201)

    def test_unsupported_currency_route(self):
        self.assertEqual(self.request('GET', '/api/exchange-rates/ZZZ')[0], 400)
