const response = await fetch('/api/health'); const data = await response.json(); document.getElementById('status').textContent = `Backend connected: ${data.status}`;
