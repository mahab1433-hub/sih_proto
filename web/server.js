/**
 * Zero-dependency HTTP static server for local host interactive mobile testing
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const PUBLIC_DIR = path.join(__dirname);

const server = http.createServer((req, res) => {
  let filePath = path.join(PUBLIC_DIR, req.url === '/' ? 'index.html' : req.url);

  // Security check: ensure path is within PUBLIC_DIR
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Default to index.html for SPA routing
      fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (errIndex, dataIndex) => {
        if (errIndex) {
          res.writeHead(404);
          res.end('Not Found');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(dataIndex);
        }
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml',
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
    });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🚀 COLORIMETRIC FIELD-TEST RUNNING ON LOCALHOST!`);
  console.log(`👉 Open: http://localhost:${PORT}`);
  console.log(`=======================================================`);
});
