const http = require('http');
const fs = require('fs');
const path = require('path');

function formatTime() {
  const now = new Date();
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).format(now);
}

function formatLabel() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    timeZoneName: 'short'
  }).formatToParts(now);

  let tzName = 'CDT';
  for (const part of parts) {
    if (part.type === 'timeZoneName') {
      tzName = part.value;
      break;
    }
  }
  return `Chicago • ${tzName}`;
}

function buildSvg() {
  const time = formatTime();
  const label = formatLabel();

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="300" viewBox="0 0 800 300">
  <defs>
    <clipPath id="roundedClip">
      <rect x="0" y="0" width="800" height="300" rx="24" ry="24" />
    </clipPath>
  </defs>

  <image href="/background.svg"
         x="0" y="0" width="800" height="300"
         preserveAspectRatio="xMidYMid slice"
         clip-path="url(#roundedClip)" />

  <rect width="100%" height="100%" rx="24" fill="rgba(15,23,42,0.02)" />

  <text x="400" y="100" text-anchor="middle"
        font-family="Segoe UI, Arial, sans-serif"
        font-size="64"
        font-weight="600"
        fill="#f8fafc">${label}</text>

  <text x="400" y="250" text-anchor="middle"
        font-family="Segoe UI, Arial, sans-serif"
        font-size="140"
        font-weight="700"
        fill="#f8fafc">${time}</text>
</svg>`;
}

const server = http.createServer((req, res) => {
  const urlPath = req.url === '/' ? '/clock.svg' : req.url;
  const safePath = path.normalize(urlPath).replace(/^\/+/, '');

  if (safePath === 'clock.svg') {
    res.writeHead(200, { 'Content-Type': 'image/svg+xml; charset=utf-8' });
    res.end(buildSvg());
    return;
  }

  if (safePath === 'background.svg') {
    const filePath = path.join(__dirname, 'background.svg');
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'image/svg+xml; charset=utf-8' });
      res.end(data);
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
