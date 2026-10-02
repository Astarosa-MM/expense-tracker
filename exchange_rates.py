"""Fetch actual external reference rates; no expense data is sent to the provider."""
from datetime import date
import json
import math
from urllib.error import URLError
from urllib.request import Request, urlopen

CURRENCIES = ('EUR', 'GBP', 'CAD', 'JPY', 'AUD', 'MXN')


class RateUnavailable(Exception):
    pass


def fetch_rate(currency):
    if currency not in CURRENCIES:
        raise ValueError('Choose a supported currency.')
    url = f'https://api.frankfurter.dev/v2/rate/{currency.lower()}/usd'
    request = Request(url, headers={'Accept': 'application/json', 'User-Agent': 'PennyClassroomDemo/1.0'})
    try:
        with urlopen(request, timeout=8) as response:
            data = json.loads(response.read(65536))
        rate = data['rate']
        if (type(rate) not in (int, float) or not math.isfinite(rate) or rate <= 0
                or data['base'] != currency or data['quote'] != 'USD'):
            raise ValueError('Invalid rate response')
        rate_date = date.fromisoformat(data['date']).isoformat()
        return {'base': currency, 'quote': 'USD', 'rate': rate, 'date': rate_date,
                'source': 'Frankfurter', 'source_url': url}
    except (URLError, OSError, ValueError, KeyError, TypeError) as error:
        raise RateUnavailable('Exchange rates are unavailable. Try again shortly.') from error
