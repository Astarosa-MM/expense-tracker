import io
import tempfile
from pathlib import Path
import unittest
from server import create_app
class HealthTests(unittest.TestCase):
    def test_health(self):
        with tempfile.TemporaryDirectory() as temp:
            statuses=[]
            result=create_app(Path(temp)/'db.sqlite3')({'PATH_INFO':'/api/health','REQUEST_METHOD':'GET'},lambda s,h: statuses.append(s))
            self.assertEqual(statuses,['200 OK'])
            self.assertIn(b'"ok"',b''.join(result))
