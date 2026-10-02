import unittest
from server import create_app
class ScaffoldTests(unittest.TestCase):
    def test_health(self):
        statuses=[]
        result=create_app()({'PATH_INFO':'/api/health'},lambda status,headers: statuses.append(status))
        self.assertEqual(statuses,['200 OK'])
        self.assertEqual(b''.join(result),b'{"status":"ok"}')
