import http.server
import socketserver
import webbrowser
import os

PORT = 8000
DIRECTORY = "game"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

print(f"Starting server at http://localhost:{PORT}")
print("Opening game in browser...")

# Open the browser
webbrowser.open(f"http://localhost:{PORT}")

# Start the server
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print("Server running. Press Ctrl+C to stop.")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
