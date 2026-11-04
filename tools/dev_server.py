import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RENDERS = ROOT / "design" / "renders"
PORT = int(os.environ.get("PORT", 5199))


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_POST(self):
        name = Path(self.path).name
        if not name.endswith(".jpg"):
            self.send_error(400, "expected a .jpg name")
            return
        body = self.rfile.read(int(self.headers["Content-Length"]))
        RENDERS.mkdir(parents=True, exist_ok=True)
        (RENDERS / name).write_bytes(body)
        self.send_response(204)
        self.end_headers()


if __name__ == "__main__":
    print(f"serving {ROOT} on http://localhost:{PORT}")
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
