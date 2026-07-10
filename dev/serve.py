#!/usr/bin/env python3
"""Dev server: plain static hosting with caching disabled, so edited JS/CSS
is never mixed with a stale cached copy (the blank-screen failure mode)."""
import http.server
import sys


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        self.send_header('Expires', '0')
        super().end_headers()


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8642
    http.server.ThreadingHTTPServer(('127.0.0.1', port), NoCacheHandler).serve_forever()
