from pathlib import Path
from wsgiref.simple_server import make_server
import json
import mimetypes
import os
ROOT = Path(__file__).resolve().parent

def create_app(db_path=None):
    def app(environ,start_response):
        path=environ.get('PATH_INFO','/')
        assets={'/':'index.html','/app.js':'app.js','/api.js':'api.js','/styles.css':'styles.css'}
        if path == '/api/health':
            data=b'{"status":"ok"}'; content_type='application/json'; status='200 OK'
        elif path in assets:
            asset=ROOT/'public'/assets[path]
            data=asset.read_bytes(); content_type=mimetypes.guess_type(asset.name)[0]; status='200 OK'
        else:
            data=b'Not found'; content_type='text/plain'; status='404 Not Found'
        start_response(status,[('Content-Type',content_type),('Content-Length',str(len(data)))])
        return [data]
    return app

if __name__=='__main__':
    with make_server('127.0.0.1',int(os.environ.get('PORT','8000')),create_app()) as server:
        server.serve_forever()
